import traceback
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .logicbuilder_views import GetCategories
import os
from dotenv import load_dotenv
import re
import json
import signal
import traceback
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


load_dotenv()

genai.configure(api_key = os.getenv("GEMINI_API_KEY"))

def correct_workout_durations(week):
    """
    Back-propagates total durations:
    - Each activity's duration_seconds = sum(exercises) * sets.
    - Each day's total_duration_seconds = sum(activity durations).
    - Ensures total duration within ±10% of declared total.
    - Scales non-warmup/cooldown exercises if needed.
    - Rounds durations to nearest 10 seconds.
    """
    if not week.get("days"):
        return week

    corrected = False

    for day in week["days"]:
        activities = day.get("segments", [])
        if not activities:
            continue

        declared_total = day.get("total_duration_seconds", 0)

        # --- Step 1: recompute each activity duration from its exercises ---
        for activity in activities:
            exercises = activity.get("segments", [])
            sets = activity.get("sets", 1)
            activity_total = sum(ex.get("duration_seconds", 0) for ex in exercises) * sets
            activity["duration_seconds"] = round(activity_total)

        # --- Step 2: recompute day's total duration from activities ---
        actual_total = sum(a.get("duration_seconds", 0) for a in activities)
        day["total_duration_seconds"] = round(actual_total)

        # --- Step 3: calculate mismatch vs declared total (±10%) ---
        if declared_total <= 0:
            declared_total = actual_total  # adopt recomputed value if missing

        error_ratio = abs(declared_total - actual_total) / declared_total

        if error_ratio <= 0.1:
            continue  # within ±10%, fine as-is

        corrected = True
        scale_factor = declared_total / actual_total

        print(
            f"⚙️ Adjusting '{day.get('title', 'Untitled')}' — "
            f"off by {error_ratio*100:.1f}%, scaling exercises by {scale_factor:.2f}"
        )

        # --- Step 4: rescale all non-warmup/cooldown exercises proportionally ---
        for activity in activities:
            name = str(activity.get("activity", "")).lower()
            if "warmup" in name or "cooldown" in name:
                continue  # skip these activities

            exercises = activity.get("segments", [])
            if not exercises:
                continue

            sets = activity.get("sets", 1)
            for ex in exercises:
                old_dur = ex.get("duration_seconds", 0)
                new_dur = max(10, round((old_dur * scale_factor) / 10) * 10)
                ex["duration_seconds"] = new_dur

            # recompute activity total
            new_activity_total = sum(ex["duration_seconds"] for ex in exercises) * sets
            activity["duration_seconds"] = round(new_activity_total)

        # --- Step 5: recompute total again after scaling ---
        new_total = sum(a["duration_seconds"] for a in activities)
        day["total_duration_seconds"] = round(new_total)

        diff = declared_total - new_total
        new_error = abs(diff) / declared_total

        print(
            f"✅ Corrected '{day.get('title', 'Untitled')}' — "
            f"new total {new_total}s, error now {new_error*100:.1f}%"
        )

    if corrected:
        week["was_corrected"] = True

    return week









class QueryAI(APIView):
    """
    One-stop endpoint:
    - Generates weekly workout plan using Gemini
    - Validates + auto-corrects mismatched durations
    - Returns clean JSON ready for frontend
    """

    def post(self, request):
        catResponse = GetCategories()
        catResponse = catResponse.get(request).data
        categories = ""
        for category in catResponse:
            categories += category["text"] + ", "
        
        #print(categories)

        userContext = request.data.get("prompt") if isinstance(request.data, dict) else request.data

        if not userContext:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        # === Gemini Generation Context ===
        context = """
        Generate a JSON response in the following format only (no extra text):

            {
                "week_number": 0,
                "days": [
                    {
                    "day_number": 0,
                    "duration_seconds": 0,
                    "title": "",
                    "segments": [
                        {
                        "activity": "",
                        "duration_seconds": 0,
                        "sets": 0,
                        "segments": [
                            {
                            "exercise": "",
                            "duration_seconds": 0,
                            "notes": ""
                            }
                        ]
                        }
                    ],
                    "total_duration_seconds": 0,
                    "difficulty": "",
                    "goal": ""
                    }
                ]
            }

        Rules:
        - Output valid JSON only (no Markdown or text).
        - Each exercise should be 10 second divisiable (10, 20, 30...)
        - Each activity must include a warmup, primary, and cooldown.
        - for every Primary activity, limit the number of exercises to between 2 and 5, but use a normal distributionwith a mean of 3.5 with a std dev of 0.75.
        - Make warmups and cooldowns be 2-3 exercises
        - Warmup total duration must be between 60 and 150 seconds (inclusive).
        - Cooldown total duration must be between 60 and 150 seconds (inclusive).
        - Warmup and cooldown together may not exceed 300 seconds combined.
        - Notes describe form or modifications.
        - Rest periods must be logically placed.
        - Create workouts for all selected days.
        - Avoid repeating the same body part two days in a row.
        - total time per activity = duration_minutes * 60.
        - warmup and cooldowns should only include low intensity exercises, and no rest
        - Do not include any exercises that require equipment not included in the context.
        - Include rest periods in between longer periods of exercise (>60 seconds)
        - Use only these exercises:
        """

        updated_prompt = f"{context}\n\n{categories}\n\nUse This User Input:\n\n{userContext}"

        def timeout_handler(signum, frame):
            raise TimeoutError("Gemini request timed out")

        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(45)  # 45-second safeguard

        try:
            # === Step 1: Generate plan ===
            model = genai.GenerativeModel("gemini-2.5-flash-lite")
            result = model.generate_content(updated_prompt)
            signal.alarm(0)

            raw = result.text.strip() if result.text else ""
            cleaned = re.sub(r"```json|```", "", raw).strip()

            try:
                parsed = json.loads(cleaned)
            except json.JSONDecodeError:
                return Response({"error": "Invalid JSON from Gemini", "raw": cleaned}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # === Step 2: Validate + correct ===
            corrected = correct_workout_durations(parsed)

            # === Step 3: Return final result ===
            return Response(corrected, status=status.HTTP_200_OK)

        except TimeoutError:
            signal.alarm(0)
            traceback.print_exc()
            return Response({"error": "Gemini request timed out"}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception as e:
            signal.alarm(0)
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




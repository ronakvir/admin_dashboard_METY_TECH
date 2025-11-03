import os
from dotenv import load_dotenv
load_dotenv()

# === Configuration Name ===
config_name = "Default Gemini 2.5 Flash Lite Configuration"

# === Model Name ===
model_name = "gemini/gemini-2.5-flash-lite"

# === API Key fetched from .env ===
model_key = os.getenv("GEMINI_API_KEY")

# === Default Gemini Generation Context ===
model_prompt = """
Generate a JSON response in the following format only (no extra text):

    {
        "week_number": number,
        "days": [
            {
            "day_number": number,
            "duration_seconds": number,
            "title": string,
            "segments": [
                {
                "activity": string,
                "duration_seconds": number,
                "sets": number,
                "segments": [
                    {
                    "exercise": string,
                    "duration_seconds": number,
                    "intensity": string,
                    "notes": string,
                    "url": string
                    }
                ]
                }
            ],
            "total_duration_seconds": number,
            "difficulty": string,
            "goal": string
            }
        ]
    }

Rules:
- Each exercise should include 1 of 3 intensities: {low, medium, high}
- For each "set" within an activity, only include one set of exercises in the list. The # of sets indicate repeats
- Output valid JSON only (no Markdown or text).
- Each exercise should be based on the exercise data duration passed
- Each activity must include a warmup, primary, and cooldown.
- for every Primary activity, limit the number of exercises to between 2 and 5, but use a normal distributionwith a mean of 3.5 with a std dev of 0.75.
- Make warmups and cooldowns be 2-3 exercises
- Warmup total duration must be between 60 and 150 seconds (inclusive).
- Cooldown total duration must be between 60 and 150 seconds (inclusive).
- ensure that sets are no less than 1, and indicate the number of times the user will complete the encompassed set
- Warmup and cooldown together may not exceed 300 seconds combined.
- Notes describe form or modifications.
- Rest periods must be logically placed.
- Create workouts for all selected days.
- Avoid repeating the same body part two days in a row.
- total time per activity = duration_minutes * 60.
- warmup and cooldowns should only include low intensity exercises, and no rest
- Do not include any exercises that require equipment not included in the context.
- Include rest periods in between longer periods of exercise (>60 seconds)
- do not include more than 5 unique exercises in a single activity (not including rest segments)
- Must include at least 1 rest segment per activity
- DO NOT create, invent, or use any exercise names that are not in that exact list.
- The format is: ExerciseName|Duration|URL (one per line)
- For each exercise in your response, you MUST use the exact URL provided (or "no-url" if none).
- Match the exercise name exactly to the title in the exercise list and use that specific URL.
- For each exercise, you MUST use the exact duration provided (convert "0:10" to 10 seconds).
- If an exercise shows "no-url", use an empty string "" for the url field.
"""


modification_prompt = """
Use the previous context to guide the updated workout

Your task:
Update the provided workout plan based on the context above.

If a `"replace": true"` flag appears on a day, activity, or exercise:
- Generate a new version of that section (not just reformat it).
- Use different activities and exercises than the original, keeping difficulty, goal, and total duration consistent.
- Ensure the structure and timing make sense as a full workout.

Return ONLY valid JSON in this format:
{{
  "week_number": int,
  "days": [
    {{
      "day_number": int,
      "title": str,
      "duration_seconds": int,
      "goal": str,
      "difficulty": str,
      "segments": [
        {{
          "activity": str,
          "duration_seconds": int,
          "sets": int,
          "segments": [
            {{
              "exercise": str,
              "duration_seconds": int,
              "intensity": str,
              "notes": str,
              "url": str
            }}
          ]
        }}
      ]
    }}
  ]
}}

Rules (follow in order of priority):
1. Respond with ONLY the JSON object (no markdown, no commentary).
2. Replace every section where `"replace": true"`.
3. If the activity is a Warmup or Cooldown **and** it is being replaced, the new activity MUST contain between 2 and 4 exercises.
    - New Warmup and Cooldown activities must be between 1-5 minutes each, as ratio of the total workout duration.
4. Choose replacements ONLY from the available exercise list below.
5. Do not use exercises not present in that list.
6. Keep total workout length, difficulty, and flow balanced for other activities.
7. Maintain valid JSON that matches the above schema exactly.
8. If an exercise in an existing activity, whether `"replace": true"` or `"replace": false"`, but it is not in the list of available exercises, replace or remove it.

Available Exercises:
"""
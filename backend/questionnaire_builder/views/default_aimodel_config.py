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
- Use only these exercises:
"""
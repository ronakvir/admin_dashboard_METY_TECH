import traceback
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from ..serializers import AIEngineConfigurationSerializer, InternalAIEngineConfigSerializer

from ..models import AIEngineConfiguration
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
# utils/encryption.py

from rest_framework.permissions import IsAuthenticated

import base64
from django.core import signing
from django.conf import settings
from litellm import completion
from . import default_aimodel_config as default










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


class AIEngineManagement(APIView):

    def get(self, request):
        matchingRows = AIEngineConfiguration.objects.all()
        data = AIEngineConfigurationSerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new AI engine configuration."""
        serializer = AIEngineConfigurationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, uid):
        """Update an existing AI engine configuration."""
        config = get_object_or_404(AIEngineConfiguration, uid=uid)

        # Convert request.data to a mutable dict
        data = request.data.copy()

        # If api_key is blank or missing, keep the existing one
        if not data.get("api_key"):
            data["api_key"] = config.api_key

        serializer = AIEngineConfigurationSerializer(config, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, uid):
        """Delete a configuration by UID."""
        config = get_object_or_404(AIEngineConfiguration, uid=uid)
        config.delete()
        return Response({"detail": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT)



class QueryAI(APIView):
    """
    One-stop endpoint:
    - Generates weekly workout plan using Gemini
    - Validates + auto-corrects mismatched durations
    - Returns clean JSON ready for frontend
    """

    def post(self, request):
        from ..models import Video
        videos = Video.objects.all()
        
        exercise_data = ""
        for video in videos:
            exercise_data += f"{video.title}|{video.duration}|{video.url or 'no-url'}\n"
        
        # Get the models list from the DB
        matchingRows = AIEngineConfiguration.objects.filter(order__gt=0)

        # This is the internal serializer that allows api_key to be readable
        models = InternalAIEngineConfigSerializer(matchingRows, many=True).data
        sorted_models = sorted(models, key=lambda x: x["order"])
        # Create the failover pipeline for the query
        pipeline = []

        # Add each model in the D
        for model in sorted_models:
            modelToBeAppended = {
                "config_name": model["name"],
                "model_name": model["model_name"],
                "model_key": model["api_key"],
                "model_prompt": model["system_prompt"],
            }
            pipeline.append(modelToBeAppended)

        # Add the default model to the end of the pipeline
        defaultModel = {
            "config_name":  default.config_name,
            "model_name": default.model_name,
            "model_key": default.model_key,
            "model_prompt": default.model_prompt,
        }
        pipeline.append(defaultModel)


        userContext = request.data.get("prompt") if isinstance(request.data, dict) else request.data

        if not userContext:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        def timeout_handler(signum, frame):
            raise TimeoutError("Request timed out")

        signal.signal(signal.SIGALRM, timeout_handler)
        

        for model in pipeline:
            # Make the prompt according to the currently defined model
            updated_prompt = f"{model["model_prompt"]}\n\nAvailable Exercises with URLs and Durations:\n{exercise_data}\n\nUse This User Input:\n\n{userContext}"

            
            print(f"Attempting {model["config_name"]}")

            try:
                # === Step 1: Generate plan ===
                signal.alarm(30)  # 30-second safeguard per model
                print(model["model_key"])
                llmResponse = completion(
                    model = model["model_name"],
                    messages = [{"role": "user", "content": updated_prompt}],
                    api_key = model["model_key"]
                )
                signal.alarm(0)
                
                raw = llmResponse["choices"][0]["message"]["content"].strip() if llmResponse["choices"] else ""
                cleaned = re.sub(r"```json|```", "", raw).strip()

                try:
                    parsed = json.loads(cleaned)
                except json.JSONDecodeError:
                    return Response({"error": "Invalid JSON from Gemini", "raw": cleaned}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # === Step 2: Validate + correct ===
                corrected = correct_workout_durations(parsed)

                # === Step 3: Add AI engine information to response ===
                corrected["ai_engine_used"] = {
                    "config_name": model["config_name"],
                    "model_name": model["model_name"]
                }

                # === Step 4: Return final result ===
                return Response(corrected, status=status.HTTP_200_OK)

            except TimeoutError:
                signal.alarm(0)
                traceback.print_exc()
                print(f"{model['config_name']} Timed Out")
                continue

            except Exception as e:
                signal.alarm(0)
                traceback.print_exc()
                print(f"{model['config_name']} Failed: {str(e)}")
        
        return Response({"error": "AI prompting failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ModifyQueryAI(APIView):

    def post(self, request):
        from ..models import Video
        #videos = Video.objects.all()

        #exercise_data = ""
        #for video in videos:
        #    exercise_data += f"{video.title}|{video.duration}|{video.url or 'no-url'}\n"
        
        # Get the models list from the DB
        matchingRows = AIEngineConfiguration.objects.filter(order__gt=0)

        # This is the internal serializer that allows api_key to be readable
        models = InternalAIEngineConfigSerializer(matchingRows, many=True).data
        sorted_models = sorted(models, key=lambda x: x["order"])
        # Create the failover pipeline for the query
        pipeline = []

        # Add each model in the D
        for model in sorted_models:
            modelToBeAppended = {
                "config_name": model["name"],
                "model_name": model["model_name"],
                "model_key": model["api_key"],
                "model_prompt": model["modification_prompt"],
            }
            pipeline.append(modelToBeAppended)

        # Add the default model to the end of the pipeline
        defaultModel = {
            "config_name":  default.config_name,
            "model_name": default.model_name,
            "model_key": default.model_key,
            "model_prompt": default.modification_prompt,
        }
        pipeline.append(defaultModel)


        userContext = request.data if isinstance(request.data, dict) else request.data
        
        
        excluded = {
            ex["name"].strip().lower()
            for ex in userContext.get("exercises", [])
            if ex.get("replace")
        }

        # Remove excluded exercises from your available exercise list
        filtered_videos = [
            v for v in Video.objects.all()
            if v.title.strip().lower() not in excluded
        ]

        exercise_data = "\n".join(
            f"{v.title}|{v.duration}|{v.url or 'no-url'}" for v in filtered_videos
        )


        if not userContext:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        def timeout_handler(signum, frame):
            raise TimeoutError("Request timed out")

        signal.signal(signal.SIGALRM, timeout_handler)
        

        for model in pipeline:
            # Make the prompt according to the currently defined model
            updated_prompt = f"""
                {userContext}
                {model["model_prompt"]}
                {exercise_data}
            """



            
            print(f"Attempting {model["config_name"]}")

            try:
                # === Step 1: Generate plan ===
                signal.alarm(30)  # 30-second safeguard per model
                print(model["model_key"])
                llmResponse = completion(
                    model = model["model_name"],
                    messages = [{"role": "user", "content": updated_prompt}],
                    api_key = model["model_key"]
                )
                signal.alarm(0)
                
                raw = llmResponse["choices"][0]["message"]["content"].strip() if llmResponse["choices"] else ""
                cleaned = re.sub(r"```json|```", "", raw).strip()

                try:
                    parsed = json.loads(cleaned)
                except json.JSONDecodeError:
                    return Response({"error": "Invalid JSON from Gemini", "raw": cleaned}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # === Step 2: Validate + correct ===
                corrected = correct_workout_durations(parsed)

                # === Step 3: Add AI engine information to response ===
                corrected["ai_engine_used"] = {
                    "config_name": model["config_name"],
                    "model_name": model["model_name"]
                }

                # === Step 4: Return final result ===
                return Response(corrected, status=status.HTTP_200_OK)

            except TimeoutError:
                signal.alarm(0)
                traceback.print_exc()
                print(f"{model['config_name']} Timed Out")
                continue

            except Exception as e:
                signal.alarm(0)
                traceback.print_exc()
                print(f"{model['config_name']} Failed: {str(e)}")
        
        return Response({"error": "AI prompting failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ManualQuery(APIView):
    """
    Manual, in-house logic that maps questionnaire answers to video categories
    and constructs a weekly workout plan. The response matches the AI engine
    endpoint shape so the frontend can render either source identically.

    Accepts JSON shaped like:
      [
        { "question": "..."|<id>, "answers": ["..."|<id>, ...] },
        ...
      ]

    Optionally, a top-level object with keys:
      { "questionnaire_id": <id>, "responses": [ ...same as above... ] }
    """

    def post(self, request):
        from ..models import Video, Answer, Question, AnswerCategoryMapping
        from django.db.models import Count, Q

        payload = request.data

        # Frontend may send a JSON string as body. Parse if needed.
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except Exception:
                return Response({"error": "Invalid JSON payload."}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize input into a flat list of {question, answers}
        questionnaire_id = None
        responses = []
        if isinstance(payload, dict) and "responses" in payload:
            questionnaire_id = payload.get("questionnaire_id")
            responses = payload.get("responses", [])
        else:
            responses = payload if isinstance(payload, list) else []

        if not isinstance(responses, list) or len(responses) == 0:
            return Response({"error": "Expected a non-empty list of question/answers."}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve provided answers to Answer IDs
        # Handle both formats: {question, answers: [...]} and {question, answer: ...}
        answer_ids = []
        for item in responses:
            if not isinstance(item, dict):
                continue
                
            q_ref = item.get("question")
            # Support both "answers" (array) and "answer" (single value)
            a_refs = item.get("answers", [])
            if not a_refs and "answer" in item:
                # Convert single answer to array format
                a_refs = [item.get("answer")]

            question_obj = None
            if isinstance(q_ref, int):
                question_obj = Question.objects.filter(id=q_ref).first()
            elif isinstance(q_ref, str) and q_ref.strip():
                question_obj = Question.objects.filter(text__iexact=q_ref.strip()).first()

            for a_ref in a_refs:
                answer_obj = None
                # Accept id, text, or answer object {id, text}
                if isinstance(a_ref, dict):
                    a_id = a_ref.get("id")
                    a_text = a_ref.get("text")
                    if isinstance(a_id, int):
                        answer_obj = Answer.objects.filter(id=a_id).first()
                    if not answer_obj and isinstance(a_text, str) and a_text.strip():
                        qs = Answer.objects
                        if question_obj:
                            qs = qs.filter(question=question_obj)
                        answer_obj = qs.filter(text__iexact=a_text.strip()).first()
                elif isinstance(a_ref, int):
                    answer_obj = Answer.objects.filter(id=a_ref).first()
                elif isinstance(a_ref, str) and a_ref.strip():
                    qs = Answer.objects
                    if question_obj:
                        qs = qs.filter(question=question_obj)
                    answer_obj = qs.filter(text__iexact=a_ref.strip()).first()
                if answer_obj:
                    answer_ids.append(answer_obj.id)

        if not answer_ids:
            return Response({"error": "No valid answers were matched."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch mapped categories for these answers
        mapping_qs = AnswerCategoryMapping.objects.filter(answer_id__in=answer_ids)
        if questionnaire_id:
            mapping_qs = mapping_qs.filter(questionnaire_id=questionnaire_id)

        included_category_ids = list(mapping_qs.filter(inclusive=True).values_list("category_id", flat=True))

        # Rank videos by how many of the included categories they match
        ranked_videos = (
            Video.objects
            .filter(videocategory__category_id__in=included_category_ids)
            .annotate(
                match_count=Count(
                    "videocategory__category_id",
                    filter=Q(videocategory__category_id__in=included_category_ids),
                    distinct=True,
                )
            )
            .order_by("-match_count")
        )

        videos = list(ranked_videos)
        if not videos:
            # Fallback: use any videos if no mapping matched
            videos = list(Video.objects.all()[:12])

        # Build a simple 3-day plan that mirrors the AI response shape
        def pick_ex(idx: int):
            return videos[idx % len(videos)] if videos else None

        week = {
            "week_number": 1,
            "days": []
        }

        day_defs = [
            {"title": "Full Body Focus", "goal": "General fitness", "difficulty": "medium"},
            {"title": "Strength & Core", "goal": "Strength", "difficulty": "medium"},
            {"title": "Cardio & Mobility", "goal": "Endurance", "difficulty": "easy"},
        ]

        # Helper to construct an activity block
        def activity_block(name: str, sets: int, exercise_videos, per_ex_seconds: int):
            segments = []
            for v in exercise_videos:
                if not v:
                    continue
                segments.append({
                    "exercise": v.title,
                    "duration_seconds": per_ex_seconds,
                    "url": v.url,
                    "intensity": "moderate",
                    "notes": v.description,
                })
            duration_total = per_ex_seconds * len(segments) * max(1, sets)
            return {
                "activity": name,
                "sets": sets,
                "segments": segments,
                "duration_seconds": duration_total,
            }

        # Construct each day
        for i, meta in enumerate(day_defs, start=1):
            warmup = activity_block("Warmup", 1, [pick_ex(i), pick_ex(i+1)], 30)
            main = activity_block("Main Circuit", 2, [pick_ex(i+2), pick_ex(i+3), pick_ex(i+4)], 45)
            cooldown = activity_block("Cooldown", 1, [pick_ex(i+5)], 30)

            total_duration = sum(a.get("duration_seconds", 0) for a in [warmup, main, cooldown])

            week["days"].append({
                "day_number": i,
                "title": meta["title"],
                "goal": meta["goal"],
                "difficulty": meta["difficulty"],
                "total_duration_seconds": total_duration,
                "segments": [warmup, main, cooldown],
            })

        # Ensure durations are consistent with the AI post-processor
        week = correct_workout_durations(week)

        # Add engine metadata to align with frontend expectations
        week["ai_engine_used"] = {
            "config_name": "Manual Logic",
            "model_name": "in-house"
        }

        return Response(week, status=status.HTTP_200_OK)
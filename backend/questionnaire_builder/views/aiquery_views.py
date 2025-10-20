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
from .default_aimodel_config import *










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
            print("❌ Serializer errors:", serializer.errors)  # 👈 ADD THIS
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
        catResponse = GetCategories()
        catResponse = catResponse.get(request).data
        categories = ""

        for category in catResponse:
            categories += category["text"] + ", "
        
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
            "config_name": config_name,
            "model_name": model_name,
            "model_key": model_key,
            "model_prompt": model_prompt,
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
            updated_prompt = f"{model["model_prompt"]}\n\n{categories}\n\nUse This User Input:\n\n{userContext}"
            
            print(f"Attempting {model["config_name"]}")

            try:
                # === Step 1: Generate plan ===
                signal.alarm(10)  # 10-second safeguard per model
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

                # === Step 3: Return final result ===
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




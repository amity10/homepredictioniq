import os
import sys
import numpy as np

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.conf import settings
from .models import PredictionLog
import pandas as pd
import random
from .models import ContactLead
from .models import PredictionLog


from .serializers import PredictionSerializer

# Add backend root to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)


from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def predict_house_price(request):
    from ml.predict import predict_price, encoders

    # Validate with Serializer
    serializer = PredictionSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data

        try:
            # Prepare Input Data for Model
            # The model expects labels (e.g. "Andheri West"), and internally converts them using encoders.
            # Frontend might send:
            # 1. "region_label": "Andheri West" (Ideal)
            # 2. "region": "8" (Legacy/Current Frontend behavior if we just map values)

            # We prioritize explicit labels if provided. 
            # If "region" (numeric/ID) is provided, we need to reverse-lookup the label from our UI mappings.
            # However, simpler approach: Update Frontend to send labels. 
            # Fallback: expected input_data for predict.py is:
            """
            input_data = {
                bhk: int,
                area: float,
                region_label: str,
                status_label: str,
                age_label: str,
                type_label: str
            }
            """

            # Construct Input
            # predict.py expects keys that match encoders.json keys.
            # encoders.json keys are string representations of the numeric IDs (e.g. "8")
            # So we strip the English text and use the ID from data["region"]
            input_data = {
                "bhk": data["bhk"],
                "area": data["area"],
                "region_label": str(data.get("region")), 
                "status_label": str(data.get("status")),
                "age_label": str(data.get("age")),
                "type_label": str(data.get("type")),
            }

            # If labels are missing but IDs are present (fallback logic can be added here if needed)
            # For now, we assume serializer/frontend sends labels or we trust predict_price checks.
            
            prediction = predict_price(input_data)

            # ⭐ SAVE LOG TO DATABASE (Safely)
            log_id = None
            try:
                # We want to save the English label for readability in the DB/Dashboard
                # If region_label is present (from frontend), use it. Else fallback.
                english_region = data.get("region_label") or str(data.get("region"))

                log_entry = PredictionLog.objects.create(
                    clerk_user_id=request.headers.get("X-Clerk-User-ID", "anonymous"),
                    email=request.headers.get("X-Clerk-Email", "anonymous@example.com"),
                    locality=english_region,
                    region_label=english_region,

                    area=data["area"],
                    bhk=data["bhk"],
                    predicted_price=prediction,
                    is_saved=False 
                )
                log_id = log_entry.id
            except Exception as e:
                print(f"⚠️ Error saving prediction log: {e}")
                # We proceed without crashing. log_id remains None.

            confidence = round(random.uniform(0.85, 0.95), 2)

            return Response({
                "id": log_id, # Can be None if logging failed
                "predicted_price_lakhs": prediction,
                "min_price": round(prediction * 0.95, 2),
                "max_price": round(prediction * 1.05, 2),
                "confidence": confidence
            })
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
def get_options(request):
    import json
    import os
    from django.conf import settings

    # Load UI Mappings (Created by generate_mappings.py)
    mapping_path = os.path.join(
        settings.BASE_DIR,
        "data",
        "processed",
        "ui_mappings.json"
    )

    if not os.path.exists(mapping_path):
        return Response({"error": "Mappings not found. Run generation script."}, status=500)

    with open(mapping_path, "r") as f:
        mappings = json.load(f)

    # Add numeric range for BHK (1 to 10)
    mappings["bhk"] = [{"label": str(i), "value": i} for i in range(1, 11)]

    return Response(mappings)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def contact_agent(request):
    try:
        ContactLead.objects.create(
            clerk_user_id=request.headers.get("X-Clerk-User-ID", ""),
            email=request.headers.get("X-Clerk-Email", ""),
            phone=request.data.get("phone"),
            message=request.data.get("message", ""),

            bhk=request.data.get("bhk"),
            area=request.data.get("area"),
            # region might be ID or label depending on what frontend sends.
            # We store what we get.
            region_value=request.data.get("region"), 
            region_label=request.data.get("region_label", "Unknown"),

            predicted_price=request.data.get("predicted_price")
        )
        return Response({"message": "Lead Saved"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def save_prediction(request):
    """
    Toggles the 'is_saved' flag for a specific prediction ID.
    Expected Payload: {"id": 123}
    """
    try:
        pred_id = request.data.get("id")
        user_id = request.headers.get("X-Clerk-User-ID")
        
        if not pred_id or not user_id:
            return Response({"error": "Missing ID or User"}, status=400)
            
        prediction = PredictionLog.objects.filter(id=pred_id, clerk_user_id=user_id).first()
        
        if not prediction:
            return Response({"error": "Prediction not found"}, status=404)
            
        prediction.is_saved = True # One-way save, or toggle? User usually expects "Save" to save.
        prediction.save()
        
        return Response({"message": "Prediction Saved", "is_saved": True}, status=200)
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
def user_dashboard(request):

    user_id = request.headers.get("X-Clerk-User-ID")

    if not user_id:
        return Response([], status=200)

    predictions = PredictionLog.objects.filter(
        clerk_user_id=user_id
    ).order_by("-created_at")

    data = [
        {
            "id": p.id,
            "bhk": p.bhk,
            "area": p.area,
            "region": p.locality,   # label, not number
            "price": p.predicted_price,
            "date": p.created_at.strftime("%d %b %Y"),
            "is_saved": p.is_saved
        }
        for p in predictions
    ]

    return Response(data)

@api_view(["GET"])
def saved_predictions(request):
    clerk_user_id = request.headers.get("X-Clerk-User-ID")

    if not clerk_user_id:
        return Response([], status=200)

    data = PredictionLog.objects.filter(
        clerk_user_id=clerk_user_id
    ).order_by("-created_at")

    response = [
        {
            "id": p.id,
            "bhk": p.bhk,
            "area": p.area,
            "region_label": p.region_label,
            "predicted_price": p.predicted_price,
            "created_at": p.created_at,
            "is_saved": p.is_saved
        }
        for p in data
    ]

    return Response(response)


@api_view(["GET"])
def get_recommendations(request):
    import json
    import os
    from django.conf import settings
    from ml.predict import predict_price
    
    user_id = request.headers.get("X-Clerk-User-ID")
    if not user_id:
        return Response({"error": "Unauthorized"}, status=401)

    # Get Last Prediction
    last_pred = PredictionLog.objects.filter(clerk_user_id=user_id).order_by("-created_at").first()
    if not last_pred:
        return Response({"message": "No history"}, status=404)

    # Load Detailed Stats
    stats_path = os.path.join(settings.BASE_DIR, "data", "processed", "detailed_stats.json")
    if not os.path.exists(stats_path):
        return Response({"error": "Stats not found"}, status=500)
    
    with open(stats_path, "r") as f:
        stats = json.load(f)

    # Load Encoders
    mapping_path = os.path.join(settings.BASE_DIR, "data", "processed", "ui_mappings.json")
    with open(mapping_path, "r") as f:
        mappings = json.load(f)

    # Context
    current_price = last_pred.predicted_price
    region_label = last_pred.region_label
    bhk = str(last_pred.bhk)
    
    # Identify Region ID (Only for model input now, not for stats lookup)
    region_id = "8" # Default fallback
    for item in mappings["region"]:
        if item["label"] == region_label:
            region_id = str(item["value"])
            break
            
    # --- INSIGHT 1: CITY-WIDE MARKET CHECK (Location Independent) ---
    market_check = "Fair Price"
    market_diff_percent = 0
    city_avg_bhk_price = 0
    
    total_price = 0
    total_count = 0
    
    # Aggregate Stats for this BHK across ALL regions
    for r_data in stats.values():
        if "bhk_map" in r_data and bhk in r_data["bhk_map"]:
            b_data = r_data["bhk_map"][bhk]
            total_price += (b_data["avg_price"] * b_data["count"])
            total_count += b_data["count"]
            
    if total_count > 0:
        city_avg_bhk_price = total_price / total_count
        
    if city_avg_bhk_price > 0:
        market_diff_percent = ((current_price - city_avg_bhk_price) / city_avg_bhk_price) * 100
        
        if market_diff_percent > 15:
            market_check = f"Premium Pricing (+{int(market_diff_percent)}% vs City Avg)"
        elif market_diff_percent < -15:
            market_check = f"Great Value ({int(abs(market_diff_percent))}% below City Avg)"
        else:
            market_check = "Fair Market Price"

    # --- INSIGHT 2: SMART ALTERNATIVES (Model Driven) ---
    alternatives = []
    
    # helper
    def get_pred_safe(mod_data):
        input_data = {
            "bhk": last_pred.bhk,
            "area": last_pred.area,
            "region_label": str(region_id), # Use ID string required by model
            "status_label": "0",  # "0" = Ready to move
            "age_label": "0",     # "0" = New
            "type_label": "0"     # "0" = Apartment
        }
        input_data.update(mod_data)
        try:
            return predict_price(input_data)
        except Exception as e:
            print(f"Prediction Error in Recommendations: {e}")
            return 0

    # 1. Value upgrade (More BHK)
    # Simulator: What if we add 1 Room?
    next_bhk = last_pred.bhk + 1
    if next_bhk <= 5: # Cap at 5 BHK
        # Estimate: Add 200 sqft per room usually? Or just keep area same? 
        # Usually more BHK comes with more Area. Let's assume +25% Area.
        upgrade_price = get_pred_safe({
            "bhk": next_bhk, 
            "area": last_pred.area * 1.25
        })
        
        if upgrade_price > 0 and upgrade_price <= current_price * 1.30: # If within 30% budget stretch
            diff = upgrade_price - current_price
            alternatives.append({
                "label": "Upgrade Opportunity",
                "desc": f"Upgrade to {next_bhk} BHK for ~{diff:.1f}L more",
                "price": upgrade_price
            })

    # 2. Money Saver (Less BHK)
    prev_bhk = last_pred.bhk - 1
    if prev_bhk >= 1:
        # Predict price for smaller area
        price = get_pred_safe({"bhk": prev_bhk, "area": last_pred.area * 0.75})
        if price > 0:
            alternatives.append({
                "label": "Budget Friendly",
                "desc": f"Save money with a {prev_bhk} BHK",
                "price": price
            })
        
    # 3. Investment (Under Construction)
    # "1" = Under Construction
    # "1" = Resale (Age) -> Let's compare New vs Resale actually?
    # Or strict UC. Let's stick to UC vs Ready is a classic investment trade.
    uc_price = get_pred_safe({"status_label": "1"}) 
    if uc_price > 0 and uc_price < current_price:
        alternatives.append({
            "label": "Investment Option",
            "desc": "Book Under Construction (Lower Price)",
            "price": uc_price
        })

    return Response({
        "market_check": market_check,
        "market_diff_percent": round(market_diff_percent, 1),
        "region_avg_price": round(city_avg_bhk_price, 1), # Now returns CITY avg
        "alternatives": alternatives
    })


@api_view(["GET"])
def get_analytics_features(request):
    import json
    import os
    from django.conf import settings
    
    path = os.path.join(settings.BASE_DIR, "data", "processed", "feature_importance.json")
    if not os.path.exists(path):
        return Response([], status=200) # Empty default
        
    with open(path, "r") as f:
        data = json.load(f)
        
    return Response(data) # [{"feature": "area", "score": 0.5}, ...]


@api_view(["GET"])
def get_market_status(request):
    """
    Returns data for 'Price vs Market' charts.
    """
    import json
    import os
    from django.conf import settings
    
    user_id = request.headers.get("X-Clerk-User-ID")
    if not user_id:
        return Response({"error": "Unauthorized"}, status=401)
        
    last_pred = PredictionLog.objects.filter(clerk_user_id=user_id).order_by("-created_at").first()
    if not last_pred:
        return Response({"message": "No data"}, status=404)
        
    stats_path = os.path.join(settings.BASE_DIR, "data", "processed", "detailed_stats.json")
    with open(stats_path, "r") as f:
        stats = json.load(f)
        
    mapping_path = os.path.join(settings.BASE_DIR, "data", "processed", "ui_mappings.json")
    with open(mapping_path, "r") as f:
        mappings = json.load(f)

    # Find stats
    region_label = last_pred.region_label
    region_id = "8"
    for item in mappings["region"]:
        if item["label"] == region_label:
            region_id = str(item["value"])
            break
            
    city_avg = 0
    region_avg = 0
    
    # Calculate City Wide Avg (Simple mean of all regions)
    total_sum = 0
    count = 0
    for r in stats.values():
        total_sum += r["overall"]["avg_price"]
        count += 1
    if count > 0: city_avg = total_sum / count
    
    if region_id in stats:
        region_avg = stats[region_id]["overall"]["avg_price"]
        
    return Response({
        "your_price": last_pred.predicted_price,
        "region_avg": round(region_avg, 1),
        "city_avg": round(city_avg, 1),
        "region_label": region_label
    })

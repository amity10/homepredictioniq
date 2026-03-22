import os
import json
import joblib
import numpy as np
from django.conf import settings

# Paths
MODEL_PATH = os.path.join(settings.BASE_DIR, "models_saved", "model.pkl")
ENCODER_PATH = os.path.join(settings.BASE_DIR, "data", "processed", "encoders.json")


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not found")
    return joblib.load(MODEL_PATH)


def load_encoders():
    if not os.path.exists(ENCODER_PATH):
        raise FileNotFoundError("Encoders not found")
    with open(ENCODER_PATH, "r") as f:
        return json.load(f)


model = load_model()
encoders = load_encoders()


def predict_price(input_data):
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

    try:
        region = encoders["region"][input_data["region_label"]]
        status = encoders["status"][input_data["status_label"]]
        age = encoders["age"][input_data["age_label"]]
        type_ = encoders["type"][input_data["type_label"]]
    except KeyError as e:
        raise ValueError(f"Unknown category value: {e}")

    features = np.array([
        input_data["bhk"],
        np.log1p(input_data["area"]), # ⭐ CRITICAL FIX: Transform Area to match training
        region,
        status,
        age,
        type_
    ]).reshape(1, -1)

    prediction = model.predict(features)
    return round(float(prediction[0]), 2)


# Manual test
if __name__ == "__main__":
    sample = {
        "bhk": 2,
        "area": 800,
        "region_label": "Andheri West",
        "status_label": "Ready",
        "age_label": "New",
        "type_label": "Apartment"
    }

    print("Predicted Price (Lakhs):", predict_price(sample))

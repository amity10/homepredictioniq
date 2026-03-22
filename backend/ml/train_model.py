import pandas as pd
import joblib
import os
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "final_features.csv")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models_saved", "model.pkl")


def load_data():
    print("Loading final feature dataset...")
    df = pd.read_csv(DATA_PATH)
    
    # ⭐ CRITICAL FIXED: Log Transform Area to normalize distribution
    # This prevents massive areas from skewing linear models and helps RF too.
    if "area" in df.columns:
        df["area"] = np.log1p(df["area"])
        
    return df


def split_data(df):
    # Enforce explicit column order to match prediction logic
    feature_cols = ["bhk", "area", "region", "status", "age", "type"]
    X = df[feature_cols]
    y = df["final_price_lakhs"]

    return train_test_split(X, y, test_size=0.2, random_state=42)


def train_models(X_train, y_train, X_test, y_test):
    # ⭐ SWITCH TO RANDOM FOREST
    # Better for mixed categorical (ID based) and numerical data
    # Captures non-linear relationships (e.g. Age impact isn't just linear)
    
    print("\nTraining Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    
    r2 = r2_score(y_test, predictions)
    mae = mean_absolute_error(y_test, predictions)
    
    print(f"Random Forest → R2 Score: {r2:.4f}, MAE: {mae:.2f}")
    
    return {"Random Forest": {"model": model, "r2": r2, "mae": mae}}


def select_best_model(results):
    # Only one model now, but keeping structure
    best_model_name = "Random Forest"
    best_model = results[best_model_name]["model"]
    return best_model


def save_model(model):
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    joblib.dump(model, MODEL_SAVE_PATH)
    print(f"Model saved at {MODEL_SAVE_PATH}")
    
    # --- EXPORT FEATURE IMPORTANCE ---
    import json
    feature_importance_path = os.path.join(BASE_DIR, "data", "processed", "feature_importance.json")
    
    # Feature names in the exact order enforced in split_data
    feature_names = ["bhk", "area", "region", "status", "age", "type"]
    
    importance_data = []
    
    if hasattr(model, "feature_importances_"):
        for name, score in zip(feature_names, model.feature_importances_):
            importance_data.append({"feature": name, "score": float(score)})
            
    # Sort by score descending
    importance_data.sort(key=lambda x: x["score"], reverse=True)
    
    with open(feature_importance_path, "w") as f:
        json.dump(importance_data, f, indent=4)
        print(f"Feature Importance saved to {feature_importance_path}")


def main():
    df = load_data()
    X_train, X_test, y_train, y_test = split_data(df)
    results = train_models(X_train, y_train, X_test, y_test)
    best_model = select_best_model(results)
    save_model(best_model)

    print("Model training completed successfully!")


if __name__ == "__main__":
    main()

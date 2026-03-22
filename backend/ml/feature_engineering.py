import pandas as pd
import numpy as np
import os
import json

INPUT_DATA_PATH = "../data/processed/cleaned_data.csv"
OUTPUT_DATA_PATH = "../data/processed/final_features.csv"
ENCODER_PATH = "../data/processed/encoders.json"


def load_data():
    print("Loading cleaned data...")
    return pd.read_csv(INPUT_DATA_PATH)


def remove_outliers(df):
    print("Removing outliers...")

    df = df[(df["area"] > 100) & (df["area"] < 10000)]
    df = df[(df["final_price_lakhs"] > 5) & (df["final_price_lakhs"] < 5000)]

    return df


def create_encoders(df):
    """
    Create stable mappings for categorical columns
    """
    encoders = {}

    for col in ["region", "status", "age", "type"]:
        unique_vals = sorted(df[col].astype(str).unique())
        encoders[col] = {
            val: idx for idx, val in enumerate(unique_vals)
        }
        df[col] = df[col].astype(str).map(encoders[col])

    return df, encoders


def feature_scaling(df):
    print("Applying log transform on area...")
    df["area"] = np.log1p(df["area"])
    return df


def save_outputs(df, encoders):
    os.makedirs("../data/processed", exist_ok=True)

    df.to_csv(OUTPUT_DATA_PATH, index=False)

    with open(ENCODER_PATH, "w") as f:
        json.dump(encoders, f, indent=4)

    print("Final data & encoders saved successfully!")


def main():
    df = load_data()
    df = remove_outliers(df)
    df, encoders = create_encoders(df)
    df = feature_scaling(df)
    save_outputs(df, encoders)


if __name__ == "__main__":
    main()

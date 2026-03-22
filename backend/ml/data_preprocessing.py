import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os


# ---------- PATHS ----------
RAW_DATA_PATH = "../data/raw/Mumbai House Prices.csv"
PROCESSED_DATA_PATH = "../data/processed/cleaned_data.csv"


def load_data():
    print("Loading dataset...")
    df = pd.read_csv(RAW_DATA_PATH)
    print(f"Dataset loaded with {df.shape[0]} rows and {df.shape[1]} columns")
    return df


def convert_price_to_lakhs(df):
    print("Converting price to Lakhs...")

    def convert(row):
        if row["price_unit"] == "Cr":
            return row["price"] * 100
        else:
            return row["price"]

    df["final_price_lakhs"] = df.apply(convert, axis=1)
    return df


def clean_data(df):
    print("Cleaning data...")

    # Drop high-cardinality & unused columns
    df.drop(columns=["locality", "price", "price_unit"], inplace=True)

    # Drop rows with missing target
    df.dropna(subset=["final_price_lakhs"], inplace=True)

    # ⭐ NEW: Filter out "Unknown" categories for Realism
    # The model should only learn from definitive New/Resale, Ready/UC data.
    # This aligns with the "New > Resale" logic requirement.
    df = df[df["age"] != "Unknown"]
    df = df[df["status"] != "Unknown"] 
    df = df[df["type"] != "Unknown"]

    # Fill numeric missing values
    df["area"].fillna(df["area"].median(), inplace=True)
    df["bhk"].fillna(df["bhk"].median(), inplace=True)

    # Fill categorical missing values
    df["region"].fillna(df["region"].mode()[0], inplace=True)
    df["status"].fillna(df["status"].mode()[0], inplace=True)
    df["age"].fillna(df["age"].mode()[0], inplace=True)
    df["type"].fillna(df["type"].mode()[0], inplace=True)

    return df


def encode_features(df):
    print("Encoding categorical features...")

    label_cols = ["region", "status", "age", "type"]
    encoder = LabelEncoder()

    for col in label_cols:
        df[col] = encoder.fit_transform(df[col])

    return df


def save_cleaned_data(df):
    os.makedirs("../data/processed", exist_ok=True)
    df.to_csv(PROCESSED_DATA_PATH, index=False)
    print(f"Cleaned data saved to {PROCESSED_DATA_PATH}")


def main():
    df = load_data()
    df = convert_price_to_lakhs(df)
    df = clean_data(df)
    df = encode_features(df)
    save_cleaned_data(df)

    print("Preprocessing completed successfully!")


if __name__ == "__main__":
    main()

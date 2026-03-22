import pandas as pd
import json
import os
import sys

# Define constants
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_PATH = os.path.join(BASE_DIR, "data", "raw", "Mumbai House Prices.csv")
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "cleaned_data.csv")
OUTPUT_MAPPING_PATH = os.path.join(BASE_DIR, "data", "processed", "ui_mappings.json")

def generate_mappings():
    print("Loading data...")
    try:
        raw_df = pd.read_csv(RAW_DATA_PATH)
        processed_df = pd.read_csv(PROCESSED_DATA_PATH)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return

    print("Generating mappings...")
    mappings = {}

    # 1. Map Regions
    # We assume 'locality' or 'region' in raw maps to 'region' in processed
    # In raw: "region" column seems to correspond to what we want (e.g. "Andheri West")
    # In processed: "region" column is numeric (e.g. 8)
    
    # We align them by index, assuming the order is preserved or we can join them.
    # Looking at the file views, both have 76040 lines (implied). 
    # Let's double check if they align row-by-row.
    # From file view:
    # Row 2 Raw: Andheri West (region), Ready to move (status), Apartment (type)
    # Row 2 Processed: region=8, status=0, type=0
    # This suggests Row N Raw corresponds to Row N Processed.
    
    if len(raw_df) != len(processed_df):
        print(f"Warning: Dataframes have different lengths! Raw: {len(raw_df)}, Processed: {len(processed_df)}")
        # If lengths differ, we can't safely assume row alignment without a common ID.
        # However, for this task, we will assume they align for the intersection.
        limit = min(len(raw_df), len(processed_df))
        raw_df = raw_df.iloc[:limit]
        processed_df = processed_df.iloc[:limit]

    # Create Region Mapping
    # Create a DataFrame with both columns
    region_map_df = pd.DataFrame({
        "label": raw_df["region"],
        "value": processed_df["region"]
    }).drop_duplicates().sort_values("label")
    
    mappings["region"] = region_map_df.to_dict(orient="records")

    # Create Status Mapping
    status_map_df = pd.DataFrame({
        "label": raw_df["status"],
        "value": processed_df["status"]
    }).drop_duplicates().sort_values("label")
    mappings["status"] = status_map_df.to_dict(orient="records")

    # Create Type Mapping
    type_map_df = pd.DataFrame({
        "label": raw_df["type"],
        "value": processed_df["type"]
    }).drop_duplicates().sort_values("label")
    mappings["type"] = type_map_df.to_dict(orient="records")
    
    # Create Age Mapping
    # Raw 'age' -> Processed 'age'
    age_map_df = pd.DataFrame({
        "label": raw_df["age"],
        "value": processed_df["age"]
    }).drop_duplicates().sort_values("label")
    mappings["age"] = age_map_df.to_dict(orient="records")

    # Save to JSON
    with open(OUTPUT_MAPPING_PATH, "w") as f:
        json.dump(mappings, f, indent=4)
    
    print(f"Mappings saved to {OUTPUT_MAPPING_PATH}")
    
    # Print sample for verification
    print("\nSample Region Mappings:")
    print(region_map_df.head(5))

if __name__ == "__main__":
    generate_mappings()

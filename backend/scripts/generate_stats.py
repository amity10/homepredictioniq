import pandas as pd
import json
import os
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "cleaned_data.csv")
STATS_PATH = os.path.join(BASE_DIR, "data", "processed", "stats.json")

def generate_stats():
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    
    # Calculate Price per Sqft
    df["price_per_sqft"] = (df["final_price_lakhs"] * 100000) / df["area"]
    
    stats = {}
    
    # Group by Region and BHK
    # Structure: stats[region_id] = { "bhk_map": { "2": {avg_price..}, "3": {..} }, "overall": {..} }
    
    for region in df["region"].unique():
        region_df = df[df["region"] == region]
        region_str = str(region)
        
        stats[region_str] = {
            "overall": {
                 "avg_price": round(region_df["final_price_lakhs"].mean(), 2),
                 "avg_sqft": round(region_df["price_per_sqft"].mean(), 2),
                 "count": int(len(region_df))
            },
            "bhk_map": {}
        }
        
        # Sub-group by BHK
        for bhk in region_df["bhk"].unique():
            bhk_df = region_df[region_df["bhk"] == bhk]
            bhk_str = str(int(bhk))
            
            stats[region_str]["bhk_map"][bhk_str] = {
                "avg_price": round(bhk_df["final_price_lakhs"].mean(), 2),
                "avg_sqft": round(bhk_df["price_per_sqft"].mean(), 2),
                "count": int(len(bhk_df))
            }

    # Save
    STATS_PATH = os.path.join(BASE_DIR, "data", "processed", "detailed_stats.json")
    with open(STATS_PATH, "w") as f:
        json.dump(stats, f, indent=4)
        
    print(f"Detailed Stats saved to {STATS_PATH}")

if __name__ == "__main__":
    generate_stats()

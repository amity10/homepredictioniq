import requests
import json

BASE_URL = "http://127.0.0.1:8003/api"

def test_options():
    print("Testing GET /api/options/ ...")
    try:
        response = requests.get(f"{BASE_URL}/options/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response Sample:", json.dumps(response.json(), indent=2)[:200])
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Exception: {e}")

def test_predict():
    print("\nTesting POST /api/predict/ ...")
    
    scenarios = [
        {"bhk": 2, "area": 850, "region": 8, "region_label": "Andheri West"},
        {"bhk": 3, "area": 1500, "region": 8, "region_label": "Andheri West"},
        {"bhk": 1, "area": 450, "region": 12, "region_label": "Panvel"},
        {"bhk": 4, "area": 3000, "region": 5, "region_label": "Juhu"},
        {"bhk": 2, "area": 850, "region": 8, "region_label": "Andheri West", "force_zero": True}, # ⭐ Test 0 values
    ]

    for s in scenarios:
        payload = {
            "bhk": s["bhk"],
            "area": s["area"],
            "region": s["region"],
            "status": s.get("status", 1),
            "age": s.get("age", 1),
            "type": s.get("type", 1),
            "region_label": s["region_label"],
            "status_label": "Ready to move",
            "age_label": "New",
            "type_label": "Apartment"
        }
        if "force_zero" in s:
             payload.update({
                 "status": 0, "age": 0, "type": 0, 
                 "status_label": "Ready to move", "age_label": "New", "type_label": "Apartment"
             })
        try:
            response = requests.post(f"{BASE_URL}/predict/", json=payload)
            print(f"Input: {s['region_label']} {s['bhk']}BHK {s['area']}sqft -> Code: {response.status_code}")
            if response.status_code == 200:
                print("Prediction:", response.json().get("predicted_price_lakhs"))
            else:
                print("Error:", response.text)
        except Exception as e:
            print(f"Exception: {e}")

def test_analytics():
    print("\nTesting GET /api/analytics/features/ ...")
    try:
        response = requests.get(f"{BASE_URL}/analytics/features/")
        print(f"Features Code: {response.status_code}")
        if response.status_code == 200:
            print("Features:", response.json()[:2]) # Show first 2
    except Exception as e:
        print(e)

    print("\nTesting GET /api/analytics/market_status/ ...")
    # Needs Auth headers usually, but for local dev we might need to mock or just skip if auth required
    # Our view checks X-Clerk-User-ID. Let's send a fake one that matches a prediction we just made?
    # Actually checking manually is easier. Let's just try basic health check.
    try:
        headers = {"X-Clerk-User-ID": "test_user_123"} 
        # Note: This will only work if "test_user_123" has entries in DB. 
        # Since I'm not sure which user ID I used in previous tests (likely empty or random), 
        # I rely on the fact that I populated DB via test_api previously. 
        # Let's check headers used in Views.
        response = requests.get(f"{BASE_URL}/analytics/market_status/", headers=headers)
        print(f"Market Status Code: {response.status_code}")
        print(response.text)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    test_options()
    test_predict()
    test_analytics()

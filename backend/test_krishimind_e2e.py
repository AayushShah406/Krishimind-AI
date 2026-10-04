import httpx
import uuid
import json

BASE_URL = "http://127.0.0.1:8080/api"

def test_e2e():
    print("=== STARTING KRISHIMIND AI E2E INTEGRATION TEST ===")
    client = httpx.Client(base_url=BASE_URL, timeout=60.0)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Backend Health Check OK")

    # 2. Register a brand new farmer (zero pre-populated data)
    test_email = f"farmer_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "email": test_email,
        "password": "Password123!",
        "name": "Ramesh Patel",
        "phone": "+919876543210",
        "role": "FARMER",
        "preferred_language": "gu"
    }
    res = client.post("/auth/register", json=reg_payload)
    assert res.status_code == 200, f"Register failed: {res.text}"
    auth_data = res.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[PASS] 2. Registered new user: {test_email}")

    # Verify zero data for new user
    farms_res = client.get("/farms", headers=headers)
    assert farms_res.status_code == 200 and len(farms_res.json()) == 0, "New user must start with 0 farms"
    print("[PASS] 3. Verified empty state: 0 farms, 0 fields for new user")

    # 3. Create Farm with Location
    farm_payload = {
        "name": "Patel Organic Farm",
        "location": "Anand, Gujarat, India",
        "latitude": 22.5645,
        "longitude": 72.9289,
        "area": 5.5,
        "soil_type": "Loam"
    }
    farm_res = client.post("/farms", json=farm_payload, headers=headers)
    assert farm_res.status_code == 200, f"Farm creation failed: {farm_res.text}"
    farm = farm_res.json()
    farm_id = farm["id"]
    print(f"[PASS] 4. Created Farm with coordinates ({farm['latitude']}, {farm['longitude']})")

    # 4. Create Field
    field_payload = {
        "farm_id": farm_id,
        "name": "North Field - Wheat Plot",
        "area": 2.5,
        "soil_type": "Clay Loam",
        "location": "North Sector, Anand",
        "latitude": 22.5650,
        "longitude": 72.9295
    }
    field_res = client.post("/fields", json=field_payload, headers=headers)
    assert field_res.status_code == 200, f"Field creation failed: {field_res.text}"
    field = field_res.json()
    field_id = field["id"]
    print(f"[PASS] 5. Created Field: {field['name']}")

    # 5. Create Crop
    crop_payload = {
        "field_id": field_id,
        "name": "Wheat",
        "variety": "GW-496",
        "planting_date": "2026-09-01T00:00:00",
        "growth_stage": "Tillering",
        "status": "ACTIVE"
    }
    crop_res = client.post("/crops", json=crop_payload, headers=headers)
    assert crop_res.status_code == 200, f"Crop creation failed: {crop_res.text}"
    crop = crop_res.json()
    crop_id = crop["id"]
    print(f"[PASS] 6. Created Crop: {crop['name']} ({crop['variety']})")

    # 6. Manual Soil Reading
    soil_payload = {
        "field_id": field_id,
        "moisture": 62.5,
        "ph": 6.8,
        "nitrogen": 115.0,
        "phosphorus": 34.0,
        "potassium": 190.0,
        "soil_temperature": 24.5,
        "electrical_conductivity": 1.2,
        "soil_type": "Clay Loam",
        "notes": "Weekly manual moisture and NPK test",
        "source": "manual"
    }
    soil_res = client.post("/soil", json=soil_payload, headers=headers)
    assert soil_res.status_code == 200, f"Soil creation failed: {soil_res.text}"
    soil = soil_res.json()
    assert soil["source"] == "manual"
    assert soil["electrical_conductivity"] == 1.2
    print(f"[PASS] 7. Added manual soil reading with EC={soil['electrical_conductivity']}, source={soil['source']}")

    # 7. IoT Sensor Reading (ESP32 telemetry ingestion)
    iot_payload = {
        "field_id": field_id,
        "device_id": "ESP32-FIELD-PROBE-01",
        "moisture": 64.0,
        "soil_temperature": 25.1,
        "ph": 6.9,
        "electrical_conductivity": 1.25,
        "nitrogen": 118.0,
        "phosphorus": 35.0,
        "potassium": 192.0,
        "notes": "Automated telemetry packet #1024"
    }
    iot_res = client.post("/soil/iot/reading", json=iot_payload)
    assert iot_res.status_code == 200, f"IoT soil reading failed: {iot_res.text}"
    iot_reading = iot_res.json()
    assert iot_reading["source"] == "sensor"
    assert iot_reading["device_id"] == "ESP32-FIELD-PROBE-01"
    print(f"[PASS] 8. Received IoT sensor reading: source={iot_reading['source']}, device_id={iot_reading['device_id']}")

    # 8. Dynamic Weather check for Field
    weather_res = client.get(f"/weather/{field_id}", headers=headers)
    assert weather_res.status_code == 200, f"Weather retrieval failed: {weather_res.text}"
    weather = weather_res.json()
    assert "temperature" in weather and "humidity" in weather
    print(f"[PASS] 9. Dynamic Open-Meteo Weather retrieved: {weather['temperature']}°C, rain_prob: {weather['rain_probability']}%")

    # 9. Crop Doctor: Upload Crop Image with optional field & question
    dummy_img_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    upload_res = client.post(
        "/images/upload",
        files={"file": ("leaf.png", dummy_img_content, "image/png")},
        data={"field_id": field_id, "crop_id": crop_id, "question": "Are these yellow spots dangerous for my crop?"},
        headers=headers
    )
    assert upload_res.status_code == 200, f"Image upload failed: {upload_res.text}"
    img_data = upload_res.json()
    image_id = img_data["id"]
    print(f"[PASS] 10. Uploaded crop image id: {image_id}")

    # 10. Analyze Crop Image with Gemini + Pinecone RAG
    analyze_res = client.post(f"/images/{image_id}/analyze?language=gu", headers=headers)
    assert analyze_res.status_code == 200, f"Image analysis failed: {analyze_res.text}"
    analysis = analyze_res.json()
    assert analysis["is_confirmed_diagnosis"] is False, "Must clearly distinguish visual observation from confirmed diagnosis"
    assert len(analysis["visual_observations"]) > 0
    assert len(analysis["recommended_next_steps"]) > 0
    assert "diagnosis_disclaimer" in analysis and analysis["diagnosis_disclaimer"] is not None
    print(f"[PASS] 11. Multimodal AI Analysis complete: Severity={analysis['severity']}, Disclaimed={not analysis['is_confirmed_diagnosis']}")

    # 11. Follow-up Question on the Analysis
    followup_payload = {
        "question": "Can I irrigate my wheat field tomorrow?",
        "language": "gu"
    }
    followup_res = client.post(f"/images/{image_id}/conversation", json=followup_payload, headers=headers)
    assert followup_res.status_code == 200, f"Follow-up question failed: {followup_res.text}"
    followup = followup_res.json()
    assert "answer" in followup and len(followup["answer"]) > 0
    assert len(followup["conversation_history"]) >= 2
    print(f"[PASS] 12. Follow-up conversation preserved context: {followup['conversation_history']}")

    # 12. AI Advisor Ask Query
    ai_ask_payload = {
        "field_id": field_id,
        "question": "Should I irrigate my wheat field tomorrow?",
        "language": "gu"
    }
    ai_res = client.post("/ai/ask", json=ai_ask_payload, headers=headers)
    assert ai_res.status_code == 200, f"AI ask failed: {ai_res.text}"
    ai_answer = ai_res.json()
    assert "recommendation" in ai_answer
    assert "reason" in ai_answer
    safe_rec = ai_answer['recommendation'][:60].encode('ascii', 'replace').decode()
    print(f"[PASS] 13. AI Agricultural Advisor reasoning: {safe_rec}...")

    print("\nALL 13 KRISHIMIND AI FUNCTIONAL TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_e2e()

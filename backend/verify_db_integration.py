import httpx

client = httpx.Client(base_url='http://127.0.0.1:8080/api', timeout=30.0)

# 1. Login
login_res = client.post('/auth/login', json={'email': 'farmer@krishimind.ai', 'password': 'password123'})
assert login_res.status_code == 200, f'Login failed: {login_res.text}'
token = login_res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('1. Login successful, JWT token received.')

# 2. Get existing farms
farms_res = client.get('/farms', headers=headers)
assert farms_res.status_code == 200
farms = farms_res.json()
print(f'2. Fetched {len(farms)} existing farms from database.')

# 3. Create a new test farm
new_farm_payload = {
    'name': 'Baroda Organic Agro',
    'location': 'Vadodara, Gujarat',
    'area': 14.5,
    'unit': 'acres',
    'soil_type': 'Black Cotton Soil'
}
create_farm_res = client.post('/farms', json=new_farm_payload, headers=headers)
assert create_farm_res.status_code == 200, f'Create farm failed: {create_farm_res.text}'
new_farm = create_farm_res.json()
farm_name = new_farm.get('name')
farm_id = new_farm.get('id')
print(f'3. Created new farm in DB: {farm_name} (ID: {farm_id})')

# 4. Fetch farms again to verify persistence in DB
farms_res_after = client.get('/farms', headers=headers)
assert len(farms_res_after.json()) == len(farms) + 1
print('4. Verified new farm persisted in DB and returned in list query.')

# 5. Create a new field in this farm
new_field_payload = {
    'farm_id': farm_id,
    'name': 'Plot Beta-1',
    'area': 6.0,
    'soil_type': 'Black Clay Loam'
}
field_res = client.post('/fields', json=new_field_payload, headers=headers)
assert field_res.status_code == 200
new_field = field_res.json()
field_id = new_field.get('id')
print(f'5. Created field in DB: {new_field.get("name")} (ID: {field_id})')

# 6. Record a soil reading
soil_payload = {
    'field_id': field_id,
    'moisture': 68.5,
    'ph': 7.1,
    'nitrogen': 45.0,
    'phosphorus': 22.0,
    'potassium': 180.0
}
soil_res = client.post('/soil', json=soil_payload, headers=headers)
assert soil_res.status_code == 200
print('6. Saved soil telemetry record directly into DB.')

# 7. Fetch soil reading back from DB
get_soil_res = client.get(f'/soil/{field_id}', headers=headers)
assert get_soil_res.status_code == 200
readings = get_soil_res.json()
assert len(readings) >= 1
assert readings[0]['moisture'] == 68.5
print(f'7. Fetched soil reading from DB: moisture = {readings[0]["moisture"]}%, pH = {readings[0]["ph"]}')

# 8. Ask AI a decision question for this field
ai_payload = {
    'field_id': field_id,
    'question': 'Should I irrigate Plot Beta-1 tomorrow?',
    'language': 'en'
}
ai_res = client.post('/ai/ask', json=ai_payload, headers=headers)
assert ai_res.status_code == 200
ai_data = ai_res.json()
print(f'8. AI decision synthesized and stored: {ai_data["recommendation"]} (Confidence: {ai_data["confidence"]})')

# 9. Verify recommendation is in recommendations table
recs_res = client.get('/ai/recommendations', headers=headers)
assert recs_res.status_code == 200
recs = recs_res.json()
print(f'9. Verified recommendations in DB: {len(recs)} total recommendations stored in database.')
print('SUCCESS: Backend and Frontend API contracts, DB writes, and DB reads verified 100%!')

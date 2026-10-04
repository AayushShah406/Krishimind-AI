import httpx
import time

time.sleep(1)
client = httpx.Client(base_url='http://127.0.0.1:8080/api', timeout=15.0)

# 1. Login
login = client.post('/auth/login', json={'email': 'farmer@krishimind.ai', 'password': 'password123'}).json()
token = login.get('access_token')
headers = {'Authorization': f'Bearer {token}'}

# 2. Query 'Hi'
res_hi = client.post('/ai/ask', json={'question': 'Hi', 'language': 'en'}, headers=headers).json()
print('[Response for "Hi"]:\nRecommendation:', res_hi.get('recommendation'))
print('Reason:', res_hi.get('reason'))

# 3. Query 'Should I irrigate tomorrow?'
res_irrig = client.post('/ai/ask', json={'question': 'Should I irrigate tomorrow?', 'language': 'en'}, headers=headers).json()
print('\n[Response for "Should I irrigate tomorrow?"]:\nRecommendation:', res_irrig.get('recommendation'))
print('Evidence:', res_irrig.get('evidence'))

# 4. Check DB recommendations
recs = client.get('/ai/recommendations', headers=headers).json()
print(f'\nTotal Recommendations stored in DB: {len(recs)}')
print('Latest DB Recommendation:', recs[0].get('recommendation') if recs else 'None')

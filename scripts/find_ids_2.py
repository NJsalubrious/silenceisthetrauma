import json

with open(r'C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\___master_point_of_truth\profiles\profiles.json', 'r', encoding='utf-8') as f:
    profiles = json.load(f)

for p in profiles:
    s = str(p).lower()
    if 'chancellor' in s or 'forde' in s or 'omalley' in s or 'crusher' in s or 'elias' in s or 'carter' in s:
        print(f"ID: {p.get('id')}, Avatar: {p.get('avatar')}")

import json

with open(r'C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\___master_point_of_truth\profiles\profiles.json', 'r', encoding='utf-8') as f:
    profiles = json.load(f)

for p in profiles:
    s = str(p).lower()
    if 'angus' in s or 'thorne' in s or 'gary' in s or 'karen' in s or 'vance' in s or 'ray' in s or 'jenkins' in s or 'john p' in s:
        print(f"ID: {p.get('id')}, Avatar: {p.get('avatar')}")

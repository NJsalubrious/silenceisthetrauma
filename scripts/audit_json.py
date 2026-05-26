import json

path = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\___misc_rnd_files\SILENCE_IS_THE_TRAUMA_profilesBeingOrganised_sandbox_backup1\SILENCE_IS_THE_TRAUMA INFO\ECO-SYSTEM-OVERVIEW\profiles_wip.json.bak"

try:
    with open(path, "r", encoding="utf-8") as f:
        profiles = json.load(f)
except Exception as e:
    print(f"Error: {e}")
    profiles = []

local = 0
cloud = 0

for p in profiles:
    if "avatar" in p:
        if "http" in p["avatar"]:
            cloud += 1
        else:
            local += 1

print(f"Total Avatars in JSON: {len(profiles)}")
print(f"Local Paths: {local}")
print(f"Cloudflare Links: {cloud}")

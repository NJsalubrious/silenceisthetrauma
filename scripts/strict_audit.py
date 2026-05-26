import os
import json
import urllib.parse

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
live_json_path = os.path.join(sandbox, "___master_point_of_truth", "profiles", "profiles.json")
old_images_dir = os.path.join(sandbox, "___misc_rnd_files", "old_Character_site_images")

with open(live_json_path, "r", encoding="utf-8") as f:
    profiles = json.load(f)

existing_images = set()
for root, dirs, files in os.walk(old_images_dir):
    for file in files:
        if file.lower().endswith((".jpg", ".png", ".jpeg")):
            existing_images.add(file.lower())

found_exact = []
missing_exact = []

for p in profiles:
    if "avatar" in p:
        avatar_path = p["avatar"]
        raw_filename = avatar_path.split("/")[-1]
        decoded_filename = urllib.parse.unquote(raw_filename)
        pid = p.get("id", p.get("handle", "unknown"))
        
        if decoded_filename.lower() in existing_images:
            found_exact.append((pid, decoded_filename))
        else:
            missing_exact.append((pid, decoded_filename))

print(f"Total Profiles with Avatars: {len(found_exact) + len(missing_exact)}")
print(f"EXACT MATCHES FOUND: {len(found_exact)}")
print(f"MISSING (No Exact Match): {len(missing_exact)}")
print("\nFirst 10 Missing Expected Filenames:")
for _, m in missing_exact[:10]:
    print(f" - {m}")

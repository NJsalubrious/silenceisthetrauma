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

found = 0
missing = []

print(f"Total physical images in old_Character_site_images: {len(existing_images)}")

for p in profiles:
    if "avatar" in p:
        avatar_path = p["avatar"]
        raw_filename = avatar_path.split("/")[-1]
        decoded_filename = urllib.parse.unquote(raw_filename)
        
        if decoded_filename.lower() in existing_images:
            found += 1
        else:
            missing.append(decoded_filename)

print(f"Live Avatars found in physical dir: {found} out of {len(profiles)}")
if missing:
    print("Example missing:", missing[:5])

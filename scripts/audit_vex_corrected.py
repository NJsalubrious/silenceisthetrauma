import os
import json
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
truth_dir = os.path.join(sandbox, "___master_point_of_truth")
vex_md = os.path.join(truth_dir, "currentLiveVex_doesntIncludeNewCharacters.md")
backup_json = os.path.join(sandbox, "___misc_rnd_files", "SILENCE_IS_THE_TRAUMA_profilesBeingOrganised_sandbox_backup1", "SILENCE_IS_THE_TRAUMA INFO", "ECO-SYSTEM-OVERVIEW", "profiles_wip.json.bak")
old_images_dir = os.path.join(sandbox, "___misc_rnd_files", "old_Character_site_images")
master_md = os.path.join(truth_dir, "MASTER_Final_Network.md")

# 1. Parse currentLiveVex
vex_names = []
with open(vex_md, "r", encoding="utf-8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith("@") or line in ["primary", "secondary", "network", "Primary Voices", "Inner Circle", "The Network", "Fiction Notice"] or line.startswith("veX is a fictional"):
            continue
        if i + 1 < len(lines) and lines[i+1].strip().startswith("@"):
            name = line.replace(" ✓", "").strip()
            vex_names.append(name)

# 2. Parse true backup JSON
try:
    with open(backup_json, "r", encoding="utf-8") as f:
        profiles = json.load(f)
except Exception as e:
    print(f"Error loading JSON: {e}")
    profiles = []

# 3. Check avatar images in old_Character_site_images
existing_images = set()
for root, dirs, files in os.walk(old_images_dir):
    for file in files:
        if file.lower().endswith(('.jpg', '.png', '.jpeg')):
            existing_images.add(file.lower())

found_avatars = 0
missing_from_old = []

for p in profiles:
    if "avatar" in p:
        avatar_path = p["avatar"]
        filename = avatar_path.split("/")[-1].replace("%20", " ")
        
        # Check if the filename exists in the old folder
        if filename.lower() in existing_images:
            found_avatars += 1
        else:
            missing_from_old.append(filename)

print(f"Names in currentLiveVex: {len(vex_names)}")
print(f"Profiles in true JSON backup: {len(profiles)}")
print(f"Avatars found in old_Character_site_images: {found_avatars} out of {len(profiles)}")
if missing_from_old:
    print(f"Missing from old dir (sample): {missing_from_old[:5]}...")

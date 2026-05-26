import os
import json
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
truth_dir = os.path.join(sandbox, "___master_point_of_truth")
vex_md = os.path.join(truth_dir, "currentLiveVex_doesntIncludeNewCharacters.md")
json_path = os.path.join(truth_dir, "profiles_wip.json")
old_images_dir = os.path.join(sandbox, "___misc_rnd_files", "old_Character_site_images")
master_md = os.path.join(truth_dir, "MASTER_Final_Network.md")

# 1. Parse currentLiveVex_doesntIncludeNewCharacters.md
vex_names = []
with open(vex_md, "r", encoding="utf-8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith("@") or line in ["primary", "secondary", "network", "Primary Voices", "Inner Circle", "The Network", "Fiction Notice"] or line.startswith("veX is a fictional"):
            continue
        # Names usually appear right before an @ handle
        if i + 1 < len(lines) and lines[i+1].strip().startswith("@"):
            name = line.replace(" ✓", "").strip()
            vex_names.append(name)

print(f"Names in currentLiveVex: {len(vex_names)}")

# 2. Parse profiles_wip.json
try:
    with open(json_path, "r", encoding="utf-8") as f:
        profiles = json.load(f)
except Exception as e:
    print(f"Error loading JSON: {e}")
    profiles = []

print(f"Profiles in profiles_wip.json: {len(profiles)}")

# 3. Check avatar images in old_Character_site_images
existing_images = set()
for root, dirs, files in os.walk(old_images_dir):
    for file in files:
        if file.lower().endswith(('.jpg', '.png', '.jpeg')):
            existing_images.add(file.lower())

found_avatars = 0
missing_from_old = []
json_mapping = {}

for p in profiles:
    if "avatar" in p:
        avatar_path = p["avatar"]
        # extract just the filename
        filename = avatar_path.split("/")[-1].replace("%20", " ")
        json_mapping[p["id"]] = filename
        
        if filename.lower() in existing_images:
            found_avatars += 1
        else:
            missing_from_old.append(filename)

print(f"Avatars found in old_Character_site_images: {found_avatars} out of {len(profiles)}")
if missing_from_old:
    print(f"Missing from old dir: {missing_from_old[:5]}...")

# 4. Check MASTER_Final_Network.md for missing AVATARS that match the found profile images.
with open(master_md, "r", encoding="utf-8") as f:
    master_lines = f.readlines()

missing_avatar_count = 0
can_be_restored = []

current_name = None
for line in master_lines:
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images") and not line.startswith("**Secret"):
        current_name = line.strip("* \n")
        
    if line.strip().startswith("* **Avatar:**"):
        if "MISSING WEBSITE IMAGE(S)" in line:
            missing_avatar_count += 1
            # Check if we have an image for this name
            if current_name:
                # Try to fuzzy match to json_mapping or vex_names to find the filename
                # Just doing a simple check for now
                can_be_restored.append(current_name)

print(f"Characters with MISSING Avatars in MASTER: {missing_avatar_count}")


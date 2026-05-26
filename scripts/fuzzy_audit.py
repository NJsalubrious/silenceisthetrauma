import os
import json
import urllib.parse
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
live_json_path = os.path.join(sandbox, "___master_point_of_truth", "profiles", "profiles.json")
old_images_dir = os.path.join(sandbox, "___misc_rnd_files", "old_Character_site_images")

with open(live_json_path, "r", encoding="utf-8") as f:
    profiles = json.load(f)

existing_images = []
for root, dirs, files in os.walk(old_images_dir):
    for file in files:
        if file.lower().endswith((".jpg", ".png", ".jpeg")):
            existing_images.append(file.lower())

exact_matches = 0
fuzzy_matches = 0
unmatched = []

for p in profiles:
    if "avatar" in p:
        avatar_path = p["avatar"]
        raw_filename = avatar_path.split("/")[-1]
        decoded_filename = urllib.parse.unquote(raw_filename).lower()
        
        # 1. Try exact match first
        if decoded_filename in existing_images:
            exact_matches += 1
            continue
            
        # 2. Try fuzzy match using the ID
        id_parts = [part.lower() for part in p["id"].split("_") if part.lower() not in ["the", "man", "of", "and"]]
        
        matched_file = None
        
        for img in existing_images:
            match_score = 0
            for part in id_parts:
                if part in img:
                    match_score += 1
            
            if match_score == len(id_parts) and len(id_parts) > 0:
                matched_file = img
                break
                
        if matched_file:
            fuzzy_matches += 1
        else:
            unmatched.append(p["id"])

print(f"Exact Matches: {exact_matches}")
print(f"Fuzzy Matches (by ID): {fuzzy_matches}")
print(f"Total Found: {exact_matches + fuzzy_matches} out of {len(profiles)}")
if unmatched:
    print("Example Unmatched:", unmatched[:10])

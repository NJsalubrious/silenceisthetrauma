import os
import json
import shutil
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
misc = os.path.join(sandbox, "___misc_rnd_files")
json_backup = os.path.join(misc, "SILENCE_IS_THE_TRAUMA_profilesBeingOrganised_sandbox_backup1", "SILENCE_IS_THE_TRAUMA INFO", "ECO-SYSTEM-OVERVIEW", "profiles_wip.json.bak")
old_avatar_dir = os.path.join(sandbox, "old_avitar_and_posting_images")
md_path = os.path.join(sandbox, "___master_point_of_truth", "Final_Network_Overview_18_05_26_B.md")
avatars_dest = os.path.join(sandbox, "assets", "images", "characters", "avatars")

os.makedirs(avatars_dest, exist_ok=True)

try:
    with open(json_backup, "r", encoding="utf-8") as f:
        profiles = json.load(f)
except Exception as e:
    print(f"Error reading JSON: {e}")
    profiles = []

id_to_old_avatar = {}
for p in profiles:
    if "id" in p and "avatar" in p:
        id_to_old_avatar[p["id"]] = p["avatar"]

with open(md_path, "r", encoding="utf-8") as f:
    md_lines = f.readlines()

blocks = []
current_block = []

for line in md_lines:
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images"):
        if current_block:
            blocks.append(current_block)
        current_block = [line]
    else:
        current_block.append(line)
if current_block:
    blocks.append(current_block)

restored_count = 0
final_lines = []

for block in blocks:
    website = None
    avatar_line_idx = -1
    is_missing = False
    
    for i, line in enumerate(block):
        m = re.match(r'^\*\s+\*\*Website:\*\*\s+`?([^`\s]+)`?', line.strip())
        if m:
            website = m.group(1).strip()
        if line.strip().startswith("* **Avatar:**"):
            avatar_line_idx = i
            if "MISSING WEBSITE IMAGE(S)" in line:
                is_missing = True
                
    if website and is_missing:
        base_id = website.replace(".html", "").lower()
        old_avatar = id_to_old_avatar.get(base_id)
        
        if not old_avatar:
            for pid, path in id_to_old_avatar.items():
                if pid.lower() in base_id or base_id in pid.lower():
                    old_avatar = path
                    break
                    
        if old_avatar:
            old_avatar_norm = old_avatar.replace("\\", "/")
            parts = old_avatar_norm.split("/")
            filename = parts[-1]
            
            search_dirs = [
                old_avatar_dir,
                os.path.join(misc, "old_characters"),
                os.path.join(misc, "old_Character_site_images"),
                os.path.join(misc, "old_characters_set_2")
            ]
            
            physical_file = None
            for sdir in search_dirs:
                if not os.path.exists(sdir): continue
                for root, dirs, files in os.walk(sdir):
                    if filename in files:
                        physical_file = os.path.join(root, filename)
                        break
                if physical_file: break
                
            if physical_file:
                ext = os.path.splitext(filename)[1]
                if not ext: ext = ".jpg"
                seo_name = f"{base_id}-avatar{ext}"
                dest_file = os.path.join(avatars_dest, seo_name)
                
                shutil.copy(physical_file, dest_file)
                
                new_path = f"../assets/images/characters/avatars/{seo_name}"
                block[avatar_line_idx] = f"* **Avatar:** `{new_path}`\n"
                restored_count += 1
                
    final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print(f"Successfully restored {restored_count} VeX avatars and updated the Master Audit!")

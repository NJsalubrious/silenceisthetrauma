import os
import json
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
live_json_path = os.path.join(sandbox, "___master_point_of_truth", "profiles", "profiles.json")
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")
assets_dir = os.path.join(sandbox, "assets", "images", "characters", "avatars")

with open(live_json_path, "r", encoding="utf-8") as f:
    profiles = json.load(f)

# Create deterministic lookup from display name to ID
name_to_id = {}
for p in profiles:
    name = p.get("display_name", "").lower().strip()
    pid = p.get("id", p.get("handle", "")).replace("@", "")
    name_to_id[name] = pid

# Manual overrides for slight variations between JSON display_name and MD names
name_to_id["the barista"] = "the_barista"
name_to_id["agent allie miller"] = "agent_miller"
name_to_id["pieter 'the block'"] = "pieter_block"
name_to_id["dr. al-fayed"] = "dr_alfayed"
name_to_id["jack 'the shiv'"] = "jack_shiv"
name_to_id["sarah k"] = "sarah_k"
name_to_id["'iron' irene"] = "iron_irene"
name_to_id["jai"] = "the_apprentice"
name_to_id["sgt. 'robbo'"] = "sgt_robbo"
name_to_id["insp. weber"] = "insp_weber"
name_to_id["capt. sully"] = "capt_sully"
name_to_id["sal"] = "sal_doorman"
name_to_id["'old man' miller"] = "old_miller"
name_to_id["truckie dave"] = "truckie_dave"
name_to_id["david g."] = "david_g"
name_to_id["cody"] = "cody_r"
name_to_id["jacko"] = "jacko_r"
name_to_id["trench"] = "trench_r"
name_to_id["hassan"] = "hassan_a"
name_to_id["amir"] = "amir_a"

with open(md_path, "r", encoding="utf-8") as f:
    md_lines = f.readlines()

blocks = []
current_block = []

for line in md_lines:
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images") and not line.startswith("**Secret"):
        if current_block:
            blocks.append(current_block)
        current_block = [line]
    else:
        current_block.append(line)
if current_block:
    blocks.append(current_block)

final_lines = []
updated_count = 0

for block in blocks:
    if block[0].startswith("**"):
        char_name = block[0].strip("* \n").lower()
        pid = name_to_id.get(char_name)
        
        # fallback: check if we can make a direct id by replacing spaces
        if not pid:
            fallback_id = char_name.replace(" ", "_").replace("'", "").replace(".", "")
            if fallback_id in [p.get("id") for p in profiles]:
                pid = fallback_id

        if pid:
            # check if file exists
            exts = [".jpg", ".png", ".jpeg"]
            found_img = None
            for ext in exts:
                expected_name = f"{pid.replace('_', '-')}-avatar{ext}"
                if os.path.exists(os.path.join(assets_dir, expected_name)):
                    found_img = f"../assets/images/characters/avatars/{expected_name}"
                    break
            
            if found_img:
                for i, line in enumerate(block):
                    if line.strip().startswith("* **Avatar:**"):
                        block[i] = f"* **Avatar:** `{found_img}`\n"
                        updated_count += 1
                        break
                        
    final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print(f"Successfully updated {updated_count} Avatar paths in MASTER_Final_Network.md")

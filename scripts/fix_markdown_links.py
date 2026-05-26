import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")
assets_dir = os.path.join(sandbox, "assets", "images", "characters", "avatars")

# Manual mapping: Markdown Name -> downloaded filename (based on ID)
manual_map = {
    "Dr. Aris Thorne": "dr-aris-thorne-avatar.jpg",
    "Darren 'Daz' O'Malley": "daz-omalley-avatar.jpg",
    "Private Certifier Gary": "private-certifier-gary-avatar.jpg",
    "Strata Manager Karen": "strata-manager-karen-avatar.jpg",
    "University Vice-Chancellor": "university-vice-chancellor-avatar.jpg",
    "Judge Harrison Forde": "judge-harrison-forde-avatar.jpg",
    "Officer Vance": "immigration-officer-vance-avatar.jpg",
    "Health Inspector Ray": "health-inspector-ray-avatar.jpg",
    "Director Huff": "patent-omalley-avatar.jpg", # Or charity-director-huff
    "EPA Auditor Jenkins": "epa-auditor-jenkins-avatar.jpg",
    "Grid Engineer John P": "grid-engineer-john-p-avatar.jpg",
    "Inspector Klaus Weber": "inspector-klaus-weber-avatar.jpg",
    "Pieter The Block": "pieter-block-avatar.jpg",
    "Jack 'The Shiv' Hennessy": "jack-shiv-avatar.jpg",
    "Angus 'Gus' Dunbar": "angus-gus-dunbar-avatar.jpg",
    "Captain 'Sully' Sullivan": "captain-sully-sullivan-avatar.jpg",
    "Sal the Doorman": "sal-doorman-avatar.jpg",
    "Frank 'The Crusher'": "frank-the-crusher-avatar.jpg",
    "Elias Finch": "elias-finch-avatar.jpg",
    "Spud": "the-liability-avatar.jpg",
    "Dr. E. Carter (The Evaluator)": "evaluator-avatar.jpg"
}

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
        char_name = block[0].strip("* \n")
        
        expected_filename = manual_map.get(char_name)
        if not expected_filename:
            # Maybe a slight variation?
            for key, val in manual_map.items():
                if key in char_name:
                    expected_filename = val
                    break

        if expected_filename:
            # Check if exists in assets
            if os.path.exists(os.path.join(assets_dir, expected_filename)):
                found_img = f"../assets/images/characters/avatars/{expected_filename}"
                for i, line in enumerate(block):
                    if line.strip().startswith("* **Avatar:**"):
                        block[i] = f"* **Avatar:** `{found_img}`\n"
                        updated_count += 1
                        break
            else:
                # print to debug
                print(f"Warning: {expected_filename} not found physically for {char_name}")
                        
    final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print(f"Manually mapped and updated {updated_count} MISSING avatars in MASTER_Final_Network.md")

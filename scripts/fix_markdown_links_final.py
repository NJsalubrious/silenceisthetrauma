import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")
assets_dir = os.path.join(sandbox, "assets", "images", "characters", "avatars")

manual_map = {
    "Dr. Aris Thorne": "dr-thorne-avatar.jpg",
    "Darren 'Daz' O'Malley": "daz-omalley-avatar.jpg",
    "Private Certifier Gary": "cert-gary-avatar.jpg",
    "Strata Manager Karen": "strata-karen-avatar.jpg",
    "University Vice-Chancellor": "uni-vc-avatar.jpg",
    "Judge Harrison Forde": "judge-forde-avatar.jpg",
    "Officer Vance": "vance-avatar.jpg",
    "Health Inspector Ray": "health-ray-avatar.jpg",
    "EPA Auditor Jenkins": "epa-jenkins-avatar.jpg",
    "Grid Engineer John P": "john-p-avatar.jpg",
    "Inspector Klaus Weber": "klaus-weber-avatar.jpg",
    "Angus 'Gus' Dunbar": "gus-dunbar-avatar.jpg",
    "Captain 'Sully' Sullivan": "sully-avatar.jpg", # Or whatever sully is
    "Sal the Doorman": "sal-avatar.jpg",
    "Director Huff": "patent-omalley-avatar.jpg",
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

updated_count = 0
final_lines = []

for block in blocks:
    if block[0].startswith("**"):
        char_name = block[0].strip("* \n")
        
        expected_filename = manual_map.get(char_name)

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
                # Try finding any file that has the main name
                fallback_name = expected_filename.replace('-avatar.jpg', '')
                for f in os.listdir(assets_dir):
                    if fallback_name in f.lower():
                        found_img = f"../assets/images/characters/avatars/{f}"
                        for i, line in enumerate(block):
                            if line.strip().startswith("* **Avatar:**"):
                                block[i] = f"* **Avatar:** `{found_img}`\n"
                                updated_count += 1
                                break
                        break

    final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print(f"Manually mapped and updated {updated_count} MISSING avatars in MASTER_Final_Network.md")

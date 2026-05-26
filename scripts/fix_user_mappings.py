import os
import urllib.request
import ssl

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")
assets_dir = os.path.join(sandbox, "assets", "images", "characters", "avatars")

# 1. Download Klaus Weber
klaus_url = "https://pub-111e813bd5634cd8a9ecdd3d5c2a0916.r2.dev/dominicGlobaleNetworkProfilePics/Inspector%20Klaus%20Weber.%20Location-%20Berlin.%20Focus-%20Chain%20of%20Custody.jpg"
klaus_path = os.path.join(assets_dir, "inspector-klaus-weber-avatar.jpg")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.Request(klaus_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response, open(klaus_path, 'wb') as out_file:
        out_file.write(response.read())
    print("Successfully downloaded Klaus Weber.")
except Exception as e:
    print(f"Failed to download Klaus Weber: {e}")

# 2. Manual Map
manual_map = {
    "Inspector Klaus Weber": "inspector-klaus-weber-avatar.jpg",
    "Shazza from Accounts": "shazza-avatar.jpg",
    "Sunrise Pool Supplies": "sunrise-pool-supplies-avatar.jpg",
    "Mara Quinn": "writers_lowres_0000_Mara Quinn_723d75_0b85ffad2cef469588e01929be912105.jpg",
    "Eliza Trenholm (Music Blogger)": "writers_lowres_0001_writer_Eliza Trenholm_723d75_e5f0960ba8e2405599982644f075178b.jpg",
    "Michael Harren (Field Researcher)": "writers_lowres_0002_writer_Michael Harren_723d75_badf4c094d674e9ebd4f874c1c790a42.jpg",
    "Julia Renn (Culture Correspondent)": "writers_lowres_0003_writer_Julia Renn_723d75_3363d08e635243d8a6feb96980935e19.jpg",
    "Eli Ward (Music Journalist)": "writers_lowres_0004_writer_Eli Ward_723d75_70ed51aed1d34e9f8e0c9eb3feb91d49.jpg",
    "Kate Jennings": "writers_lowres_0005_writer_Kate Jennings_723d75_fffd8742500b4d8abcce3b098a0d861a.jpg"
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
            found_img = f"../assets/images/characters/avatars/{expected_filename}"
            for i, line in enumerate(block):
                if line.strip().startswith("* **Avatar:**"):
                    block[i] = f"* **Avatar:** `{found_img}`\n"
                    updated_count += 1
                    break

    final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print(f"Manually mapped and updated {updated_count} specific avatars in MASTER_Final_Network.md")

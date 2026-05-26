import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "Final_Network_Overview_18_05_26_B.md")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

characters = []
current_char = {}

for line in lines:
    line = line.strip()
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images"):
        if current_char:
            characters.append(current_char)
        current_char = {"name": line.strip("* ")}
    elif line.startswith("* **Website:**"):
        current_char["website"] = line.replace("* **Website:**", "").strip(" `")
    elif line.startswith("* **Avatar:**"):
        current_char["avatar"] = line.replace("* **Avatar:**", "").strip(" `")
    elif line.startswith("* **Card Image:**"):
        current_char["card"] = line.replace("* **Card Image:**", "").strip(" `")

if current_char:
    characters.append(current_char)

missing_websites = []
missing_images = []

for c in characters:
    name = c.get("name", "Unknown")
    website = c.get("website", "")
    avatar = c.get("avatar", "")
    card = c.get("card", "")
    
    if "MISSING" in website or not website.endswith(".html"):
        missing_websites.append(name)
    elif "MISSING WEBSITE IMAGE(S)" in avatar or "MISSING WEBSITE IMAGE(S)" in card:
        missing_images.append(f"{name} (Website: {website})")

print(f"Total Characters Parsed: {len(characters)}")
print(f"Missing Websites: {len(missing_websites)}")
if missing_websites:
    print("Examples of missing websites:")
    for m in missing_websites[:10]: print("- " + m)

print(f"\nMissing Images: {len(missing_images)}")
if missing_images:
    print("Examples of missing images:")
    for m in missing_images[:10]: print("- " + m)

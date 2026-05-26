import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "Final_Network_Overview_18_05_26_A.md")
people_dir = os.path.join(sandbox, "people")

mappings = {}

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

current_avatar = None
current_card = None

for line in lines:
    line = line.strip()
    
    avatar_match = re.match(r"^\*\s+\*\*Avatar:\*\*\s+`?([^`]+)`?", line)
    if avatar_match:
        val = avatar_match.group(1).strip()
        if "MISSING" not in val:
            current_avatar = val
        else:
            current_avatar = None
            
    card_match = re.match(r"^\*\s+\*\*Card Image:\*\*\s+`?([^`]+)`?", line)
    if card_match:
        val = card_match.group(1).strip()
        if "MISSING" not in val:
            current_card = val
        else:
            current_card = None
            
    website_match = re.match(r"^\*\s+\*\*Website:\*\*\s+`?([^`]+)`?", line)
    if website_match:
        website = website_match.group(1).strip()
        if website.endswith(".html"):
            mappings[website] = {
                "avatar": current_avatar,
                "card": current_card
            }
        current_avatar = None
        current_card = None

updated_count = 0

for filename in os.listdir(people_dir):
    if not filename.endswith(".html"):
        continue
        
    filepath = os.path.join(people_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    original_content = content
    
    mapping = mappings.get(filename, {})
    avatar_path = mapping.get("avatar")
    card_path = mapping.get("card")
    
    if card_path:
        content = re.sub(
            r"url\(['\"]?(?:old_)?(?:characters|Character_site_images|characters_set_2)/[^'\"]+['\"]?\)", 
            f"url('{card_path}')", 
            content
        )
        
    if avatar_path:
        content = re.sub(
            r"src=['\"](?:old_)?(?:characters|Character_site_images|characters_set_2)/[^'\"]+['\"]", 
            f'src="{avatar_path}"', 
            content
        )
        
    if content != original_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        updated_count += 1
        print(f"Updated images in {filename}")

print(f"Successfully updated {updated_count} HTML files.")

import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "Final_Network_Overview_18_05_26_B.md")
live_people = os.path.join(sandbox, "people")

# First pass: map website to its actual images
website_mappings = {}
for filename in os.listdir(live_people):
    if not filename.endswith(".html"): continue
    
    filepath = os.path.join(live_people, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    pattern = r'(src=([\'"])( (?:characters|Character_site_images|characters_set_2|\.\./assets/images/MISSING_PLACEHOLDER\.jpg|\.\./assets/images/characters/avatars/[^\'"]+|\.\./assets/images/characters/[^\'"]+|\.\./assets/images/characters/cards/[^\'"]+)/?[^\'"]* )\2|url\(([\'"]?)( (?:characters|Character_site_images|characters_set_2|\.\./assets/images/MISSING_PLACEHOLDER\.jpg|\.\./assets/images/characters/avatars/[^\'"]+|\.\./assets/images/characters/[^\'"]+|\.\./assets/images/characters/cards/[^\'"]+)/?[^\'"]* )\4\))'
    
    matches = list(re.finditer(pattern, content, flags=re.VERBOSE))
    
    avatar_path = None
    card_path = None
    all_images = []
    
    for match in matches:
        is_src = "src=" in match.group(0)
        p = match.group(3) if match.group(3) else match.group(5)
        if not p: continue
        p = p.strip()
        
        if "MISSING_PLACEHOLDER" in p:
            val = "MISSING WEBSITE IMAGE(S)"
        else:
            val = f"`{p}`"
            
        all_images.append(val)
        
        if is_src and not avatar_path:
            avatar_path = val
        elif not is_src and not card_path:
            card_path = val

    website_mappings[filename] = {
        "avatar": avatar_path if avatar_path else "MISSING WEBSITE IMAGE(S)",
        "card": card_path if card_path else "MISSING WEBSITE IMAGE(S)",
        "all_images": all_images
    }

with open(md_path, "r", encoding="utf-8") as f:
    md_lines = f.readlines()

blocks = []
current_block = []

for line in md_lines:
    if line.startswith("**") and not line.startswith("**Profession:**") and not line.startswith("**Location:**") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Avatar:**") and not line.startswith("**Card") and not line.startswith("**Website Images:**") and not line.startswith("**website images:**") and not line.startswith("**Website:**"):
        if current_block:
            blocks.append(current_block)
        current_block = [line]
    else:
        current_block.append(line)
if current_block:
    blocks.append(current_block)

final_lines = []

for block in blocks:
    website = None
    for line in block:
        m = re.match(r'^\*\s+\*\*Website:\*\*\s+`?([^`\s]+)`?', line.strip())
        if m:
            website = m.group(1).strip()
            break
            
    if website and website in website_mappings:
        mapping = website_mappings[website]
        new_block = []
        has_website_images_field = False
        
        for line in block:
            stripped = line.strip()
            if stripped.startswith("* **Avatar:**"):
                new_block.append(f"* **Avatar:** {mapping['avatar']}\n")
            elif stripped.startswith("* **Card Image:**"):
                new_block.append(f"* **Card Image:** {mapping['card']}\n")
            elif stripped.startswith("* **website images:**") or stripped.startswith("* **Website Images:**"):
                has_website_images_field = True
                if mapping["all_images"]:
                    images_str = ", ".join(mapping["all_images"])
                    new_block.append(f"* **Website Images:** {images_str}\n")
                else:
                    new_block.append("* **Website Images:** MISSING WEBSITE IMAGE(S)\n")
            else:
                new_block.append(line)
                
        if not has_website_images_field:
            insert_idx = len(new_block)
            for i in range(len(new_block)-1, -1, -1):
                if new_block[i].strip() != "":
                    insert_idx = i + 1
                    break
            
            if mapping["all_images"]:
                images_str = ", ".join(mapping["all_images"])
                new_block.insert(insert_idx, f"* **Website Images:** {images_str}\n")
            else:
                new_block.insert(insert_idx, "* **Website Images:** MISSING WEBSITE IMAGE(S)\n")
                
        final_lines.extend(new_block)
    else:
        final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print("Synchronized markdown with requested MISSING WEBSITE IMAGE(S) string.")

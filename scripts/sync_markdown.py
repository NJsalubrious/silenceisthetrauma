import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "Final_Network_Overview_18_05_26_A.md")
live_people = os.path.join(sandbox, "people")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
current_website = None

# First pass: map website to its actual images
website_to_images = {}
for filename in os.listdir(live_people):
    if not filename.endswith(".html"): continue
    
    filepath = os.path.join(live_people, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    avatar_match = re.search(r'src=[\'"](\.\./assets/images/characters/avatars/[^\'"]+)[\'"]', content)
    card_match = re.search(r'url\([\'"]?(\.\./assets/images/characters/cards/[^\'"]+)[\'"]?\)', content)
    
    website_to_images[filename] = {
        "avatar": avatar_match.group(1) if avatar_match else None,
        "card": card_match.group(1) if card_match else None
    }

# Second pass: update the markdown
# The markdown lists Website LAST in the block, which is annoying for streaming replacement.
# Let's chunk the markdown by character blocks.

blocks = []
current_block = []

for line in lines:
    if line.startswith("**") and not line.startswith("**Profession:**") and not line.startswith("**Location:**") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Avatar:**") and not line.startswith("**Card") and not line.startswith("**Website:**"):
        # Start of a new character block
        if current_block:
            blocks.append(current_block)
        current_block = [line]
    else:
        current_block.append(line)
if current_block:
    blocks.append(current_block)

final_lines = []

for block in blocks:
    # Find the website
    website = None
    for line in block:
        m = re.match(r'^\*\s+\*\*Website:\*\*\s+`?([^`]+)`?', line.strip())
        if m:
            website = m.group(1).strip()
            break
            
    if website and website in website_to_images:
        actual_avatar = website_to_images[website]["avatar"]
        actual_card = website_to_images[website]["card"]
        
        # Modify the avatar and card lines in the block
        new_block = []
        for line in block:
            if line.strip().startswith("* **Avatar:**"):
                if actual_avatar:
                    new_block.append(f"* **Avatar:** `{actual_avatar}`\n")
                else:
                    new_block.append("* **Avatar:** MISSING - needs profile image created\n")
            elif line.strip().startswith("* **Card Image:**"):
                if actual_card:
                    new_block.append(f"* **Card Image:** `{actual_card}`\n")
                else:
                    new_block.append("* **Card Image:** MISSING - needs 'Card Image' created\n")
            else:
                new_block.append(line)
        final_lines.extend(new_block)
    else:
        # Just append untouched (e.g. headers, Voice Only characters)
        final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print("Synchronized Final_Network_Overview_18_05_26_A.md with actual HTML paths.")

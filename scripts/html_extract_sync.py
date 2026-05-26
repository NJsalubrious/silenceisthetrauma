import os
import re
import shutil

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
misc_dir = os.path.join(sandbox, "___misc_rnd_files")
backup_people = os.path.join(misc_dir, "SILENCE_IS_THE_TRAUMA_profilesBeingOrganised_sandbox_backup1", "people")
live_people = os.path.join(sandbox, "people")
md_path = os.path.join(sandbox, "___master_point_of_truth", "Final_Network_Overview_18_05_26_B.md")
assets_dir = os.path.join(sandbox, "assets", "images", "characters")

# Create assets dir
os.makedirs(assets_dir, exist_ok=True)

# Generate placeholder
placeholder_path = os.path.join(sandbox, "assets", "images", "MISSING_PLACEHOLDER.jpg")
os.makedirs(os.path.dirname(placeholder_path), exist_ok=True)
if not os.path.exists(placeholder_path):
    with open(placeholder_path, "wb") as f:
        f.write(b"")

old_dirs = {
    "characters": os.path.join(misc_dir, "old_characters"),
    "Character_site_images": os.path.join(misc_dir, "old_Character_site_images"),
    "characters_set_2": os.path.join(misc_dir, "old_characters_set_2")
}

def find_original_file(old_path):
    old_path_norm = old_path.replace("\\", "/")
    parts = old_path_norm.split("/")
    if len(parts) >= 2:
        folder = parts[0]
        filename = parts[1]
        if folder in old_dirs:
            full_path = os.path.join(old_dirs[folder], filename)
            if os.path.exists(full_path):
                return full_path
    return None

website_mappings = {}

# 1. Process HTML Files
for html_filename in os.listdir(backup_people):
    if not html_filename.endswith(".html"): continue
    
    website_basename = html_filename.replace(".html", "")
    src_html = os.path.join(backup_people, html_filename)
    dest_html = os.path.join(live_people, html_filename)
    
    with open(src_html, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find all images in order
    # Regex captures the full match, the quote, the path, and whether it's src or url
    # We will use re.finditer to get them in order
    pattern = r'(src=([\'"])( (?:characters|Character_site_images|characters_set_2)/[^\'"]+ )\2|url\(([\'"]?)( (?:characters|Character_site_images|characters_set_2)/[^\'"]+ )\4\))'
    
    matches = list(re.finditer(pattern, content, flags=re.VERBOSE))
    
    avatar_path = None
    card_path = None
    all_images = []
    
    extra_counter = 1
    
    # We need to replace them from back to front to not mess up indices
    # Or just do a sequential replace
    
    # Map old_path to new_seo_path for this file
    local_mapping = {}
    
    for match in matches:
        full_match = match.group(0)
        is_src = "src=" in full_match
        
        # Extract the path correctly based on the group that matched
        if match.group(3):
            old_path = match.group(3).strip()
        elif match.group(5):
            old_path = match.group(5).strip()
        else:
            continue
            
        if old_path in local_mapping:
            continue
            
        ext = os.path.splitext(old_path)[1]
        if not ext: ext = ".jpg"
        
        # Determine SEO name
        if is_src and not avatar_path:
            seo_name = f"{website_basename}-avatar{ext}"
            avatar_path = f"../assets/images/characters/{seo_name}"
            new_path = avatar_path
        elif not is_src and not card_path:
            seo_name = f"{website_basename}-card{ext}"
            card_path = f"../assets/images/characters/{seo_name}"
            new_path = card_path
        else:
            seo_name = f"{website_basename}-extra-{extra_counter}{ext}"
            extra_counter += 1
            new_path = f"../assets/images/characters/{seo_name}"
            
        all_images.append(new_path)
        
        # Copy file
        original_file = find_original_file(old_path)
        if original_file:
            dest_file = os.path.join(assets_dir, seo_name)
            shutil.copy(original_file, dest_file)
            local_mapping[old_path] = new_path
        else:
            local_mapping[old_path] = "../assets/images/MISSING_PLACEHOLDER.jpg"

    # Replace in content
    def replacer(m):
        full_match = m.group(0)
        if m.group(3):
            p = m.group(3).strip()
        elif m.group(5):
            p = m.group(5).strip()
        else:
            return full_match
            
        if p in local_mapping:
            return full_match.replace(p, local_mapping[p])
        return full_match

    new_content = re.sub(pattern, replacer, content, flags=re.VERBOSE)
    
    with open(dest_html, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    website_mappings[html_filename] = {
        "avatar": avatar_path if avatar_path else "MISSING - needs profile image created",
        "card": card_path if card_path else "MISSING - needs 'Card Image' created",
        "all_images": all_images
    }

print(f"Processed {len(website_mappings)} HTML files.")

# 2. Sync Master Audit
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
                if "MISSING" in mapping["avatar"]:
                    new_block.append(f"* **Avatar:** {mapping['avatar']}\n")
                else:
                    new_block.append(f"* **Avatar:** `{mapping['avatar']}`\n")
            elif stripped.startswith("* **Card Image:**"):
                if "MISSING" in mapping["card"]:
                    new_block.append(f"* **Card Image:** {mapping['card']}\n")
                else:
                    new_block.append(f"* **Card Image:** `{mapping['card']}`\n")
            elif stripped.startswith("* **website images:**") or stripped.startswith("* **Website Images:**"):
                has_website_images_field = True
                if mapping["all_images"]:
                    images_str = ", ".join([f"`{img}`" for img in mapping["all_images"]])
                    new_block.append(f"* **Website Images:** {images_str}\n")
                else:
                    new_block.append("* **Website Images:** MISSING\n")
            else:
                new_block.append(line)
                
        if not has_website_images_field:
            # Inject it before the Website field if possible, or at the end
            # Let's just put it at the end of the block, but before blank lines
            insert_idx = len(new_block)
            for i in range(len(new_block)-1, -1, -1):
                if new_block[i].strip() != "":
                    insert_idx = i + 1
                    break
            
            if mapping["all_images"]:
                images_str = ", ".join([f"`{img}`" for img in mapping["all_images"]])
                new_block.insert(insert_idx, f"* **Website Images:** {images_str}\n")
            else:
                new_block.insert(insert_idx, "* **Website Images:** MISSING\n")
                
        final_lines.extend(new_block)
    else:
        final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print("Synchronized Final_Network_Overview_18_05_26_B.md.")

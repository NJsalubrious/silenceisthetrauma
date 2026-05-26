import os
import re
import hashlib
import shutil

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
misc_dir = os.path.join(sandbox, "___misc_rnd_files")
backup_people = os.path.join(misc_dir, "SILENCE_IS_THE_TRAUMA_profilesBeingOrganised_sandbox_backup1", "people")
live_people = os.path.join(sandbox, "people")

old_dirs = {
    "characters": os.path.join(misc_dir, "old_characters"),
    "Character_site_images": os.path.join(misc_dir, "old_Character_site_images"),
    "characters_set_2": os.path.join(misc_dir, "old_characters_set_2")
}

new_dirs = {
    "avatars": os.path.join(sandbox, "assets", "images", "characters", "avatars"),
    "cards": os.path.join(sandbox, "assets", "images", "characters", "cards")
}

def get_hash(filepath):
    h = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            while chunk := f.read(8192):
                h.update(chunk)
        return h.hexdigest()
    except:
        return None

# 1. Hash the new SEO files
hash_to_new_path = {}
for category, new_dir in new_dirs.items():
    if not os.path.exists(new_dir): continue
    for filename in os.listdir(new_dir):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            filepath = os.path.join(new_dir, filename)
            file_hash = get_hash(filepath)
            if file_hash:
                # Store the relative SEO path we want in the HTML
                hash_to_new_path[file_hash] = f"../assets/images/characters/{category}/{filename}"

# 2. Hash the old original files and map old_relative_path -> new_seo_path
old_path_to_new_path = {}
for prefix, old_dir in old_dirs.items():
    if not os.path.exists(old_dir): continue
    for filename in os.listdir(old_dir):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            filepath = os.path.join(old_dir, filename)
            file_hash = get_hash(filepath)
            if file_hash and file_hash in hash_to_new_path:
                old_relative = f"{prefix}/{filename}"
                old_path_to_new_path[old_relative] = hash_to_new_path[file_hash]

# Create placeholder
placeholder_path = os.path.join(sandbox, "assets", "images", "MISSING_PLACEHOLDER.jpg")
os.makedirs(os.path.dirname(placeholder_path), exist_ok=True)
if not os.path.exists(placeholder_path):
    with open(placeholder_path, "wb") as f:
        f.write(b"") # Empty file as placeholder

# 3. Process backup HTML files
updated = 0
for filename in os.listdir(backup_people):
    if not filename.endswith(".html"): continue
    
    src_html = os.path.join(backup_people, filename)
    dest_html = os.path.join(live_people, filename)
    
    with open(src_html, "r", encoding="utf-8") as f:
        content = f.read()
        
    def replace_image(match):
        # match.group(0) is the full string like src="characters/foo.jpg"
        # match.group(1) is the quote ' or "
        # match.group(2) is the path characters/foo.jpg
        full_match = match.group(0)
        quote = match.group(1)
        old_path = match.group(2)
        
        # the HTML might use backslashes or forward slashes, normalize to forward
        old_path_norm = old_path.replace("\\", "/")
        
        if old_path_norm in old_path_to_new_path:
            new_path = old_path_to_new_path[old_path_norm]
            return full_match.replace(old_path, new_path)
        else:
            return full_match.replace(old_path, "../assets/images/MISSING_PLACEHOLDER.jpg")

    # Regex for src="..."
    content = re.sub(r'src=([\'"])( (?:characters|Character_site_images|characters_set_2)/[^\'"]+ )\1', replace_image, content, flags=re.VERBOSE)
    # Regex for url('...')
    content = re.sub(r'url\(([\'"]?)( (?:characters|Character_site_images|characters_set_2)/[^\'"]+ )\1\)', replace_image, content, flags=re.VERBOSE)
    
    with open(dest_html, "w", encoding="utf-8") as f:
        f.write(content)
    updated += 1

print(f"Mapped {len(old_path_to_new_path)} hashes. Safely restored and updated {updated} HTML files from backup.")

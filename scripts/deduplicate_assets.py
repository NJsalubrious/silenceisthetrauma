import os
import hashlib
import shutil
import glob

def get_hash(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

old_dir = r"C:\SILENCE_IS_THE_TRAUMA\people\Character_site_images"
html_dir = r"C:\SILENCE_IS_THE_TRAUMA\people"

new_dirs = [
    r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\assets\images\characters\cards",
    r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\assets\images\characters\avatars",
    r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\assets\images\characters\extras"
]

extras_dir = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\assets\images\characters\extras"
os.makedirs(extras_dir, exist_ok=True)

# 1. Build hash map of new files
new_files_map = {}
for nd in new_dirs:
    if os.path.exists(nd):
        for f in os.listdir(nd):
            fp = os.path.join(nd, f)
            if os.path.isfile(fp):
                h = get_hash(fp)
                rel_path = f"../NETWORK_PEOPLE_SANDBOX/assets/images/characters/{os.path.basename(nd)}/{f}"
                new_files_map[h] = rel_path

# 2. Process old files and build mapping rules
link_replacements = {}
old_files = os.listdir(old_dir)
matched = 0
moved = 0

for f in old_files:
    fp = os.path.join(old_dir, f)
    if not os.path.isfile(fp): continue
    
    h = get_hash(fp)
    old_link = f"Character_site_images/{f}"
    
    if h in new_files_map:
        # EXACT DUPLICATE FOUND
        new_link = new_files_map[h]
        link_replacements[old_link] = new_link
        os.remove(fp)  # Delete the duplicate
        matched += 1
    else:
        # UNIQUE FILE (Never Copied)
        dest_fp = os.path.join(extras_dir, f)
        shutil.move(fp, dest_fp)
        new_link = f"../NETWORK_PEOPLE_SANDBOX/assets/images/characters/extras/{f}"
        link_replacements[old_link] = new_link
        moved += 1

print(f"Deleted {matched} duplicates.")
print(f"Moved {moved} unique files to extras.")

# 3. Apply global find-and-replace to all HTML files
html_files = glob.glob(os.path.join(html_dir, "*.html"))
updated_files_count = 0

for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as file:
        content = file.read()
        
    modified = False
    for old_link, new_link in link_replacements.items():
        if old_link in content:
            content = content.replace(old_link, new_link)
            modified = True
            
    if modified:
        with open(hf, 'w', encoding='utf-8') as file:
            file.write(content)
        updated_files_count += 1

print(f"Updated links in {updated_files_count} HTML files.")

# 4. Delete the deprecated directory
if not os.listdir(old_dir):
    os.rmdir(old_dir)
    print("Deleted empty Character_site_images directory.")
else:
    print(f"Warning: Character_site_images is not empty! Remaining items: {os.listdir(old_dir)}")

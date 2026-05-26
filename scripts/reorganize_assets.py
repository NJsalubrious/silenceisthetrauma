import os
import shutil
import glob

base_dir = r"C:\SILENCE_IS_THE_TRAUMA"
char_dir = os.path.join(base_dir, "NETWORK_PEOPLE_SANDBOX", "assets", "images", "characters")
avatars_dir = os.path.join(char_dir, "avatars")
cards_dir = os.path.join(char_dir, "cards")
extras_dir = os.path.join(char_dir, "extras")
people_dir = os.path.join(base_dir, "people")
master_doc = os.path.join(base_dir, "NETWORK_PEOPLE_SANDBOX", "___master_point_of_truth", "MASTER_Final_Network.md")

# Ensure subdirectories exist
os.makedirs(avatars_dir, exist_ok=True)
os.makedirs(cards_dir, exist_ok=True)
os.makedirs(extras_dir, exist_ok=True)

# 1. Identify files and build replacement maps
files_to_move = []
for item in os.listdir(char_dir):
    full_path = os.path.join(char_dir, item)
    if os.path.isfile(full_path):
        if "-avatar" in item:
            dest_dir = avatars_dir
            subfolder = "avatars"
        elif "-card" in item:
            dest_dir = cards_dir
            subfolder = "cards"
        elif "-extra" in item:
            dest_dir = extras_dir
            subfolder = "extras"
        else:
            # Fallback for any outliers not explicitly named
            print(f"Skipping unknown file type: {item}")
            continue
            
        files_to_move.append({
            'filename': item,
            'source_path': full_path,
            'dest_path': os.path.join(dest_dir, item),
            'old_link_1': f"../NETWORK_PEOPLE_SANDBOX/assets/images/characters/{item}",
            'new_link_1': f"../NETWORK_PEOPLE_SANDBOX/assets/images/characters/{subfolder}/{item}",
            'old_link_2': f"../assets/images/characters/{item}",
            'new_link_2': f"../assets/images/characters/{subfolder}/{item}"
        })

print(f"Found {len(files_to_move)} files to relocate.")

# 2. Update HTML Files
html_files = glob.glob(os.path.join(people_dir, "*.html"))
for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    for fm in files_to_move:
        if fm['old_link_1'] in content or fm['old_link_2'] in content:
            content = content.replace(fm['old_link_1'], fm['new_link_1'])
            content = content.replace(fm['old_link_2'], fm['new_link_2'])
            modified = True
            
    if modified:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated links in: {os.path.basename(html_file)}")

# 3. Update Master Document
with open(master_doc, 'r', encoding='utf-8') as f:
    master_content = f.read()

modified_master = False
for fm in files_to_move:
    if fm['old_link_2'] in master_content:
        master_content = master_content.replace(fm['old_link_2'], fm['new_link_2'])
        modified_master = True

if modified_master:
    with open(master_doc, 'w', encoding='utf-8') as f:
        f.write(master_content)
    print("Updated links in MASTER_Final_Network.md")

# 4. Move the actual files
for fm in files_to_move:
    shutil.move(fm['source_path'], fm['dest_path'])
    
print("All files moved successfully.")

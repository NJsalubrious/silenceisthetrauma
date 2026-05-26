import os
import shutil

sandbox = r'C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX'

truth_dir = os.path.join(sandbox, '___master_point_of_truth')
misc_dir = os.path.join(sandbox, '___misc_rnd_files')

os.makedirs(truth_dir, exist_ok=True)
os.makedirs(misc_dir, exist_ok=True)

# 1. Move and update the Markdown
md_src = os.path.join(sandbox, 'Final_Network_Overview_18_05_26_A.md')
md_dest = os.path.join(truth_dir, 'Final_Network_Overview_18_05_26_A.md')

if os.path.exists(md_src):
    # Update paths in markdown to be relative to the new ___master_point_of_truth directory
    with open(md_src, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We change 'assets/images/' to '../assets/images/' so the markdown preview still works
    content = content.replace('ssets/images/', '../assets/images/')
    
    with open(md_dest, 'w', encoding='utf-8') as f:
        f.write(content)
        
    os.remove(md_src)
    print(f"Moved & updated {md_dest}")

# 2. Move JSONs to misc
for json_file in ['profiles_wip.json.bak', 'profiles_fOR_iMAGES.json']:
    src = os.path.join(sandbox, json_file)
    if os.path.exists(src):
        shutil.move(src, os.path.join(misc_dir, json_file))
        print(f"Moved {json_file} to misc/")

# 3. Move old unused image folders from people/ to misc/
people_dir = os.path.join(sandbox, 'people')
for old_img_dir in ['characters', 'Character_site_images', 'characters_set_2']:
    src = os.path.join(people_dir, old_img_dir)
    if os.path.exists(src):
        dest = os.path.join(misc_dir, f'old_{old_img_dir}')
        shutil.move(src, dest)
        print(f"Moved old {old_img_dir} from people/ to misc/")

print("Cleanup complete.")

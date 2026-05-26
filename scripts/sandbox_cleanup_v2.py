import os
import shutil

sandbox = r'C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX'
people_dir = os.path.join(sandbox, 'people')
misc_dir = os.path.join(sandbox, '___misc_rnd_files')

for item in os.listdir(people_dir):
    item_path = os.path.join(people_dir, item)
    
    # We want to keep only .html and .js files in the people/ directory
    if os.path.isfile(item_path):
        if not (item.endswith('.html') or item.endswith('.js')):
            dest = os.path.join(misc_dir, item)
            # handle naming conflicts if necessary
            if os.path.exists(dest):
                dest = os.path.join(misc_dir, f"from_people_{item}")
            shutil.move(item_path, dest)
            print(f"Moved file {item} to misc_rnd_files")
    elif os.path.isdir(item_path):
        # Move all directories out of people/ into misc_rnd_files
        dest = os.path.join(misc_dir, item)
        if os.path.exists(dest):
            dest = os.path.join(misc_dir, f"from_people_{item}")
        shutil.move(item_path, dest)
        print(f"Moved directory {item} to misc_rnd_files")

print("Cleanup of people/ complete.")

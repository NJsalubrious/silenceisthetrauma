@
import os
import shutil

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
original_people = r"C:\SILENCE_IS_THE_TRAUMA\people"
sandbox_people = os.path.join(sandbox, "people")
misc_dir = os.path.join(sandbox, "___misc_rnd_files")

# 1. Restore the original untouched HTML files
for filename in os.listdir(original_people):
    if filename.endswith(".html"):
        src = os.path.join(original_people, filename)
        dest = os.path.join(sandbox_people, filename)
        shutil.copy(src, dest)
print("Restored all original HTML files.")

# 2. Restore the old image folders so the original paths work
for old_dir_name, new_dir_name in [("old_characters", "characters"), ("old_Character_site_images", "Character_site_images")]:
    src = os.path.join(misc_dir, old_dir_name)
    dest = os.path.join(sandbox_people, new_dir_name)
    if os.path.exists(src):
        if not os.path.exists(dest):
            shutil.move(src, dest)
            print(f"Restored {new_dir_name} back to people/")
@

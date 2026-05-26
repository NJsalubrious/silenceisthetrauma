import os

old_images_dir = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\___misc_rnd_files\old_Character_site_images"
files = []
for root, dirs, f_list in os.walk(old_images_dir):
    for f in f_list:
        files.append(f)

print("Searching for Barista:")
for f in files:
    if "barista" in f.lower():
        print(f)

print("\nSearching for Miller:")
for f in files:
    if "miller" in f.lower():
        print(f)

print("\nSearching for Pieter:")
for f in files:
    if "pieter" in f.lower():
        print(f)

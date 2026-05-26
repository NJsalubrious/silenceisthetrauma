import os

old_images_dir = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\___misc_rnd_files\old_Character_site_images"
files = []
for root, dirs, f_list in os.walk(old_images_dir):
    for f in f_list:
        files.append(f)

files.sort()
with open(r"C:\SILENCE_IS_THE_TRAUMA\all_old_images.txt", "w", encoding="utf-8") as f:
    for file in files:
        f.write(file + "\n")

print("File written to C:\\SILENCE_IS_THE_TRAUMA\\all_old_images.txt")

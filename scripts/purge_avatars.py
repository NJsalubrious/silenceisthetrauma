import os
import re

gallery_path = r"C:\SILENCE_IS_THE_TRAUMA\audit_gallery.html"
avatars_dir = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\assets\images\characters\avatars"

# 1. Read the raw text of the audit gallery
with open(gallery_path, "r", encoding="utf-8") as f:
    gallery_html = f.read().lower()

# 2. Get a list of all files in the avatars directory
all_avatars = os.listdir(avatars_dir)

deleted_count = 0
retained_count = 0

print("STARTING PHASE 2: THE PURGE")
print("-" * 30)

for filename in all_avatars:
    if not (filename.lower().endswith(".jpg") or filename.lower().endswith(".png") or filename.lower().endswith(".jpeg")):
        continue
        
    filepath = os.path.join(avatars_dir, filename)
    
    # We check if the EXACT filename appears anywhere in the gallery HTML.
    # Since the gallery contains the paths to all active avatars, this is highly accurate.
    if filename.lower() not in gallery_html:
        try:
            os.remove(filepath)
            print(f"[DELETED] {filename}")
            deleted_count += 1
        except Exception as e:
            print(f"[ERROR] Could not delete {filename}: {e}")
    else:
        # print(f"[RETAINED] {filename}")
        retained_count += 1

print("-" * 30)
print(f"PURGE COMPLETE.")
print(f"Total Avatars Retained: {retained_count}")
print(f"Total Orphans Deleted: {deleted_count}")

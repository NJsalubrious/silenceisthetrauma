import os
import hashlib
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")
assets_dir = os.path.join(sandbox, "assets", "images", "characters", "avatars")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

char_count = 0
missing_avatars = []
used_avatars = set()

current_name = None
for line in lines:
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images") and not line.startswith("**Secret"):
        current_name = line.strip("* \n")
        char_count += 1
    
    if line.strip().startswith("* **Avatar:**"):
        if "MISSING" in line:
            missing_avatars.append(current_name)
        else:
            # extract path
            m = re.search(r"`(.*?)`", line)
            if m:
                used_avatars.add(os.path.basename(m.group(1)))

print(f"Total Characters in MASTER_Final_Network.md: {char_count}")
print(f"Characters with MISSING avatars: {len(missing_avatars)}")
if missing_avatars:
    print(f"Example missing: {missing_avatars[:5]}")

# Check assets directory for duplicates and unused
if os.path.exists(assets_dir):
    files = [f for f in os.listdir(assets_dir) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
    print(f"\nTotal physical files in assets/avatars/: {len(files)}")
    
    hashes = {}
    duplicates = []
    unused = []
    
    for f in files:
        filepath = os.path.join(assets_dir, f)
        if f not in used_avatars:
            unused.append(f)
            
        with open(filepath, "rb") as img:
            h = hashlib.md5(img.read()).hexdigest()
            if h in hashes:
                duplicates.append((f, hashes[h]))
            else:
                hashes[h] = f
                
    print(f"Identical Image Duplicates (Hash match): {len(duplicates)}")
    if duplicates:
        print(f"Example duplicates: {duplicates[:3]}")
    print(f"Unused Images (Not referenced in MD): {len(unused)}")
else:
    print("\nAssets avatars directory does not exist.")

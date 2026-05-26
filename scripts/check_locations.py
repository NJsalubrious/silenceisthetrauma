import os
import re

md_path = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\___master_point_of_truth\MASTER_Final_Network.md"

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

locations = {}
missing = 0
total_images = 0

for line in lines:
    if line.strip().startswith("* **Card Image:**") or line.strip().lower().startswith("* **website images:**"):
        paths = re.findall(r"`([^`]+)`", line)
        for p in paths:
            total_images += 1
            if p == "MISSING WEBSITE IMAGE(S)":
                missing += 1
                continue
            
            dir_name = os.path.dirname(p)
            if dir_name not in locations:
                locations[dir_name] = 0
            locations[dir_name] += 1

print(f"Total Extracted Images: {total_images}")
print("Image Locations found:")
for loc, count in locations.items():
    print(f" - {loc}: {count} images")

if missing > 0:
    print(f" - MISSING: {missing} placeholders found")

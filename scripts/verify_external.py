import os
import re

live_people = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\people"
external_images = []

for filename in os.listdir(live_people):
    if not filename.endswith(".html"): continue
    
    filepath = os.path.join(live_people, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    matches = re.finditer(r'src=[\'"](http[s]?://[^\'"]+)[\'"]', content)
    for m in matches:
        external_images.append(f"{filename} has external src: {m.group(1)}")
        
    matches2 = re.finditer(r'url\([\'"]?(http[s]?://[^\'"]+)[\'"]?\)', content)
    for m in matches2:
        external_images.append(f"{filename} has external url: {m.group(1)}")

if not external_images:
    print("VERIFICATION SUCCESSFUL: 0 external images found. Everything is 100% localized to your sandbox.")
else:
    for ext in external_images:
        print(ext)

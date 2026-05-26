import os
import re

html_dir = r"C:\SILENCE_IS_THE_TRAUMA\people"
html_files = [f for f in os.listdir(html_dir) if f.endswith(".html")]

old_links = set()

for hf in html_files:
    with open(os.path.join(html_dir, hf), "r", encoding="utf-8") as f:
        content = f.read()
        
    matches = re.findall(r"Character_site_images/([^\"\'\)]+)", content)
    for m in matches:
        old_links.add((hf, m))

print(f"Found {len(old_links)} usages of Character_site_images.")
for hf, img in sorted(list(old_links)):
    print(f"{hf}: {img}")

import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")
gallery_script = r"C:\SILENCE_IS_THE_TRAUMA\generate_gallery_links.py"

# 1. Update the Master Document
with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
current_char = ""

for line in lines:
    if line.startswith("**"):
        current_char = line.strip().strip("* ")
        
    if line.startswith("* **Website:**"):
        if "Isla" == current_char:
            line = "* **Website:** `https://www.islaband.com`\n"
        elif "Dominic Ryker" in current_char:
            line = "* **Website:** `https://www.dominicryker.com`\n"
        elif "Ethel Ryker" in current_char:
            line = "* **Website:** `https://www.ethelryker.com`\n"
            
    new_lines.append(line)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Updated external URLs in MASTER_Final_Network.md")

# 2. Update the Gallery Script to handle http:// and https://
with open(gallery_script, "r", encoding="utf-8") as f:
    script_content = f.read()

# Replace the specific block of code handling website paths
old_block = """
    if char["website"] and char["website"] != "MISSING":
        # Construct absolute path to the HTML file for local viewing
        # Note: Some websites are just 'name.html', some are '../people/name.html'
        if not char["website"].startswith("../"):
            web_path = os.path.join(sandbox, "..", "people", char["website"])
        else:
            rel = char["website"].replace("../", "")
            web_path = os.path.join(sandbox, rel)
            
        web_path = web_path.replace("\\\\", "/")
        html_content += f'<a href="file:///{web_path}" target="_blank" class="btn">View Website</a>'
"""
# Note: In Python multiline string, we use \\\\ to match \\ if raw string wasn't used. 
# It's safer to do a simpler replace or regex.

old_block_simpler = """    if char["website"] and char["website"] != "MISSING":
        # Construct absolute path to the HTML file for local viewing
        # Note: Some websites are just 'name.html', some are '../people/name.html'
        if not char["website"].startswith("../"):
            web_path = os.path.join(sandbox, "..", "people", char["website"])
        else:
            rel = char["website"].replace("../", "")
            web_path = os.path.join(sandbox, rel)
            
        web_path = web_path.replace("\\\\", "/")
        html_content += f'<a href="file:///{web_path}" target="_blank" class="btn">View Website</a>'"""

new_block = """    if char["website"] and char["website"] != "MISSING":
        if char["website"].startswith("http"):
            # External website link
            html_content += f'<a href="{char["website"]}" target="_blank" class="btn">View Website</a>'
        else:
            # Construct absolute path to the HTML file for local viewing
            if not char["website"].startswith("../"):
                web_path = os.path.join(sandbox, "..", "people", char["website"])
            else:
                rel = char["website"].replace("../", "")
                web_path = os.path.join(sandbox, rel)
                
            web_path = web_path.replace("\\\\", "/")
            html_content += f'<a href="file:///{web_path}" target="_blank" class="btn">View Website</a>'"""

if old_block_simpler in script_content:
    script_content = script_content.replace(old_block_simpler, new_block)
    with open(gallery_script, "w", encoding="utf-8") as f:
        f.write(script_content)
    print("Updated generate_gallery_links.py to support external links.")
else:
    print("Could not find the exact block to replace in the gallery script.")

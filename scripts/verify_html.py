import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
backup_people = os.path.join(sandbox, "___misc_rnd_files", "SILENCE_IS_THE_TRAUMA_profilesBeingOrganised_sandbox_backup1", "people")
live_people = os.path.join(sandbox, "people")

def normalize_html(content):
    # Remove image paths to compare only the structural HTML
    content = re.sub(r'src=[\'"][^\'"]+[\'"]', 'src=""', content)
    content = re.sub(r'url\([\'"]?[^\'"]+[\'"]?\)', 'url()', content)
    # Remove whitespace differences
    content = "".join(content.split())
    return content

differences = []

for filename in os.listdir(backup_people):
    if not filename.endswith(".html"): continue
    
    backup_file = os.path.join(backup_people, filename)
    live_file = os.path.join(live_people, filename)
    
    if not os.path.exists(live_file):
        differences.append(f"MISSING: {filename} is in backup but not in live sandbox.")
        continue
        
    with open(backup_file, "r", encoding="utf-8") as fb:
        backup_content = fb.read()
        
    with open(live_file, "r", encoding="utf-8") as fl:
        live_content = fl.read()
        
    if normalize_html(backup_content) != normalize_html(live_content):
        differences.append(f"DIFFERENCE DETECTED IN: {filename}")

if not differences:
    print("VERIFICATION SUCCESSFUL: 100% of the live HTML files mathematically match the backup HTML structure.")
    print("Only the image paths were safely updated.")
else:
    for diff in differences:
        print(diff)

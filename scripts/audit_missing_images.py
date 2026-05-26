import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
misc_dir = os.path.join(sandbox, "___misc_rnd_files")
backup_people = os.path.join(misc_dir, "SILENCE_IS_THE_TRAUMA_profilesBeingOrganised_sandbox_backup1", "people")

old_dirs = {
    "characters": os.path.join(misc_dir, "old_characters"),
    "Character_site_images": os.path.join(misc_dir, "old_Character_site_images"),
    "characters_set_2": os.path.join(misc_dir, "old_characters_set_2")
}

missing_report = []

def find_original_file(old_path):
    old_path_norm = old_path.replace("\\", "/")
    
    # Check if it's an external URL that is obviously missing locally
    if "http://" in old_path_norm or "https://" in old_path_norm:
        return False
        
    parts = old_path_norm.split("/")
    if len(parts) >= 2:
        folder = parts[0]
        filename = parts[1]
        if folder in old_dirs:
            full_path = os.path.join(old_dirs[folder], filename)
            if os.path.exists(full_path):
                return True
    return False

missing_count = 0

for html_filename in os.listdir(backup_people):
    if not html_filename.endswith(".html"): continue
    
    src_html = os.path.join(backup_people, html_filename)
    
    with open(src_html, "r", encoding="utf-8") as f:
        content = f.read()
        
    pattern = r'(src=([\'"])( (?:characters|Character_site_images|characters_set_2|http[s]?://[^\'"]+)/?[^\'"]* )\2|url\(([\'"]?)( (?:characters|Character_site_images|characters_set_2|http[s]?://[^\'"]+)/?[^\'"]* )\4\))'
    matches = list(re.finditer(pattern, content, flags=re.VERBOSE))
    
    file_missing_images = []
    
    for match in matches:
        if match.group(3):
            old_path = match.group(3).strip()
        elif match.group(5):
            old_path = match.group(5).strip()
        else:
            continue
            
        if not find_original_file(old_path):
            file_missing_images.append(old_path)
            missing_count += 1
            
    if file_missing_images:
        missing_report.append(f"### `{html_filename}`")
        for mi in file_missing_images:
            missing_report.append(f"- Missing: `{mi}`")
        missing_report.append("")

output_md = os.path.join(sandbox, "Missing_Images_Report.md")
with open(output_md, "w", encoding="utf-8") as f:
    f.write("# Missing Images Report\n\n")
    f.write("The following HTML files reference images that **did not physically exist** in your backup image folders (or were dead Cloudflare links).\n\n")
    f.write("\n".join(missing_report))
    
print(f"Generated report with {missing_count} missing images.")

import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"

# 1. Fix HTML files in people/
people_dir = os.path.join(sandbox, "people")
html_updated = 0

for filename in os.listdir(people_dir):
    if not filename.endswith(".html"): continue
    
    filepath = os.path.join(people_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    original = content
    
    # We injected src="assets/..." and url('assets/...'). We need to prepend ../
    content = content.replace('"assets/images/', '"../assets/images/')
    content = content.replace("'assets/images/", "'../assets/images/")
    content = content.replace("url('assets/images/", "url('../assets/images/")
    content = content.replace('url("assets/images/', 'url("../assets/images/')
    
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        html_updated += 1

print(f"Fixed paths in {html_updated} HTML files.")

# 2. Fix the Master Point of Truth Markdown
md_path = os.path.join(sandbox, "___master_point_of_truth", "Final_Network_Overview_18_05_26_A.md")
with open(md_path, "r", encoding="utf-8") as f:
    md_content = f.read()

md_original = md_content
md_content = md_content.replace("**Avatar:** assets/images/", "**Avatar:** ../assets/images/")
md_content = md_content.replace("**Card Image:** assets/images/", "**Card Image:** ../assets/images/")

if md_content != md_original:
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print("Fixed paths in the Master Point of Truth Markdown.")
    
# 3. Fix JSON files in ___misc_rnd_files
misc_dir = os.path.join(sandbox, "___misc_rnd_files")
for json_file in ["profiles_fOR_iMAGES.json", "profiles_wip.json.bak"]:
    j_path = os.path.join(misc_dir, json_file)
    if os.path.exists(j_path):
        with open(j_path, "r", encoding="utf-8") as f:
            j_content = f.read()
        j_original = j_content
        j_content = j_content.replace('"assets/images/', '"../assets/images/')
        if j_content != j_original:
            with open(j_path, "w", encoding="utf-8") as f:
                f.write(j_content)
            print(f"Fixed paths in {json_file}")

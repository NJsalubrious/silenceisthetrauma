import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")
output_html = r"C:\SILENCE_IS_THE_TRAUMA\audit_gallery.html"

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

characters = []
current_char = {}

for line in lines:
    line = line.strip()
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images") and not line.startswith("**Secret"):
        if current_char:
            characters.append(current_char)
        current_char = {"name": line.strip("* "), "avatar": "MISSING", "profession": "Unknown", "raw_path": "None"}
    
    if current_char:
        if line.startswith("* **Profession:**"):
            current_char["profession"] = line.replace("* **Profession:**", "").strip()
        if line.startswith("* **Avatar:**"):
            m = re.search(r"`(.*?)`", line)
            if m:
                rel_path = m.group(1).replace("../", "")
                abs_path = os.path.join(sandbox, rel_path).replace("\\", "/")
                current_char["avatar"] = f"file:///{abs_path}"
                current_char["raw_path"] = m.group(1)
            elif "MISSING" in line:
                current_char["avatar"] = "MISSING"
                current_char["raw_path"] = "MISSING WEBSITE IMAGE(S)"

if current_char:
    characters.append(current_char)

html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Master Audit Verification Gallery</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #111; color: #eee; margin: 2rem; }
        h1 { border-bottom: 1px solid #333; padding-bottom: 1rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
        .card { background: #222; border-radius: 8px; overflow: hidden; border: 1px solid #333; text-align: center; padding-bottom: 1rem;}
        .img-container { width: 100%; height: 250px; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        img { width: 100%; height: 100%; object-fit: cover; }
        .missing { color: #ff4444; font-weight: bold; font-size: 1.2rem; }
        .name { font-weight: bold; margin: 15px 10px 5px; font-size: 1.2rem; color: #fff;}
        .prof { font-size: 0.9rem; color: #aaa; margin: 0 10px 10px; }
        .path { font-size: 0.75rem; color: #4ade80; background: #1a1a1a; padding: 8px; margin: 0 10px; border-radius: 4px; word-break: break-all; border: 1px solid #333; font-family: monospace;}
    </style>
</head>
<body>
    <h1>Master Audit Visual Verification</h1>
    <p>This gallery displays exactly what is mapped in <code>MASTER_Final_Network.md</code> right now. It includes the exact file path referenced for each character.</p>
    <div class="grid">
"""

for char in characters:
    html_content += f'<div class="card">'
    if char["avatar"] == "MISSING":
        html_content += f'<div class="img-container"><div class="missing">MISSING</div></div>'
    else:
        html_content += f'<div class="img-container"><img src="{char["avatar"]}" alt="Avatar" onerror="this.outerHTML=\'<div class=\\\'missing\\\'>BROKEN PATH</div>\'"></div>'
    
    html_content += f'<div class="name">{char["name"]}</div>'
    html_content += f'<div class="prof">{char["profession"]}</div>'
    html_content += f'<div class="path">{char["raw_path"]}</div>'
    html_content += f'</div>\n'

html_content += """
    </div>
</body>
</html>
"""

with open(output_html, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Updated visual gallery at: {output_html}")

import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = r"C:\SILENCE_IS_THE_TRAUMA\backups\___master_point_of_truth\MASTER_Final_Network.md"
output_html = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\audit_gallery.html"

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

characters = []
current_char = {}

for line in lines:
    line = line.strip()
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images") and not line.startswith("**Secret"):
        if current_char:
            characters.append(current_char)
        current_char = {"name": line.strip("* "), "avatar": "MISSING", "profession": "Unknown", "raw_path": "None", "quote": "", "reveal": "", "website": ""}
    
    if current_char:
        if line.startswith("* **Profession:**"):
            current_char["profession"] = line.replace("* **Profession:**", "").strip()
        if line.startswith("* **Quote (Surface):**"):
            current_char["quote"] = line.replace("* **Quote (Surface):**", "").strip().strip('"')
        if line.startswith("* **Influence (Reveal):**") or line.startswith("* **Secret (Reveal):**"):
            current_char["reveal"] = line.replace("* **Influence (Reveal):**", "").replace("* **Secret (Reveal):**", "").strip()
        if line.startswith("* **Website:**"):
            m = re.search(r"`(.*?)`", line)
            if m:
                current_char["website"] = m.group(1)
        
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
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
        .card { background: #222; border-radius: 8px; overflow: hidden; border: 1px solid #333; position: relative; transition: all 0.3s ease; display: flex; flex-direction: column;}
        .card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.5); border-color: #555; }
        
        .img-container { width: 100%; height: 250px; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;}
        img { width: 100%; height: 100%; object-fit: cover; }
        
        /* The Reveal Overlay */
        .reveal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(140, 20, 20, 0.95); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; padding: 20px; box-sizing: border-box;}
        .card:hover .reveal-overlay { opacity: 1; }
        .reveal-text { color: #fff; text-align: center; font-size: 0.95rem; line-height: 1.4; font-weight: bold; }
        
        .missing { color: #ff4444; font-weight: bold; font-size: 1.2rem; }
        
        .content { padding: 15px; flex-grow: 1; display: flex; flex-direction: column;}
        .name { font-weight: bold; font-size: 1.2rem; color: #fff; margin-bottom: 5px;}
        .prof { font-size: 0.85rem; color: #888; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;}
        .quote { font-style: italic; color: #ccc; font-size: 0.95rem; border-left: 3px solid #555; padding-left: 10px; margin-bottom: 15px; line-height: 1.4; min-height: 40px; flex-grow: 1;}
        
        .footer { margin-top: auto; }
        .path { font-size: 0.7rem; color: #4ade80; background: #1a1a1a; padding: 8px; border-radius: 4px; word-break: break-all; border: 1px solid #333; font-family: monospace; margin-bottom: 10px;}
        
        .btn { display: block; width: 100%; text-align: center; background: #3b82f6; color: white; padding: 10px; text-decoration: none; border-radius: 4px; font-weight: bold; box-sizing: border-box; transition: background 0.2s;}
        .btn:hover { background: #2563eb; }
        .btn.disabled { background: #444; color: #777; cursor: not-allowed; }
    </style>
</head>
<body>
    <h1>Master Audit Visual Verification</h1>
    <p>Hover over any image to reveal the character's hidden influence/secret. Click the button to open their website.</p>
    <div class="grid">
"""

for char in characters:
    html_content += f'<div class="card">'
    
    html_content += f'<div class="img-container">'
    if char["avatar"] == "MISSING":
        html_content += f'<div class="missing">MISSING</div>'
    else:
        html_content += f'<img src="{char["avatar"]}" alt="Avatar" onerror="this.outerHTML=\'<div class=\\\'missing\\\'>BROKEN PATH</div>\'">'
    
    if char["reveal"]:
        html_content += f'<div class="reveal-overlay"><div class="reveal-text">REVEAL:<br>{char["reveal"]}</div></div>'
    html_content += f'</div>'
    
    html_content += f'<div class="content">'
    html_content += f'<div class="name">{char["name"]}</div>'
    html_content += f'<div class="prof">{char["profession"]}</div>'
    
    if char["quote"]:
        html_content += f'<div class="quote">"{char["quote"]}"</div>'
    
    html_content += f'<div class="footer">'
    html_content += f'<div class="path">{char["raw_path"]}</div>'
    
    valid_site = False
    if char["website"]:
        ws = char["website"].lower().strip()
        if ws.endswith(".html") or ws.startswith("http"):
            valid_site = True

    if valid_site:
        if char["website"].startswith("http"):
            # External website link
            html_content += f'<a href="{char["website"]}" target="_blank" class="btn">View Website</a>'
        else:
            # Construct absolute path to the HTML file for local viewing
            if not char["website"].startswith("../"):
                if char["website"].startswith("loc_archives"):
                    web_path = os.path.join(sandbox, "library", char["website"])
                else:
                    web_path = os.path.join(sandbox, "people", char["website"])
            else:
                rel = char["website"].replace("../", "")
                web_path = os.path.join(sandbox, rel)
                
            web_path = web_path.replace("\\", "/")
            html_content += f'<a href="file:///{web_path}" target="_blank" class="btn">View Website</a>'
    else:
        html_content += f'<a href="#" class="btn disabled" style="background: #3a1515; color: #ff8888; border: 1px solid #662222; text-decoration: none; cursor: default;">NO SITE BUILT</a>'
        
    html_content += f'</div>' # close footer
    html_content += f'</div>' # close content
    html_content += f'</div>\n' # close card

html_content += """
    </div>
</body>
</html>
"""

with open(output_html, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Updated visual gallery with links at: {output_html}")

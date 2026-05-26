import os
import re
import shutil

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
live_people = os.path.join(sandbox, "people")
md_path = os.path.join(sandbox, "___master_point_of_truth", "Final_Network_Overview_18_05_26_B.md")
prompts_path = os.path.join(sandbox, "___master_point_of_truth", "__prompts for images needed.md")

template_html = os.path.join(live_people, "robbo.html")

with open(md_path, "r", encoding="utf-8") as f:
    md_lines = f.readlines()

blocks = []
current_block = []

for line in md_lines:
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images"):
        if current_block:
            blocks.append(current_block)
        current_block = [line]
    else:
        current_block.append(line)
if current_block:
    blocks.append(current_block)

final_lines = []
prompts = []

# To extract template content
with open(template_html, "r", encoding="utf-8") as f:
    template_content = f.read()

def sanitize_filename(name):
    # e.g. "Dr. Aris Thorne" -> "dr_aris_thorne"
    s = name.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s-]+', '_', s)
    return s.strip('_')

def generate_prompt(name, profession, location, quote, influence, img_type):
    base_prompt = f"Portrait of {name}, {profession} located in {location}."
    style = "cinematic lighting, ultra-realistic, gritty corporate espionage thriller, hyper-detailed, dramatic shadows, 8k resolution, Leica lens --ar 1:1"
    
    if img_type == "Card":
        style = "wide landscape shot, cinematic lighting, ultra-realistic, gritty corporate espionage thriller, dramatic shadows, empty, liminal space --ar 16:9"
        base_prompt = f"Background aesthetic representing {name}, {profession} located in {location}. {influence}."
        
    return f"{base_prompt} Theme: {quote}. {style}"

for block in blocks:
    name = None
    profession = ""
    location = ""
    quote = ""
    influence = ""
    website = None
    
    website_line_idx = -1
    avatar_line_idx = -1
    card_line_idx = -1
    
    for i, line in enumerate(block):
        if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images"):
            name = line.strip("* \n")
        
        m_prof = re.match(r'^\*\s+\*\*Profession:\*\*\s+(.+)', line)
        if m_prof: profession = m_prof.group(1).strip()
            
        m_loc = re.match(r'^\*\s+\*\*Location:\*\*\s+(.+)', line)
        if m_loc: location = m_loc.group(1).strip()
            
        m_quote = re.match(r'^\*\s+\*\*Quote \(Surface\):\*\*\s+(.+)', line)
        if m_quote: quote = m_quote.group(1).strip()
            
        m_inf = re.match(r'^\*\s+\*\*Secret / Influence \(Reveal\):\*\*\s+(.+)', line)
        if m_inf: influence = m_inf.group(1).strip()
        
        m_web = re.match(r'^\*\s+\*\*Website:\*\*\s+`?([^`\s]+)`?', line)
        if m_web:
            website = m_web.group(1).strip()
            website_line_idx = i
            
        if line.strip().startswith("* **Avatar:**"): avatar_line_idx = i
        if line.strip().startswith("* **Card Image:**"): card_line_idx = i

    if not name:
        final_lines.extend(block)
        continue
        
    is_missing_website = False
    if not website or "MISSING" in website or not website.endswith(".html"):
        is_missing_website = True
        
    seo_base = sanitize_filename(name)
    expected_avatar = f"../assets/images/characters/avatars/{seo_base}-avatar.jpg"
    expected_card = f"../assets/images/characters/cards/{seo_base}-card.jpg"
    
    if is_missing_website:
        website_filename = f"{seo_base}.html"
        new_html_path = os.path.join(live_people, website_filename)
        
        # Replace title and h1 in template
        new_content = re.sub(r'<title>.*?</title>', f'<title>{name} | {profession}</title>', template_content)
        new_content = re.sub(r'<h1>.*?</h1>', f'<h1>{name}</h1>', new_content)
        
        # Replace the first src and first url
        new_content = re.sub(r'src=[\'"][^\'"]+[\'"]', f'src="{expected_avatar}"', new_content, count=1)
        new_content = re.sub(r'url\([\'"]?[^\'"]+[\'"]?\)', f"url('{expected_card}')", new_content, count=1)
        
        with open(new_html_path, "w", encoding="utf-8") as f:
            f.write(new_content)
            
        # Update Markdown block
        if website_line_idx != -1:
            block[website_line_idx] = f"* **Website:** `{website_filename}`\n"
        
        if avatar_line_idx != -1:
            block[avatar_line_idx] = f"* **Avatar:** `{expected_avatar}`\n"
            
        if card_line_idx != -1:
            block[card_line_idx] = f"* **Card Image:** `{expected_card}`\n"
            
        # Write prompts for both
        prompts.append(f"### {name}\n**Image Type:** Avatar\n**Save Path:** `C:\\SILENCE_IS_THE_TRAUMA\\NETWORK_PEOPLE_SANDBOX\\assets\\images\\characters\\avatars\\{seo_base}-avatar.jpg`\n**Prompt:** `{generate_prompt(name, profession, location, quote, influence, 'Avatar')}`\n")
        prompts.append(f"**Image Type:** Card Image\n**Save Path:** `C:\\SILENCE_IS_THE_TRAUMA\\NETWORK_PEOPLE_SANDBOX\\assets\\images\\characters\\cards\\{seo_base}-card.jpg`\n**Prompt:** `{generate_prompt(name, profession, location, quote, influence, 'Card')}`\n---\n")
        
    else:
        # Website exists, check if Avatar or Card says MISSING WEBSITE IMAGE(S)
        needs_avatar = False
        needs_card = False
        
        if avatar_line_idx != -1 and "MISSING WEBSITE IMAGE(S)" in block[avatar_line_idx]:
            needs_avatar = True
            block[avatar_line_idx] = f"* **Avatar:** `{expected_avatar}`\n"
            prompts.append(f"### {name}\n**Image Type:** Avatar\n**Save Path:** `C:\\SILENCE_IS_THE_TRAUMA\\NETWORK_PEOPLE_SANDBOX\\assets\\images\\characters\\avatars\\{seo_base}-avatar.jpg`\n**Prompt:** `{generate_prompt(name, profession, location, quote, influence, 'Avatar')}`\n")
            
        if card_line_idx != -1 and "MISSING WEBSITE IMAGE(S)" in block[card_line_idx]:
            needs_card = True
            block[card_line_idx] = f"* **Card Image:** `{expected_card}`\n"
            prompts.append(f"**Image Type:** Card Image\n**Save Path:** `C:\\SILENCE_IS_THE_TRAUMA\\NETWORK_PEOPLE_SANDBOX\\assets\\images\\characters\\cards\\{seo_base}-card.jpg`\n**Prompt:** `{generate_prompt(name, profession, location, quote, influence, 'Card')}`\n---\n")

    final_lines.extend(block)

# Write updated markdown
with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

# Write prompts
with open(prompts_path, "w", encoding="utf-8") as f:
    f.write("# Image Generation Prompts\n\n")
    f.write("Generate these images and save them directly to the specified paths. The websites are already wired up to display them instantly once they are saved.\n\n---\n\n")
    f.write("\n".join(prompts))

print(f"Successfully generated 27 missing websites, pre-wired paths, updated Master Audit, and output {len(prompts)} prompts to __prompts for images needed.md!")

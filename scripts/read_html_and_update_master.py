import os
import re

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
people_dir = os.path.join(sandbox, "people")
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

with open(md_path, "r", encoding="utf-8") as f:
    md_lines = f.readlines()

blocks = []
current_block = []

for line in md_lines:
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images") and not line.startswith("**Secret"):
        if current_block:
            blocks.append(current_block)
        current_block = [line]
    else:
        current_block.append(line)
if current_block:
    blocks.append(current_block)

final_lines = []

for block in blocks:
    website = None
    card_line_idx = -1
    website_images_line_idx = -1
    
    for i, line in enumerate(block):
        m = re.match(r"^\*\s+\*\*Website:\*\*\s+`?([^`\s]+)`?", line.strip())
        if m:
            website = m.group(1).strip()
            
        if line.strip().startswith("* **Card Image:**"):
            card_line_idx = i
        if line.strip().lower().startswith("* **website images:**"):
            website_images_line_idx = i
            
    if website and website.endswith(".html"):
        html_file = os.path.join(people_dir, website)
        if os.path.exists(html_file):
            with open(html_file, "r", encoding="utf-8") as f:
                html_content = f.read()
                
            # Extract all images in order
            # We want src="..." and url(...)
            
            # Simple approach: Find all matches with their index in the string so we can sort them
            image_paths = []
            
            for m in re.finditer(r'<img[^>]*src=["\']([^"\']+)["\'][^>]*>', html_content, re.IGNORECASE):
                image_paths.append((m.start(), m.group(1)))
                
            for m in re.finditer(r'url\([\'"]?([^\'")]+)[\'"]?\)', html_content, re.IGNORECASE):
                image_paths.append((m.start(), m.group(1)))
                
            # Sort by order of appearance in HTML
            image_paths.sort(key=lambda x: x[0])
            
            ordered_paths = [p[1] for p in image_paths]
            
            # Remove duplicates while preserving order
            unique_paths = []
            for p in ordered_paths:
                if p not in unique_paths:
                    unique_paths.append(p)
            
            card_image = "MISSING WEBSITE IMAGE(S)"
            # Identify Card Image (usually the first url() match, or background)
            for m in re.finditer(r'url\([\'"]?([^\'")]+)[\'"]?\)', html_content, re.IGNORECASE):
                card_image = m.group(1)
                break
                
            # Update the block
            if card_line_idx != -1:
                if card_image != "MISSING WEBSITE IMAGE(S)":
                    block[card_line_idx] = f"* **Card Image:** `{card_image}`\n"
                else:
                    block[card_line_idx] = f"* **Card Image:** {card_image}\n"
                    
            if website_images_line_idx != -1:
                if unique_paths:
                    formatted_paths = ", ".join([f"`{p}`" for p in unique_paths])
                    # Preserve the exact formatting of the key (Website Images vs website images)
                    key_text = block[website_images_line_idx].split("**")[1]
                    block[website_images_line_idx] = f"* **{key_text}** {formatted_paths}\n"
                else:
                    key_text = block[website_images_line_idx].split("**")[1]
                    block[website_images_line_idx] = f"* **{key_text}** MISSING WEBSITE IMAGE(S)\n"

    final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print("Successfully scanned HTML files (Read-Only) and updated MASTER_Final_Network.md!")

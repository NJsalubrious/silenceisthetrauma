import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\people"
files_to_update = [
    "keep_it_real_bro.html",
    "zero_state_media.html",
    "conflict_reporter.html"
]

injection_tag = '    <script src="pixelstortion-overlay.js"></script>\n'

for filename in files_to_update:
    filepath = os.path.join(sandbox, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "pixelstortion-overlay.js" not in content:
            # Inject before </body>
            new_content = content.replace('</body>', f'{injection_tag}</body>')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Injected overlay into {filename}")
        else:
            print(f"Overlay already exists in {filename}")
    else:
        print(f"File not found: {filename}")

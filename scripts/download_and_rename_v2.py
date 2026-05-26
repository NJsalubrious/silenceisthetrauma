import os
import re
import shutil
import urllib.request
import urllib.parse
import urllib.error

workspace = r'C:\SILENCE_IS_THE_TRAUMA'
md_path = os.path.join(workspace, r'SILENCE_IS_THE_TRAUMA INFO\ECO-SYSTEM-OVERVIEW\Final_Network_Overview_18_05_26_A.md')

avatars_dir = os.path.join(workspace, r'assets\images\characters\avatars')
cards_dir = os.path.join(workspace, r'assets\images\characters\cards')

def generate_seo_name(name, profession, suffix):
    raw = f"{name} {profession} {suffix}".lower()
    raw = re.sub(r'[^a-z0-9\s-]', '', raw)
    raw = re.sub(r'\s+', '-', raw)
    return raw + ".jpg"

with open(md_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
current_name = ""
current_profession = ""
name_to_paths = {}

def process_image(src, dest_path):
    if os.path.exists(dest_path):
        return True # already processed
    
    if src.startswith("http://") or src.startswith("https://"):
        try:
            # properly encode URL
            parts = list(urllib.parse.urlsplit(src))
            parts[2] = urllib.parse.quote(urllib.parse.unquote(parts[2]))
            encoded_src = urllib.parse.urlunsplit(parts)
            
            req = urllib.request.Request(encoded_src, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
                shutil.copyfileobj(response, out_file)
            return True
        except Exception as e:
            print(f"Failed to download {encoded_src}: {e}")
            return False
    else:
        # local file
        src = src.replace('/', '\\')
        
        # Resolve against people dir or workspace dir
        possible_paths = [
            os.path.join(workspace, 'people', src),
            os.path.join(workspace, 'people', src.replace('people\\', '')),
            os.path.join(workspace, src)
        ]
        
        local_src = None
        for p in possible_paths:
            if os.path.exists(p):
                local_src = p
                break
                
        if local_src:
            try:
                shutil.copy(local_src, dest_path)
                return True
            except Exception as e:
                print(f"Failed to copy {local_src}: {e}")
                return False
        else:
            print(f"Local file not found: {src}")
            return False

for line in lines:
    name_match = re.match(r'^\*\*([^\*]+)\*\*', line.strip())
    if name_match:
        current_name = name_match.group(1).strip()
        current_profession = ""
        new_lines.append(line)
        continue
        
    prof_match = re.match(r'^\*\s+\*\*Profession:\*\*\s+(.*)', line.strip())
    if prof_match:
        current_profession = prof_match.group(1).strip()
        new_lines.append(line)
        continue
        
    avatar_match = re.match(r'^\*\s+\*\*Avatar:\*\*\s+(.*)', line.strip())
    if avatar_match:
        val = avatar_match.group(1).strip()
        if "MISSING" not in val and current_name:
            src = val.strip('')
            seo_name = generate_seo_name(current_name, current_profession, 'avatar')
            dest_path = os.path.join(avatars_dir, seo_name)
            relative_new_path = f"assets/images/characters/avatars/{seo_name}"
            
            if relative_new_path == src:
                new_lines.append(line) # already updated
                if current_name not in name_to_paths: name_to_paths[current_name] = {}
                name_to_paths[current_name]['avatar'] = relative_new_path
            elif process_image(src, dest_path):
                new_lines.append(f'* **Avatar:** {relative_new_path}\n')
                if current_name not in name_to_paths: name_to_paths[current_name] = {}
                name_to_paths[current_name]['avatar'] = relative_new_path
            else:
                new_lines.append(line) # keep original if failed
        else:
            new_lines.append(line)
        continue
        
    card_match = re.match(r'^\*\s+\*\*Card Image:\*\*\s+(.*)', line.strip())
    if card_match:
        val = card_match.group(1).strip()
        if "MISSING" not in val and current_name:
            src = val.strip('')
            seo_name = generate_seo_name(current_name, current_profession, 'card')
            dest_path = os.path.join(cards_dir, seo_name)
            relative_new_path = f"assets/images/characters/cards/{seo_name}"
            
            if relative_new_path == src:
                new_lines.append(line)
                if current_name not in name_to_paths: name_to_paths[current_name] = {}
                name_to_paths[current_name]['card_image'] = relative_new_path
            elif process_image(src, dest_path):
                new_lines.append(f'* **Card Image:** {relative_new_path}\n')
                if current_name not in name_to_paths: name_to_paths[current_name] = {}
                name_to_paths[current_name]['card_image'] = relative_new_path
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
        continue

    new_lines.append(line)

with open(md_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

# Now update JSON files
import json

json_files = [
    r'C:\SILENCE_IS_THE_TRAUMA\SILENCE_IS_THE_TRAUMA INFO\ECO-SYSTEM-OVERVIEW\profiles_wip.json.bak',
    r'C:\SILENCE_IS_THE_TRAUMA\SILENCE_IS_THE_TRAUMA INFO\ECO-SYSTEM-OVERVIEW\profiles_fOR_iMAGES.json'
]

def normalize(name):
    n = name.lower().replace("'", "").replace('"', '').strip()
    n = re.sub(r'\(.*?\)', '', n).strip()
    return n

normalized_map = {normalize(k): v for k, v in name_to_paths.items()}

for jf in json_files:
    try:
        with open(jf, 'r', encoding='utf-8') as f:
            data = json.load(f)
            modified = False
            for item in data:
                n = normalize(item.get('display_name', ''))
                if n in normalized_map:
                    if 'avatar' in normalized_map[n] and item.get('avatar') != normalized_map[n]['avatar']:
                        item['avatar'] = normalized_map[n]['avatar']
                        modified = True
                    if 'card_image' in normalized_map[n] and item.get('card_image') != normalized_map[n]['card_image']:
                        item['card_image'] = normalized_map[n]['card_image']
                        modified = True
        if modified:
            with open(jf, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print(f"Updated JSON: {jf}")
    except Exception as e:
        print(f"Error processing JSON {jf}: {e}")

print("Done.")

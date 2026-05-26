import os
import json
import urllib.request
import urllib.parse
import shutil
import ssl

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
live_json_path = os.path.join(sandbox, "___master_point_of_truth", "profiles", "profiles.json")
old_images_dir = os.path.join(sandbox, "___misc_rnd_files", "old_Character_site_images")
assets_dir = os.path.join(sandbox, "assets", "images", "characters", "avatars")

os.makedirs(assets_dir, exist_ok=True)

with open(live_json_path, "r", encoding="utf-8") as f:
    profiles = json.load(f)

existing_images = {}
for root, dirs, files in os.walk(old_images_dir):
    for file in files:
        if file.lower().endswith((".jpg", ".png", ".jpeg")):
            existing_images[file.lower()] = os.path.join(root, file)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

downloaded = 0
copied = 0
failed = []

print("Starting avatar sync...")

for p in profiles:
    if "avatar" in p:
        pid = p.get("id", p.get("handle", "unknown")).replace("@", "")
        avatar_path = p["avatar"]
        
        # Determine extension
        ext = ".jpg"
        if avatar_path.lower().endswith(".png"): ext = ".png"
        elif avatar_path.lower().endswith(".jpeg"): ext = ".jpeg"
        
        target_name = f"{pid.replace('_', '-')}-avatar{ext}"
        target_path = os.path.join(assets_dir, target_name)
        
        if "http" in avatar_path:
            # Download from Cloudflare
            try:
                # urlretrieve handles spaces if the url is properly encoded. But avatar_path is already encoded (e.g. %20)
                req = urllib.request.Request(avatar_path, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, context=ctx) as response, open(target_path, 'wb') as out_file:
                    shutil.copyfileobj(response, out_file)
                downloaded += 1
            except Exception as e:
                failed.append((avatar_path, str(e)))
        else:
            # Local exact match
            raw_filename = avatar_path.split("/")[-1]
            decoded_filename = urllib.parse.unquote(raw_filename).lower()
            if decoded_filename in existing_images:
                source_path = existing_images[decoded_filename]
                try:
                    shutil.copy2(source_path, target_path)
                    copied += 1
                except Exception as e:
                    failed.append((source_path, str(e)))
            else:
                failed.append((decoded_filename, "Local file not found during strict match"))

print(f"Successfully downloaded from Cloudflare: {downloaded}")
print(f"Successfully copied from local: {copied}")
if failed:
    print(f"Failed to sync {len(failed)} files.")
    for f in failed[:5]:
        print(f" - {f[0]}: {f[1]}")

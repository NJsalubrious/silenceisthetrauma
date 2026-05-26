import os
import json
import urllib.parse

sandbox = r"C:\SILENCE_IS_THE_TRAUMA"
live_json_path = os.path.join(sandbox, "NETWORK_PEOPLE_SANDBOX", "___master_point_of_truth", "profiles", "profiles.json")

# Load profiles
with open(live_json_path, "r", encoding="utf-8") as f:
    profiles = json.load(f)

# Extract expected filenames
expected_filenames = []
for p in profiles:
    if "avatar" in p:
        avatar_path = p["avatar"]
        raw_filename = avatar_path.split("/")[-1]
        decoded_filename = urllib.parse.unquote(raw_filename).lower()
        expected_filenames.append((p.get("id", "unknown"), decoded_filename))

# Traverse the entire SILENCE_IS_THE_TRAUMA directory
print("Scanning entire SILENCE_IS_THE_TRAUMA directory...")
master_index = {}
for root, dirs, files in os.walk(sandbox):
    # skip obvious non-image dirs to speed up
    if ".git" in root or "node_modules" in root:
        continue
    for file in files:
        if file.lower().endswith((".jpg", ".png", ".jpeg")):
            f_lower = file.lower()
            if f_lower not in master_index:
                master_index[f_lower] = []
            master_index[f_lower].append(os.path.join(root, file))

found = 0
still_missing = []

print(f"\nTotal unique image names found on disk: {len(master_index)}")

for pid, filename in expected_filenames:
    if filename in master_index:
        found += 1
        # print(f"FOUND {filename} at:")
        # for loc in master_index[filename]:
        #     print(f"  -> {loc}")
    else:
        still_missing.append(filename)

print(f"\nExact matches found ANYWHERE in project: {found} out of {len(expected_filenames)}")
if still_missing:
    print(f"STILL MISSING: {len(still_missing)}")
    print("Example still missing:")
    for m in still_missing[:5]:
        print(f" - {m}")


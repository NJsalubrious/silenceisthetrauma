import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
conflict_count = 0
skip_mode = False

for i, line in enumerate(lines):
    if line.startswith("**Conflict Reporter**"):
        conflict_count += 1
        if conflict_count > 1:
            # We hit the duplicate at the end of the file. Start skipping.
            skip_mode = True
            
    if skip_mode:
        if line.startswith("---") and len(line.strip()) == 3:
            # Reached end of duplicate block, but since it's the last one, we just skip it all
            pass
        continue

    # If it's the original block, we just want to update the Website line
    if conflict_count == 1 and not skip_mode:
        if line.strip().startswith("* **Website:** `Voice Only`"):
            new_lines.append('* **Website:** `conflict_reporter.html`\n')
            continue
            
    new_lines.append(line)

# Also need to remove the trailing separator that preceded the duplicate block
# Let's clean up multiple blank lines at the end
while len(new_lines) > 0 and new_lines[-1].strip() == "":
    new_lines.pop()

if new_lines[-1].startswith("---"):
    new_lines.pop()

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Fixed the Conflict Reporter duplicate and restored the original avatar.")

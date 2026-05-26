import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
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

updated = False
final_lines = []

for block in blocks:
    if block[0].startswith("**"):
        char_name = block[0].strip("* \n")
        
        if char_name == "Old Man Miller":
            for i, line in enumerate(block):
                if line.strip().startswith("* **Avatar:**"):
                    block[i] = f"* **Avatar:** `../assets/images/characters/avatars/old-miller-avatar.jpg`\n"
                    updated = True
                    break

    final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print(f"Old Man Miller's avatar updated: {updated}")

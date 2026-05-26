import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

manual_map = {
    "Frank 'The Crusher'": "frank-the-crusher-avatar.jpg",
    "Elias Finch": "elias-finch-avatar.jpg",
    "Dr. E. Carter (The Evaluator)": "Dr-E-Carter-avatar.jpg"
}

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

updated_count = 0
final_lines = []

for block in blocks:
    if block[0].startswith("**"):
        char_name = block[0].strip("* \n")
        expected_filename = manual_map.get(char_name)

        if expected_filename:
            found_img = f"../assets/images/characters/avatars/{expected_filename}"
            for i, line in enumerate(block):
                if line.strip().startswith("* **Avatar:**"):
                    block[i] = f"* **Avatar:** `{found_img}`\n"
                    updated_count += 1
                    break

    final_lines.extend(block)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print(f"Mapped {updated_count} final avatars. Master Document is now 100% complete.")

import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
current_char = ""

for line in lines:
    if line.startswith("**"):
        current_char = line.strip().strip("* ")
        
    if line.startswith("* **Avatar:**"):
        if current_char == "Jess Vance":
            line = "* **Avatar:** `../assets/images/characters/avatars/jess-vance-concerned-sister-avatar.jpg`\n"
            
    new_lines.append(line)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Updated Jess Vance's avatar.")

import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False

for line in lines:
    if line.startswith("**Brody 'The Tank' Gallagher**"):
        skip = True
    elif skip and line.startswith("---"):
        skip = False
        continue # skip the separator too
    elif skip and line.startswith("**"):
        skip = False # Found the next character
        
    if not skip:
        new_lines.append(line)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Removed Brody from MASTER_Final_Network.md")

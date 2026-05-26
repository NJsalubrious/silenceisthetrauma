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
        
    if line.startswith("* **Website:** `conflict_reporter.html`"):
        if current_char in ["Surry Hills Resident", "Local Resident"]:
            line = "* **Website:** `Voice Only`\n"
            
    new_lines.append(line)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Restored Surry Hills Resident and Local Resident back to 'Voice Only'")

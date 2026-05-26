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
        
    if line.startswith("* **Website:**"):
        if current_char == "Keel Vernon":
            line = "* **Website:** `vernon_asset_recovery.html`\n"
        elif current_char == "Agent Aris Vosh":
            line = "* **Website:** `europol_intel.html`\n"
        elif current_char == "Tourist in Prague":
            line = "* **Website:** `prague_travel_blog.html`\n"
        elif current_char == "Dmitry":
            line = "* **Website:** `prague_penitentiary.html`\n"
        elif current_char == "Jan Horák" or current_char == "Jan Hork":
            line = "* **Website:** `bohemia_airlines.html`\n"
        elif current_char == "Klara Novotná" or current_char == "Klara Novotn":
            line = "* **Website:** `bohemia_airlines.html`\n"
            
    new_lines.append(line)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Mapped the quick sites in the Master Document.")

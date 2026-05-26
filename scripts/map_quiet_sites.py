import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip_mode = False

# First, clean out any existing dummy entries the user added for these three
for line in lines:
    if line.startswith("**OSINT Monitor**") or line.startswith("**Chloe Vance**") or line.startswith("**Jess Vance**"):
        skip_mode = True
    elif skip_mode and line.startswith("---"):
        skip_mode = False
        continue
    elif skip_mode and line.startswith("**"):
        skip_mode = False
        
    if not skip_mode:
        new_lines.append(line)

# Remove trailing newlines cleanly
while len(new_lines) > 0 and new_lines[-1].strip() == "":
    new_lines.pop()

# Add the correctly formatted blocks
new_blocks = """
---

**OSINT Monitor**
* **Profession:** Open-Source Intelligence
* **Location:** Autonomous / Unknown
* **Quote (Surface):** "Everything leaves a digital wake."
* **Influence (Reveal):** An automated or rogue intelligence scraper quietly mapping the entire network's corruption, waiting for the right moment to dump the data.
* **Website:** `osint_monitor.html`
* **Avatar:** `../assets/images/characters/avatars/osint-monitor-open-source-intelligence-avatar.jpg`

---

**Chloe Vance**
* **Profession:** Horticulture Student (Missing)
* **Location:** Last Seen near Langtang Industrial
* **Quote (Surface):** "I just wanted to study the local flora."
* **Influence (Reveal):** A tragic casualty of the network. She found toxic run-off or a cartel dumping ground near the Langtang facility and was quietly "disappeared."
* **Website:** `find_chloe.html`
* **Avatar:** `../assets/images/characters/avatars/chloe-vance-horticulture-student-avatar.jpg`

---

**Jess Vance**
* **Profession:** Concerned Sister
* **Location:** Suburban Grid
* **Quote (Surface):** "Has anyone seen my sister?"
* **Influence (Reveal):** Desperately searching for Chloe. Her efforts are being actively suppressed by local police, including her own corrupt uncle, Officer Vance.
* **Website:** `find_chloe.html`
* **Avatar:** `../assets/images/characters/avatars/chloe-vance-horticulture-student-avatar.jpg`

"""

new_lines.append(new_blocks)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Mapped OSINT, Chloe, and Jess to their new quiet sites in the Master Document.")

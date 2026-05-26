import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False

for line in lines:
    # Skip Chad and Dexter
    if line.startswith("**Chad 'The Bull' Sterling**") or line.startswith("**Dexter 'Dex' Vance**"):
        skip = True
    elif skip and line.startswith("---"):
        skip = False
        continue # skip the separator
    elif skip and line.startswith("**"):
        skip = False # Found next character
        
    if not skip:
        new_lines.append(line)

# Add the consolidated profile
consolidated_profile = """
---

**Keep It Real Bro Podcast**
* **Profession:** Podcast Entity
* **Location:** Austin, Texas
* **Quote (Surface):** "The Iron Discourse. No Filters. Hard Truths."
* **Influence (Reveal):** Hosted by "Useful Idiots" Chad & Dex. Their 'American Freedom' think-tank sponsor is funded entirely by a Russian shell company to push destabilizing propaganda.
* **Website:** `keep_it_real_bro.html`
* **Avatar:** `../assets/images/characters/cards/keep-it-real-bros_serious-discussion.jpg`

"""

# Ensure we don't duplicate if it was already added somehow
new_content = "".join(new_lines)
if "**Keep It Real Bro Podcast**" not in new_content:
    new_lines.append(consolidated_profile)

with open(md_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Consolidated into a single 'Keep It Real Bro Podcast' profile in MASTER_Final_Network.md")

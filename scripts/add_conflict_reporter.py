import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

new_character = """
---

**Conflict Reporter**
* **Profession:** Freelance Correspondent
* **Location:** Global / Active Zones
* **Quote (Surface):** "You get used to the smell of burning paper."
* **Influence (Reveal):** Captures the raw reality of the conflict zones engineered by the system. Sells the horrors to the highest bidder to maintain satellite uplinks.
* **Website:** `conflict_reporter.html`
* **Avatar:** `../assets/images/characters/cards/Conflict_Reporter_wr_correspondent_amougst_ther_ruins.jpg`

"""

with open(md_path, "a", encoding="utf-8") as f:
    f.write(new_character)

print("Added Conflict Reporter to MASTER_Final_Network.md")

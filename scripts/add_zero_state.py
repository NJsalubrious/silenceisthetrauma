import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

new_character = """
---

**Zero State Media**
* **Profession:** Radical Left Podcast / Media Hub
* **Location:** Portland, Oregon
* **Quote (Surface):** "Every interaction is a power dynamic. If you aren't dismantling the system, you are the system."
* **Influence (Reveal):** "Ideological Purists". Unknowingly bankrolled by the exact same Russian shell company as the 'Bro' podcast, designed purely to maximize societal polarization and digital disruption.
* **Website:** `zero_state_media.html`
* **Avatar:** `../assets/images/characters/avatars/zero-state-media-avatar.jpg`

"""

with open(md_path, "a", encoding="utf-8") as f:
    f.write(new_character)

print("Added Zero State Media to MASTER_Final_Network.md")

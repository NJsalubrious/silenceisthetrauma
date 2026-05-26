import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

new_characters = """
---

**Chad 'The Bull' Sterling**
* **Profession:** Podcast Host (Keep It Real Bro) / Finance Bro
* **Location:** Austin, Texas
* **Quote (Surface):** "The legacy systems are crumbling, bro. You gotta read between the lines."
* **Influence (Reveal):** "Useful Idiot." His sponsor is a fake American think-tank funded entirely by a Russian shell company to push destabilizing economic narratives.
* **Website:** `keep_it_real_bro.html`
* **Avatar:** `../assets/images/characters/avatars/keep-it-real-bro-avatar.jpg`

---

**Dexter 'Dex' Vance**
* **Profession:** Podcast Host (Keep It Real Bro) / "Philosopher"
* **Location:** Austin, Texas
* **Quote (Surface):** "I'm not saying it's a psy-op, I'm just saying look who benefits."
* **Influence (Reveal):** Unknowingly repeats Kremlin talking points word-for-word fed to him by his producer under the guise of "just asking questions."
* **Website:** `keep_it_real_bro.html`
* **Avatar:** `../assets/images/characters/avatars/keep-it-real-bro-avatar.jpg`

---

**Brody 'The Tank' Gallagher**
* **Profession:** Podcast Host (Keep It Real Bro) / Fitness Influencer
* **Location:** Austin, Texas
* **Quote (Surface):** "Weak men create hard times. And the media wants you weak."
* **Influence (Reveal):** Believes he is a free-thinker, but his "Alpha-Testo" supplement line is manufactured in a sanctioned Russian factory.
* **Website:** `keep_it_real_bro.html`
* **Avatar:** `../assets/images/characters/avatars/keep-it-real-bro-avatar.jpg`

"""

with open(md_path, "a", encoding="utf-8") as f:
    f.write(new_characters)

print("Added Keep It Real Bro characters to MASTER_Final_Network.md")

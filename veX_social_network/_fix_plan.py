plan_path = r'C:\Users\jones\.gemini\antigravity\brain\e3771ab6-ca38-48ed-91be-5ea8fe8eff54\implementation_plan.md'

f = open(plan_path, 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix 1: Ethel avatar from .jpg to .png
content = content.replace('`Ethel_veX.jpg`', '`Ethel_veX.png`')

# Fix 2: Fix Sticky's avatar — he's NOT Shiny Headed Man
# Replace the Sticky row
content = content.replace(
    '| **Sticky** | `@sticky_` | `Shiny_Headed_ManDominic_Ryker_veX.jpg` | \u2705 exists (confirm: is Shiny Headed Man = Sticky?) |',
    '| **Sticky** | `@sticky_` | `sticky_veX.jpg` | \u26a0\ufe0f **MISSING** \u2014 needs creating. Sticky is Kinley\'s operative (the "Stick" in Kinley+Ethel+Stick). NOT the Shiny Headed Man. |'
)

# Fix 3: Add Shiny Headed Man as his own character in the "Also in characters/" section
old_also = """Also in characters/ but not part of the regular posting cast:
- `Dominics_father_veX.jpg` \u2014 Dominic's father (possible memorial/historical post)
- `The_Man_Who_Came_To_Kill_A_GirlDominic_Ryker_veX.jpg` \u2014 lore character (not a poster)
- `The_Man_Who_Climbs_The_raftersDominic_Ryker_veX.jpg` \u2014 recurring fan (Isla posts about him, not a poster himself)"""

new_also = """| **Shiny Headed Man** | `@shiny_head` | `Shiny_Headed_ManDominic_Ryker_veX.jpg` | \u2705 exists. Music industry gatekeeper who tried to gatekeep Isla's band access. From "Shiny Headed Radio Man" song. Sleaze. Rarely posts \u2014 and when he does, it's self-promotional industry drivel. |

Also in characters/ but not part of the regular posting cast:
- `Dominics_father_veX.jpg` \u2014 Dominic's father (possible memorial/historical post)
- `The_Man_Who_Came_To_Kill_A_GirlDominic_Ryker_veX.jpg` \u2014 lore character (not a poster)
- `The_Man_Who_Climbs_The_raftersDominic_Ryker_veX.jpg` \u2014 recurring fan (Isla posts about him, not a poster himself)"""

content = content.replace(old_also, new_also)

# Fix 4: Update the open question about Shiny Headed Man
old_q = '> [!IMPORTANT]\n> **Is Shiny Headed Man = Sticky?**'
new_q = '> [!NOTE]\n> ~~**Is Shiny Headed Man = Sticky?**~~ \u2014 \u2705 RESOLVED. They are two different characters. Shiny Headed Man = music industry gatekeeper (Isla\'s songs). Sticky = Kinley\'s operative (Ethel\'s Chapter 2).'
content = content.replace(old_q, new_q)

old_q2 = "Shiny_Headed_ManDominic_Ryker_veX.jpg` is mapped to Sticky's profile. Confirm this is the right character."
new_q2 = "Now correctly separated. Shiny Headed Man gets his own profile (`@shiny_head`). Sticky needs a new avatar (`sticky_veX.jpg`)."
content = content.replace(old_q2, new_q2)

# Fix 5: Update Ethel missing question
old_ethel_q = """> [!IMPORTANT]
> **Ethel `Ethel_veX.jpg`**"""
new_ethel_q = """> [!NOTE]
> ~~**Ethel avatar**~~ \u2014 \u2705 RESOLVED. Avatar is `Ethel_veX.png` (confirmed by user, will exist)."""
content = content.replace(old_ethel_q, new_ethel_q)

old_ethel_q2 = "This avatar doesn't exist yet. Should I generate one, or will you provide it?"
new_ethel_q2 = "File pending."
content = content.replace(old_ethel_q2, new_ethel_q2)

# Fix 6: Update the glyph question to use plain language
old_glyph = """**Dominic's `\u2588` glyph** \u2014 A neon green block glyph next to Dominic's name, replacing the Twitter verified tick. He verified *himself*. Keep it or drop it?"""
new_glyph = """**Dominic's "verified" symbol** \u2014 Like Twitter's blue checkmark \u2713, but instead a neon green block \u2588 next to Dominic's name. He verified *himself*. Just a visual flex. Keep it or drop it?"""
content = content.replace(old_glyph, new_glyph)

# Fix 7: Also fix the profiles.json schema to use .png
content = content.replace(
    '"avatar": "/veX_social_network/characters/Ethel_veX.jpg"',
    '"avatar": "/veX_social_network/characters/Ethel_veX.png"'
)

f = open(plan_path, 'w', encoding='utf-8')
f.write(content)
f.close()
print('Done. All fixes applied.')

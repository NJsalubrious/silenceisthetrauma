import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")
assets_dir = os.path.join(sandbox, "assets", "images", "characters", "avatars")

rename_map = {
    "writers_lowres_0000_Mara Quinn_723d75_0b85ffad2cef469588e01929be912105.jpg": "mara-quinn-avatar.jpg",
    "writers_lowres_0001_writer_Eliza Trenholm_723d75_e5f0960ba8e2405599982644f075178b.jpg": "eliza-trenholm-music-blogger-avatar.jpg",
    "writers_lowres_0002_writer_Michael Harren_723d75_badf4c094d674e9ebd4f874c1c790a42.jpg": "michael-harren-field-researcher-avatar.jpg",
    "writers_lowres_0003_writer_Julia Renn_723d75_3363d08e635243d8a6feb96980935e19.jpg": "julia-renn-culture-correspondent-avatar.jpg",
    "writers_lowres_0004_writer_Eli Ward_723d75_70ed51aed1d34e9f8e0c9eb3feb91d49.jpg": "eli-ward-music-journalist-avatar.jpg",
    "writers_lowres_0005_writer_Kate Jennings_723d75_fffd8742500b4d8abcce3b098a0d861a.jpg": "kate-jennings-avatar.jpg"
}

renamed = 0
for old_name, new_name in rename_map.items():
    old_path = os.path.join(assets_dir, old_name)
    new_path = os.path.join(assets_dir, new_name)
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
        renamed += 1

# Now fix the markdown
with open(md_path, "r", encoding="utf-8") as f:
    content = f.read()

for old_name, new_name in rename_map.items():
    content = content.replace(f"../assets/images/characters/avatars/{old_name}", f"../assets/images/characters/avatars/{new_name}")

with open(md_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Renamed {renamed} writer files and updated references in MD.")

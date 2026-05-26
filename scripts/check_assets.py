@
import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
avatars = os.path.join(sandbox, "assets", "images", "characters", "avatars")
cards = os.path.join(sandbox, "assets", "images", "characters", "cards")

if os.path.exists(avatars):
    files = os.listdir(avatars)
    print(f"Avatars count: {len(files)}")
    print(files[:5])
else:
    print("Avatars dir missing")
    
if os.path.exists(cards):
    files = os.listdir(cards)
    print(f"Cards count: {len(files)}")
    print(files[:5])
else:
    print("Cards dir missing")
@

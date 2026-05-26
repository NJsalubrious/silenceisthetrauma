import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX"
md_path = os.path.join(sandbox, "___master_point_of_truth", "MASTER_Final_Network.md")

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

missing_avatars = []
current_name = None

for line in lines:
    if line.startswith("**") and not line.startswith("**Profession") and not line.startswith("**Location") and not line.startswith("**Quote") and not line.startswith("**Influence") and not line.startswith("**Website") and not line.startswith("**Avatar") and not line.startswith("**Card") and not line.startswith("**website images") and not line.startswith("**Website Images") and not line.startswith("**Secret"):
        current_name = line.strip("* \n")
    
    if line.strip().startswith("* **Avatar:**"):
        if "MISSING WEBSITE IMAGE(S)" in line:
            if current_name:
                missing_avatars.append(current_name)

print("Characters currently listed with MISSING Avatars:")
for i, name in enumerate(missing_avatars, 1):
    print(f"{i}. {name}")

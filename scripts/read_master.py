@
import os

md_path = r"C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX\___master_point_of_truth\MASTER_Final_Network.md"

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()
    
print("Total lines:", len(lines))
print("First 40 lines:")
for i in range(40):
    if i < len(lines):
        print(lines[i].strip())
@

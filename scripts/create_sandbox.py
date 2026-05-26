import os
import shutil

source_root = r'C:\SILENCE_IS_THE_TRAUMA'
sandbox = r'C:\SILENCE_IS_THE_TRAUMA\NETWORK_PEOPLE_SANDBOX'

if not os.path.exists(sandbox):
    os.makedirs(sandbox)

# 1. Copy Assets
assets_src = os.path.join(source_root, 'assets')
assets_dest = os.path.join(sandbox, 'assets')
if os.path.exists(assets_src):
    if os.path.exists(assets_dest):
        shutil.rmtree(assets_dest)
    shutil.copytree(assets_src, assets_dest)
    print("Copied assets/")

# 2. Copy People
people_src = os.path.join(source_root, 'people')
people_dest = os.path.join(sandbox, 'people')
if os.path.exists(people_src):
    if os.path.exists(people_dest):
        shutil.rmtree(people_dest)
    shutil.copytree(people_src, people_dest)
    print("Copied people/")

# 3. Copy Audit Files
audit_files = [
    r'SILENCE_IS_THE_TRAUMA INFO\ECO-SYSTEM-OVERVIEW\Final_Network_Overview_18_05_26_A.md',
    r'SILENCE_IS_THE_TRAUMA INFO\ECO-SYSTEM-OVERVIEW\profiles_wip.json.bak',
    r'SILENCE_IS_THE_TRAUMA INFO\ECO-SYSTEM-OVERVIEW\profiles_fOR_iMAGES.json'
]

for f in audit_files:
    src = os.path.join(source_root, f)
    if os.path.exists(src):
        shutil.copy(src, sandbox)
        print(f"Copied {os.path.basename(f)}")

print(f"Sandbox created successfully at {sandbox}")

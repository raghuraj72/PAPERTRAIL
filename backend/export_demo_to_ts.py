import json
from pathlib import Path

def main():
    src_file = Path("backend/data/workspaces/ws_e7c81f23.json")
    if not src_file.exists():
        files = list(Path("backend/data/workspaces").glob("ws_*.json"))
        src_file = files[0]
        
    with open(src_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    dest_file = Path("frontend/src/services/demoData.ts")
    content = 'import { Workspace } from "../types";\n\nexport const DEMO_WORKSPACE: Workspace = ' + json.dumps(data, indent=2) + ';\n'
    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Successfully exported demo data to {dest_file} ({dest_file.stat().st_size} bytes)")

if __name__ == "__main__":
    main()

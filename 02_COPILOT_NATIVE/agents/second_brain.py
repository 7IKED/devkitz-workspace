import os

DEVKITZ_REPO = "C:\\DEVKiTZ"

def query_second_brain(query):
    print(f"🧠 [Second Brain] Querying local Obsidian & Iceberg knowledge base for: {query}")
    
    # Simple Mock: Read context from REGELWERK.md and CLAUDE.md if available
    context = ""
    for md_file in ["REGELWERK.md", "CLAUDE.md"]:
        path = os.path.join(DEVKITZ_REPO, md_file)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                context += f"\n--- {md_file} ---\n{f.read()[:1000]}...\n" # Limit to 1000 chars per file for context
                
    if not context:
        context = "Keine Second Brain Dateien (REGELWERK.md, CLAUDE.md) gefunden."
        
    return context

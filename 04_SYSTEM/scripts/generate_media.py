import asyncio
import json
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="uvx",
        args=["--from", "notebooklm-mcp-cli", "notebooklm-mcp"]
    )
    
    desktop_path = os.path.join(os.environ["USERPROFILE"], "Desktop", "NLM_MCP_MediaKit")
    os.makedirs(desktop_path, exist_ok=True)
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            print("Überprüfe Authentifizierung...")
            res = await session.call_tool("notebook_list", arguments={"max_results": 1})
            if "No authentication found" in str(res.content):
                print("FEHLER: Nicht authentifiziert! Bitte 'nlm login' ausführen.")
                sys.exit(1)

            print("1. Erstelle neues Notebook 'OPENNEXUZ - MCP & Python'...")
            nb_res = await session.call_tool("notebook_create", arguments={"title": "OPENNEXUZ - MCP & Python"})
            nb_info = json.loads(nb_res.content[0].text)
            notebook_id = nb_info.get("notebook_id")
            
            if not notebook_id:
                print("Konnte Notebook nicht erstellen:", nb_res.content)
                sys.exit(1)
            print(f"Notebook ID: {notebook_id}")

            print("2. Lade CONTEXT.md als Source hoch...")
            source_res = await session.call_tool("source_add", arguments={
                "notebook_id": notebook_id,
                "source_type": "file",
                "file_path": r"C:\DEVKiTZ\CONTEXT.md",
                "title": "DEVKiTZ System Context",
                "wait": True
            })
            print(source_res.content[0].text)
            
            print("3. Generiere Audio Podcast...")
            audio_res = await session.call_tool("studio_create", arguments={
                "notebook_id": notebook_id,
                "artifact_type": "audio",
                "confirm": True
            })
            print(audio_res.content[0].text)

            print("4. Generiere Infografik...")
            info_res = await session.call_tool("studio_create", arguments={
                "notebook_id": notebook_id,
                "artifact_type": "infographic",
                "confirm": True
            })
            print(info_res.content[0].text)
            
            print("5. Generiere Präsentation (Slides)...")
            slides_res = await session.call_tool("studio_create", arguments={
                "notebook_id": notebook_id,
                "artifact_type": "slide_deck",
                "slide_format": "detailed_deck",
                "confirm": True
            })
            print(slides_res.content[0].text)

            print("6. Lade Dateien herunter...")
            await session.call_tool("download_artifact", arguments={
                "notebook_id": notebook_id,
                "artifact_type": "audio",
                "output_path": os.path.join(desktop_path, "OPENNEXUZ_Podcast.wav")
            })
            await session.call_tool("download_artifact", arguments={
                "notebook_id": notebook_id,
                "artifact_type": "infographic",
                "output_path": os.path.join(desktop_path, "OPENNEXUZ_Infographic.png")
            })
            await session.call_tool("download_artifact", arguments={
                "notebook_id": notebook_id,
                "artifact_type": "slide_deck",
                "output_path": os.path.join(desktop_path, "OPENNEXUZ_Slides.pdf")
            })
            
            print("Alle Medien wurden erfolgreich im NLM_MCP_MediaKit Ordner auf dem Desktop gespeichert!")

if __name__ == "__main__":
    asyncio.run(main())

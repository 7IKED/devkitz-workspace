import asyncio
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="uvx",
        args=["--from", "notebooklm-mcp-cli", "notebooklm-mcp"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # List tools and their schema
            tools = await session.list_tools()
            for tool in tools.tools:
                if tool.name in ["notebook_list", "notebook_create", "source_add", "studio_create", "studio_status", "download_artifact"]:
                    print(f"--- {tool.name} ---")
                    print(json.dumps(tool.inputSchema, indent=2))

if __name__ == "__main__":
    asyncio.run(main())

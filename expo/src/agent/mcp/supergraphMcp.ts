import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { experimental_createMCPClient, tool } from "ai";
import { z } from "zod/v4";

export async function getTools() {
  const supergraphMcpClient = await experimental_createMCPClient({
    transport: new StreamableHTTPClientTransport(
      new URL("http://127.0.0.1:5000/mcp")
    ),
  });
  const tools = await supergraphMcpClient.tools();
  return {
    tools: {
      ...tools,
      getCurrentEvent: tool({
        ...tools.GetEvents,
        description: `Get details about the current event.`,
        inputSchema: z.object({}),
        execute: (_, options) =>
          tools.GetEvents.execute(
            { ids: [process.env.EXPO_PUBLIC_CURRENT_EVENT] },
            options
          ),
      }),
    },
    close: () => supergraphMcpClient.close(),
  };
}

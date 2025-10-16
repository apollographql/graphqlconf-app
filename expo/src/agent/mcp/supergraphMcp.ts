import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { experimental_createMCPClient, jsonSchema, tool } from "ai";
import { AgentContext } from "@/agent/AgentContext";

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
        inputSchema: jsonSchema({
          type: "object",
          properties: {},
          additionalProperties: false,
        }),
        execute: (_, options) =>
          tools.GetEvents.execute(
            {
              ids: [
                (options.experimental_context as AgentContext).currentEvent,
              ],
            },
            options
          ),
      }),
    },
    close: () => supergraphMcpClient.close(),
  };
}

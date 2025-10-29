import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { experimental_createMCPClient, tool } from "ai";
import { AgentContext } from "@/agent/AgentContext";
import { validatingJSONSchema } from "@/utils/validatingJSONSchema";

export async function getTools() {
  const supergraphMcpClient = await experimental_createMCPClient({
    transport: new StreamableHTTPClientTransport(
      new URL(process.env.GRAPH_MCP_SERVER!)
    ),
  });
  try {
    const tools = await supergraphMcpClient.tools();
    return {
      tools: {
        ...tools,
        getCurrentEvent: tool({
          ...tools.GetEvents,
          description: `Get details about the current event.`,
          inputSchema: validatingJSONSchema({
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
      } as typeof tools,
      close: () => supergraphMcpClient.close(),
    };
  } catch (e) {
    console.log(
      "Error fetching MCP tools from %s: %o",
      process.env.GRAPH_MCP_SERVER,
      e
    );
    return {
      tools: {},
      close: () => supergraphMcpClient.close(),
    };
  }
}

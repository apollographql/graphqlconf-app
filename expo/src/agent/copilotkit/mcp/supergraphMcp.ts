import { ExtendedMCPEndpointConfig } from "../agent";
import { MCPTool } from "@copilotkit/runtime";

export const supergraphMcp: ExtendedMCPEndpointConfig = {
  endpoint: process.env.GRAPH_MCP_SERVER!,
  async create(config, defaultCreate) {
    const supergraphMcpClient = await defaultCreate(config);
    return {
      ...supergraphMcpClient,
      tools: async () => {
        const { execute: _, ...tools } = await supergraphMcpClient.tools();
        return {
          ...tools,
          getCurrentEvent: {
            description: `Get details about the current event.`,
            schema: {
              parameters: {
                properties: {},
                required: [],
              },
            },
            execute: () =>
              tools.GetEvents.execute({
                ids: [process.env.EXPO_PUBLIC_CURRENT_EVENT],
              }),
          } satisfies MCPTool,
        };
      },
    };
  },
};

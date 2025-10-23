import {
  CopilotRuntime,
  CopilotRuntimeChatCompletionRequest,
  CopilotRuntimeChatCompletionResponse,
  MCPClient,
  MCPEndpointConfig,
  MCPTool,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";
import { supergraphMcp } from "./mcp/supergraphMcp";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { availableFragmentComponents } from "../clientTools/fragmentComponentEmbeds";

class InterceptingServiceAdapter extends OpenAIAdapter {
  process(
    request: CopilotRuntimeChatCompletionRequest
  ): Promise<CopilotRuntimeChatCompletionResponse> {
    /*
     * The `jsonSchemaToActionParameters` function only supports a subset of actual JSON Schema,
     * and the workflow of JSONSchema -> Parameters -> JSONSchema leads to loss of a lot of relevant information.
     * (https://github.com/CopilotKit/CopilotKit/pull/2652 is only the tip of the iceberg here, `const` is also lost,
     * as are many other keywords.)
     * To work around this, we intercept the request here and patch the action definitions
     * to use the original JSON Schema from the fragmentComponentEmbeds definitions.
     */
    const actions = (request.actions || []).map((action) => {
      if (action.name.startsWith("ShowEmbed-")) {
        const embed =
          availableFragmentComponents[
            action.name.substring(
              "ShowEmbed-".length
            ) as keyof typeof availableFragmentComponents
          ];
        if (embed?.schema) {
          action.jsonSchema = JSON.stringify(embed.schema.jsonSchema);
        }
      }
      return action;
    });
    return super.process({ ...request, actions });
  }
}

const serviceAdapter = new InterceptingServiceAdapter({
  model: "gpt-4o",
});

const defaultCreateMCPClient: CreateMCPClientFunction = async (
  config
): Promise<MCPClient> => {
  const client = new Client({
    name: "streamable-http-client",
    version: "1.0.0",
  });
  const transport = new StreamableHTTPClientTransport(
    new URL(config.endpoint),
    {
      requestInit: {
        headers: config.apiKey
          ? { Authorization: `Bearer ${config.apiKey}` }
          : undefined,
      },
    }
  );
  await client.connect(transport);

  return {
    async tools() {
      const { tools } = await client.listTools();
      const acc: Record<string, MCPTool> = {};
      for (const tool of tools) {
        acc[tool.name] = {
          description: tool.description,
          schema: tool.inputSchema as any,
          execute: async (args: unknown) => {
            const result = await client.callTool({
              name: tool.name,
              arguments: args as any,
            });
            console.log(
              `MCP Tool ${tool.name} called with args:`,
              args,
              "result:",
              result
            );
            return result;
          },
        };
      }
      console.log("MCP Tools loaded:", acc);
      return acc;
    },
    close() {
      return client.close();
    },
  };
};

export interface ExtendedMCPEndpointConfig extends MCPEndpointConfig {
  create?(
    config: MCPEndpointConfig,
    defaultCreate: CreateMCPClientFunction
  ): ReturnType<CreateMCPClientFunction>;
}

type CreateMCPClientFunction = NonNullable<
  NonNullable<
    ConstructorParameters<typeof CopilotRuntime>[0]
  >["createMCPClient"]
>;

// Create runtime instance with MCP server configuration
const runtime = new CopilotRuntime({
  mcpServers: [supergraphMcp] satisfies ExtendedMCPEndpointConfig[],
  createMCPClient(config: ExtendedMCPEndpointConfig) {
    return config.create
      ? config.create(config, defaultCreateMCPClient)
      : defaultCreateMCPClient(config);
  },
});

// Create endpoint handler
const copilotKitHandler = copilotRuntimeNodeHttpEndpoint({
  endpoint: "/copilotkit",
  runtime,
  serviceAdapter,
});

export async function handler(request: Request): Promise<Response> {
  const result = await copilotKitHandler(request);
  return new Response(result.body, {
    headers: result.headers,
    status: result.status,
  });
}

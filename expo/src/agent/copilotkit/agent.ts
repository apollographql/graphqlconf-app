import {
  CopilotRuntime,
  MCPEndpointConfig,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";
import { experimental_createMCPClient } from "ai";
import { supergraphMcp } from "./mcp/supergraphMcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const serviceAdapter = new OpenAIAdapter({
  model: "gpt-4o",
});

const defaultCreateMCPClient: CreateMCPClientFunction = (config) => {
  return experimental_createMCPClient({
    transport: new StreamableHTTPClientTransport(new URL(config.endpoint), {
      requestInit: {
        headers: config.apiKey
          ? { Authorization: `Bearer ${config.apiKey}` }
          : undefined,
      },
    }),
  }) as any;
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

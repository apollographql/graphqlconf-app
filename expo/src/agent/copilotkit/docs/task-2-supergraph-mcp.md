# Task 2: Supergraph MCP Integration

**Goal**: Connect CopilotKit runtime to local MCP server for GraphQL operations (sessions, events, speakers, places).

**Status**: ✅ Complete

**Dependencies**: Task 1 (Basic Chat Integration)

**Estimated Effort**: 3-4 hours

---

## 📋 Overview

This task integrates the local Apollo MCP server (`http://127.0.0.1:5000/mcp`) with CopilotKit, exposing all GraphQL operations from `connector/operations/` as AI tools. The agent will be able to query conference data and nearby places.

---

## 🎯 Success Criteria

- ✅ CopilotKit server-side runtime connects to local MCP server
- ✅ All MCP tools available to server-side agent:
  - `GetEvents` - Fetch conference events
  - `GetSessions` - Fetch conference sessions
  - `GetEntities` - Fetch mixed entity types
  - `GetNearbyPlaces` - Search nearby places
  - `googleMapsGetPlaceDetails` - Get place details
- ✅ Custom `getCurrentEvent` tool wraps `GetEvents` with current event ID
- ✅ Server-side agent can answer questions about sessions, speakers, venues
- ✅ MCP connection gracefully handles server downtime

---

## 📁 Files to Create/Modify

### New Files

- `expo/src/agent/copilotkit/mcp/supergraphMcp.ts` - MCP server configuration

### Modified Files

- [`expo/src/agent/copilotkit/agent.ts`](../agent.ts) - Add MCP server with extended configuration

---

## 🏗️ Implementation Steps

### Step 1: Research CopilotKit MCP Integration

**CopilotKit MCP Support**:

- CopilotKit has **native server-side MCP support** via `CopilotRuntime` with `mcpServers` configuration
- MCP tools automatically become available to the agent via the runtime
- **Server-side integration** - MCP servers configured in the runtime, not client-side

**Documentation**:

- [CopilotKit MCP Integration](https://docs.copilotkit.ai/guides/mcp)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)

---

### Step 2: Create MCP Configuration Helper

**File**: `expo/src/agent/copilotkit/mcp/supergraphMcp.ts` (new file)

```typescript
import { ExtendedMCPEndpointConfig } from "../agent";
import { MCPTool } from "@copilotkit/runtime";

export const supergraphMcp: ExtendedMCPEndpointConfig = {
  endpoint: "http://127.0.0.1:5000/mcp",
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
```

**Key Points**:

- **Extended Configuration**: Uses custom `ExtendedMCPEndpointConfig` interface for MCP client creation hooks
- **Factory Pattern**: `create()` method allows customizing the MCP client before use
- **Tool Extension**: Adds custom `getCurrentEvent` tool that wraps `GetEvents` with current event ID
- **Clean Integration**: Leverages CopilotKit's native MCP support with minimal adapter code

**Reference**: Compare with Vercel SDK:

- [`expo/src/agent/mcp/supergraphMcp.ts:6-37`](../../mcp/supergraphMcp.ts#L6-L37)

---

### Step 3: Configure Agent with Extended MCP Support

**File**: [`expo/src/agent/copilotkit/agent.ts`](../agent.ts)

The `getCurrentEvent` functionality is now implemented directly in the MCP configuration rather than as a separate action.

```typescript
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

// Define custom type for extended MCP configurations
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

// Default MCP client creation function
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

// Create runtime instance with MCP server configuration
const runtime = new CopilotRuntime({
  mcpServers: [supergraphMcp] satisfies ExtendedMCPEndpointConfig[],
  createMCPClient(config: ExtendedMCPEndpointConfig) {
    return config.create
      ? config.create(config, defaultCreateMCPClient)
      : defaultCreateMCPClient(config);
  },
});
```

**Key Changes from Original Plan**:

1. **No Separate Actions**: `getCurrentEvent` is implemented as an MCP tool extension rather than a runtime action
2. **Factory Pattern**: Uses `create()` method in MCP config to customize client behavior
3. **Type Safety**: Proper TypeScript interfaces for extended MCP configurations
4. **Cleaner Architecture**: Leverages CopilotKit's native MCP client creation flow

**Reference**: Compare with Vercel SDK's `getCurrentEvent`:

- [`expo/src/agent/mcp/supergraphMcp.ts:16-33`](../../mcp/supergraphMcp.ts#L16-L33)

---

---

### Step 5: Verify MCP Operations

**Check available operations** in `connector/operations/`:

```bash
ls connector/operations/
```

Expected files:

- `getEvents.graphql`
- `getSessions.graphql`
- `getEntities.graphql`
- `googleMapsGetNearbyPlaces.graphql`
- `googleMapsGetPlaceDetails.graphql`

Each becomes an MCP tool automatically when server runs.

**Start MCP Server**:

```bash
npm run start_rover
```

**Verify MCP Server**:

```bash
curl http://127.0.0.1:5000/mcp
```

Should return MCP capabilities and available tools.

---

## 🧪 Testing Steps

### 1. Start All Services

```bash
# Terminal 1: Start Expo
cd expo
npm start

# Terminal 2: Start Rover (MCP server)
npm run start_rover
```

### 2. Test MCP Connection

Open app → Open Omnibar → Send test queries:

**Test 1: Query Sessions**

```
User: "What sessions are happening today?"
Expected: Agent calls GetSessions tool, returns session list
```

**Test 2: Current Event**

```
User: "Tell me about the current event"
Expected: Agent calls getCurrentEvent action, returns GraphQLConf 2025 details
```

**Test 3: Nearby Places**

```
User: "Find coffee shops near the venue"
Expected: Agent calls GetNearbyPlaces tool, returns places
```

**Test 4: Specific Speaker**

```
User: "Who is speaking about GraphQL Federation?"
Expected: Agent queries sessions/speakers data
```

### 3. Check Logs

**MCP Server Logs** (Terminal 2):

- Should show incoming tool calls
- No errors during queries

**Expo Logs** (Terminal 1):

- "✅ Supergraph MCP server connected"
- No connection errors

**Browser Console**:

- API calls to `/api/copilotkit` succeed (handled by `copilotkit+api.ts`)
- No CORS errors
- Tool calls show in network tab

---

## 🔍 Troubleshooting

### Issue: "Failed to connect to Supergraph MCP server"

**Causes**:

1. Rover not running on port 5000
2. Wrong transport type (http vs sse)
3. CORS issues

**Solutions**:

```bash
# Verify Rover is running
curl http://127.0.0.1:5000/mcp

# Check Rover logs for errors
npm run start_rover

# Try alternative transport in supergraphMcp.ts:
transport: "http" // instead of "sse"
```

### Issue: "getCurrentEvent not found"

**Solution**: Verify action was registered:

```typescript
// Add logging in agent.ts
runtime.addAction({
  name: "getCurrentEvent",
  // ...
});
console.log("getCurrentEvent action registered");
```

### Issue: "Tools not available to agent"

**Causes**:

1. MCP server didn't load operations
2. Runtime not awaited before handler creation

**Solutions**:

```bash
# Check MCP operations exist
ls connector/operations/

# Verify MCP server lists tools
curl http://127.0.0.1:5000/mcp | jq '.tools'
```

### Issue: "Agent doesn't use MCP tools"

**Solution**:

- Improve system prompt to mention available data sources
- Test with more explicit queries: "Use the GetSessions tool to show me today's schedule"
- Check OpenAI API logs for tool selection

---

## 📚 Reference Links

### CopilotKit Documentation

- [MCP Integration Guide](https://docs.copilotkit.ai/guides/mcp)
- [addMCPServer API](https://docs.copilotkit.ai/reference/runtime/addMCPServer)
- [addAction API](https://docs.copilotkit.ai/reference/runtime/addAction)

### MCP Protocol

- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Streamable HTTP Transport](https://github.com/modelcontextprotocol/specification/blob/main/docs/specification/transport/http-sse.md)

### Vercel SDK Comparison

- [`expo/src/agent/mcp/supergraphMcp.ts`](../../mcp/supergraphMcp.ts) - Original implementation
- [`expo/src/agent/vercelSdk/agent.ts:37-43`](../../vercelSdk/agent.ts#L37-L43) - MCP tool usage

### Project Documentation

- [`connector/README.md`](../../../../connector/README.md) - MCP server setup
- [`CLAUDE.md:53-71`](../../../../CLAUDE.md#L53-L71) - MCP server documentation

### Implementation Files

- [`expo/src/agent/copilotkit/mcp/supergraphMcp.ts`](../mcp/supergraphMcp.ts) - Current MCP configuration
- [`expo/src/agent/copilotkit/agent.ts`](../agent.ts) - Current agent implementation
- [`expo/src/app/api/copilotkit+api.ts`](../../../app/api/copilotkit+api.ts) - API endpoint

---

## ✅ Completion Checklist

- [x] `mcp/supergraphMcp.ts` created with extended MCP configuration
- [x] `agent.ts` updated with custom MCP client creation factory
- [x] `getCurrentEvent` tool added via MCP client extension pattern
- [x] All 5 MCP operations verified in `connector/operations/`
- [x] Rover MCP server running on port 5000 (verified with curl)
- [x] MCP connection architecture tested (SSE transport working)
- [x] Clean integration with CopilotKit's native MCP support
- [x] TypeScript interfaces for extended MCP configurations

---

## 🚀 Next Steps

Once Task 2 is complete, proceed to:

- **Task 3**: Fragment Component Embeds - Display rich UI from GraphQL data
- **Task 4**: Local Mutations (Bookmarks) - If not already done

---

**Last Updated**: 2025-10-21

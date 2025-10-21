# Task 2: Supergraph MCP Integration

**Goal**: Connect CopilotKit runtime to local MCP server for GraphQL operations (sessions, events, speakers, places).

**Status**: 🔴 Not Started

**Dependencies**: Task 1 (Basic Chat Integration)

**Estimated Effort**: 3-4 hours

---

## 📋 Overview

This task integrates the local Apollo MCP server (`http://127.0.0.1:5000/mcp`) with CopilotKit, exposing all GraphQL operations from `connector/operations/` as AI tools. The agent will be able to query conference data and nearby places.

---

## 🎯 Success Criteria

- ✅ CopilotKit runtime connects to local MCP server
- ✅ All MCP tools available to agent:
  - `GetEvents` - Fetch conference events
  - `GetSessions` - Fetch conference sessions
  - `GetEntities` - Fetch mixed entity types
  - `GetNearbyPlaces` - Search nearby places
  - `googleMapsGetPlaceDetails` - Get place details
- ✅ Custom `getCurrentEvent` action wraps `GetEvents` with current event ID
- ✅ Agent can answer questions about sessions, speakers, venues
- ✅ MCP connection gracefully handles server downtime

---

## 📁 Files to Create/Modify

### New Files

- `expo/src/agent/copilotkit/mcp/supergraphMcp.ts` - MCP server configuration

### Modified Files

- [`expo/src/agent/copilotkit/agent.ts`](../agent.ts) - Add MCP server and custom action

---

## 🏗️ Implementation Steps

### Step 1: Research CopilotKit MCP Integration

**CopilotKit MCP Support**:

- CopilotKit has **native MCP support** via `CopilotRuntime.addMCPServer()`
- Supports HTTP and Server-Sent Events (SSE) transports
- MCP tools automatically become agent actions
- No custom adapter needed ✅

**Documentation**:

- [CopilotKit MCP Integration](https://docs.copilotkit.ai/guides/mcp)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)

---

### Step 2: Create MCP Configuration Helper

**File**: `expo/src/agent/copilotkit/mcp/supergraphMcp.ts` (new file)

```typescript
import { CopilotRuntime } from "@copilotkit/runtime";

export async function addSupergraphMCP(runtime: CopilotRuntime) {
  try {
    // Add local MCP server
    await runtime.addMCPServer({
      url: "http://127.0.0.1:5000/mcp",
      transport: "sse", // or "http" depending on server support
    });

    console.log("✅ Supergraph MCP server connected");
  } catch (error) {
    console.error("❌ Failed to connect to Supergraph MCP server:", error);
    // Continue without MCP tools - graceful degradation
  }
}
```

**Key Points**:

- Use `sse` transport if supported, fallback to `http`
- Graceful error handling (app works without MCP)
- Async initialization

**Reference**: Compare with Vercel SDK:

- [`expo/src/agent/mcp/supergraphMcp.ts:6-37`](../../mcp/supergraphMcp.ts#L6-L37)

---

### Step 3: Add Custom `getCurrentEvent` Action

**File**: [`expo/src/agent/copilotkit/agent.ts`](../agent.ts)

**Add after runtime initialization**:

```typescript
import { CopilotRuntime } from "@copilotkit/runtime";
import { addSupergraphMCP } from "./mcp/supergraphMcp";
import { z } from "zod";

const runtime = new CopilotRuntime();

// Add MCP server first
await addSupergraphMCP(runtime);

// Add custom action that wraps GetEvents with current event ID
runtime.addAction({
  name: "getCurrentEvent",
  description: "Get details about the current event (GraphQLConf 2025)",
  parameters: z.object({}), // No parameters needed
  handler: async (args, context) => {
    // Extract current event ID from context
    const currentEventId =
      context?.currentEvent || process.env.EXPO_PUBLIC_CURRENT_EVENT;

    if (!currentEventId) {
      throw new Error("Current event ID not found in context");
    }

    // Call the MCP GetEvents tool with current event ID
    // Note: This assumes MCP tools are accessible within the runtime context
    // If not, we may need to call the GraphQL API directly
    return await runtime.callTool("GetEvents", {
      ids: [currentEventId],
    });
  },
});
```

**Alternative Approach** (if `runtime.callTool` doesn't exist):

Use GraphQL client directly:

```typescript
import { AgentContext } from "@/agent/AgentContext";

runtime.addAction({
  name: "getCurrentEvent",
  description: "Get details about the current event (GraphQLConf 2025)",
  parameters: z.object({}),
  handler: async (args, context) => {
    const agentContext = context as AgentContext;
    const currentEventId = agentContext.currentEvent;

    // Call GraphQL API directly via MCP execute endpoint
    const response = await fetch("http://127.0.0.1:5000/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: "GetEvents",
          arguments: { ids: [currentEventId] },
        },
        id: Date.now(),
      }),
    });

    const result = await response.json();
    return result.result;
  },
});
```

**Reference**: Compare with Vercel SDK's `getCurrentEvent`:

- [`expo/src/agent/mcp/supergraphMcp.ts:16-33`](../../mcp/supergraphMcp.ts#L16-L33)

---

### Step 4: Update Agent Initialization

**File**: [`expo/src/agent/copilotkit/agent.ts`](../agent.ts)

**Complete implementation**:

```typescript
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { prompt } from "../prompt";
import { addSupergraphMCP } from "./mcp/supergraphMcp";
import { z } from "zod";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: process.env.OPENAI_ORG_ID,
});

const serviceAdapter = new OpenAIAdapter({
  openai,
  model: "gpt-4o",
});

// Create runtime
const runtime = new CopilotRuntime();

// Initialize MCP connection
// Note: This must be done before creating the handler
// Consider wrapping in an async IIFE or using top-level await
(async () => {
  await addSupergraphMCP(runtime);

  // Add custom getCurrentEvent action
  runtime.addAction({
    name: "getCurrentEvent",
    description: "Get details about the current event (GraphQLConf 2025)",
    parameters: z.object({}),
    handler: async (args, context) => {
      // Implementation from Step 3
      const currentEventId = process.env.EXPO_PUBLIC_CURRENT_EVENT;
      // Call MCP tool or GraphQL API
      // ... (see Step 3 for details)
    },
  });
})();

// Create handler
const handler = copilotRuntimeNodeHttpEndpoint({
  endpoint: "/copilotkit",
  runtime,
  serviceAdapter,
  async transformRequest(req) {
    const body = await req.json();
    const { context } = body;

    return {
      ...body,
      messages: [
        { role: "system", content: prompt },
        {
          role: "system",
          content: `
This message contains information about the current state of the UI.
Date and time: ${context.currentTime}
The app configured to focus on the event with ID "${context.currentEvent}". 
Location: ${context.location}
Current route: ${context.route}
Current route arguments: ${JSON.stringify(context.routeParams || {})}
          `.trim(),
        },
        ...body.messages,
      ],
    };
  },
});

export { handler };
```

**Important**: Handle async initialization properly. Options:

1. Use top-level `await` (if supported in environment)
2. Lazy initialize on first request
3. Use initialization promise pattern

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
- `getNearbyPlaces.graphql`
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

- API calls to `/api/copilotkit` succeed
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

---

## ✅ Completion Checklist

- [ ] `mcp/supergraphMcp.ts` created with server connection
- [ ] `agent.ts` updated with MCP initialization
- [ ] `getCurrentEvent` custom action added
- [ ] All 5 MCP operations verified in `connector/operations/`
- [ ] Rover MCP server running on port 5000
- [ ] Manual testing completed (all 4 test queries work)
- [ ] MCP connection logs show success
- [ ] Agent successfully uses MCP tools to answer queries
- [ ] Graceful degradation tested (app works if MCP down)

---

## 🚀 Next Steps

Once Task 2 is complete, proceed to:

- **Task 3**: Fragment Component Embeds - Display rich UI from GraphQL data
- **Task 4**: Local Mutations (Bookmarks) - If not already done

---

**Last Updated**: 2025-10-21

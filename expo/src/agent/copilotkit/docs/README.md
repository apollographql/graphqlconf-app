# CopilotKit Implementation Guide

This directory contains detailed implementation guides for migrating the GraphQLConf app agent from Vercel SDK to CopilotKit.

---

## 📋 Implementation Tasks

### **Recommended Implementation Order**

1. **[Task 1: Basic Chat Integration](task-1-basic-chat.md)** ⭐ START HERE
   - Foundation for all other features
   - OpenAI + CopilotKit setup
   - Context injection
   - Basic UI component

2. **[Task 2: Supergraph MCP Integration](task-2-supergraph-mcp.md)** ⭐ CORE FUNCTIONALITY
   - Local MCP server connection
   - GraphQL query capabilities
   - Custom actions

3. **[Task 3: Fragment Component Embeds](task-3-fragment-embeds.md)** ⚠️ MOST COMPLEX
   - React components as AI tools
   - Apollo cache integration
   - Auto-fetch missing data
   - Rich UI rendering

4. **[Task 4: Local Mutations (Bookmarks)](task-4-bookmarks.md)** ⭐ SIMPLE VALIDATION
   - Client-side actions pattern
   - Validates CopilotKit action system
   - Low complexity

5. **[Task 5: Route Navigation & Chat Control](task-5-routes-chat-control.md)**
   - App navigation
   - Conversation management
   - Smart navigation flow

6. **[Task 6: Builders MCP (Remote Events)](task-6-builders-mcp.md)**
   - OAuth integration
   - Remote MCP server
   - Graceful degradation

7. **[Task 7: MCP Cache Integration](task-7-cache-integration.md)** ⚠️ OPTIONAL
   - Research required first
   - May not be feasible with CopilotKit
   - Performance optimization

---

## 🎯 Quick Start

### Prerequisites

```bash
cd expo
npm install @copilotkit/react-core @copilotkit/runtime openai zod
```

### Environment Variables

```bash
# .env
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
EXPO_PUBLIC_CURRENT_EVENT=graphqlconf-2025
EXPO_PUBLIC_GRAPHQL_SERVER=http://localhost:4000/
```

### Start Development

```bash
# Terminal 1: Start Expo
cd expo
npm start

# Terminal 2: Start Rover (MCP Server)
npm run start_rover
```

---

## 📂 File Structure

After all tasks are complete, the structure will be:

```
expo/src/agent/copilotkit/
├── docs/                           # This directory
│   ├── README.md                   # You are here
│   ├── task-1-basic-chat.md
│   ├── task-2-supergraph-mcp.md
│   ├── task-3-fragment-embeds.md
│   ├── task-4-bookmarks.md
│   ├── task-5-routes-chat-control.md
│   ├── task-6-builders-mcp.md
│   └── task-7-cache-integration.md
├── agent.ts                        # CopilotRuntime setup
├── Omnibar.tsx                     # Main chat UI (renamed from CopilotChat.tsx)
├── MessagePart.tsx                 # Message rendering
├── ShowEmbedAction.tsx             # Fragment component embeds
├── ShowEmbedPart.tsx               # Embed rendering
├── BookmarksActions.tsx            # Bookmark tools
├── RouteActions.tsx                # Navigation tools
├── ChatControlActions.tsx          # Chat management
├── CopilotKitCacheTransport.ts     # Optional cache integration
└── mcp/
    ├── supergraphMcp.ts            # Local MCP server
    └── buildersMcp.ts              # Remote OAuth MCP
```

---

## 🔑 Key Differences: Vercel SDK vs CopilotKit

### Tool System

| Feature         | Vercel SDK                     | CopilotKit                           |
| --------------- | ------------------------------ | ------------------------------------ |
| Server Tools    | `tool()` from `ai`             | `runtime.addAction()`                |
| Client Tools    | `useChat` onToolCall           | `useCopilotAction()`                 |
| Schema          | JSON Schema                    | Zod schema                           |
| MCP Integration | `experimental_createMCPClient` | `runtime.addMCPServer()` (native) ✅ |

### Chat Hook

| Feature   | Vercel SDK                    | CopilotKit                    |
| --------- | ----------------------------- | ----------------------------- |
| Hook      | `useChat()`                   | `useCopilotChat()`            |
| Messages  | `messages`, `sendMessage`     | `messages`, `sendMessage`     |
| Context   | `body` function               | `makeSystemMessage`           |
| Transport | Custom `DefaultChatTransport` | Default (research for custom) |

### Runtime

| Feature      | Vercel SDK                | CopilotKit         |
| ------------ | ------------------------- | ------------------ |
| Setup        | `streamText()`            | `CopilotRuntime()` |
| Model        | `createOpenAI()`          | `OpenAIAdapter()`  |
| Streaming    | `smoothStream()`          | Built-in           |
| Step Control | `stopWhen`, `stepCountIs` | Research needed    |
| Middleware   | `prepareStep`             | Research needed    |

---

## ✅ Progress Tracking

Use this checklist to track overall progress:

### Phase 1: Foundation

- [ ] Task 1: Basic Chat Integration
- [ ] Task 4: Bookmarks

### Phase 2: Core Features

- [ ] Task 2: Supergraph MCP
- [ ] Task 3: Fragment Embeds

### Phase 3: Advanced Features

- [ ] Task 5: Routes & Chat Control
- [ ] Task 6: Builders MCP

### Phase 4: Optimization

- [ ] Task 7: Cache Integration (if feasible)

---

## 🔍 Research Findings

### CopilotKit MCP Support ✅

- **Native support** via `runtime.addMCPServer()`
- Supports HTTP and SSE transports
- MCP tools automatically exposed to agent
- No custom adapter needed

### Open Questions

- [ ] Smart navigation flow (Vercel SDK's `prepareStep` equivalent?)
- [ ] Custom transport for cache integration?
- [ ] Step count limiting?
- [ ] Tool input repair?

---

## 📚 Resources

### CopilotKit Documentation

- [Quickstart](https://docs.copilotkit.ai/quickstart)
- [useCopilotChat](https://docs.copilotkit.ai/reference/hooks/useCopilotChat)
- [useCopilotAction](https://docs.copilotkit.ai/reference/hooks/useCopilotAction)
- [CopilotRuntime](https://docs.copilotkit.ai/reference/runtime/CopilotRuntime)
- [MCP Integration](https://docs.copilotkit.ai/guides/mcp)

### Vercel SDK Comparison

- [`expo/src/agent/vercelSdk/`](../../vercelSdk/) - Original implementation
- [`expo/src/agent/clientTools/`](../../clientTools/) - Shared tools/schemas
- [`expo/src/agent/mcp/`](../../mcp/) - MCP integrations

### Project Documentation

- [`CLAUDE.md`](../../../../CLAUDE.md) - Project overview
- [`PATTERNS.md`](../../../../PATTERNS.md) - GraphQL patterns

---

## 🐛 Common Issues

### Issue: Module not found errors

**Solution**: Ensure all dependencies installed:

```bash
npm install @copilotkit/react-core @copilotkit/runtime openai zod
```

### Issue: MCP server connection fails

**Solution**: Start Rover before Expo:

```bash
npm run start_rover
```

### Issue: Context not updating

**Solution**: Use `useEffect` to rebuild context on route/param changes

### Issue: Zod schema errors

**Solution**: Convert JSON Schema properly or use `json-schema-to-zod` package

---

## 💡 Tips

1. **Test incrementally**: Complete and test each task before moving to the next
2. **Use existing schemas**: Reuse JSON schemas from `clientTools/`
3. **Check Vercel SDK**: When stuck, reference the original implementation
4. **Console log everything**: Debug with extensive logging during development
5. **Apollo DevTools**: Use for cache debugging in Task 3
6. **Start simple**: Get basic chat working before adding tools

---

## 🚀 After Completion

Once all tasks are complete:

1. **Compare implementations**: Vercel SDK vs CopilotKit side-by-side
2. **Performance test**: Measure response times, cache hits
3. **User testing**: Get feedback on agent behavior
4. **Documentation**: Update main project docs
5. **Cleanup**: Remove debug logs, unused code
6. **Deploy**: Test in production environment

---

## 📞 Support

If you encounter issues:

1. Check the specific task guide
2. Review CopilotKit documentation
3. Compare with Vercel SDK implementation
4. Check project CLAUDE.md for context
5. Ask for help with specific error messages

---

**Last Updated**: 2025-10-21

**Status**: Ready for Task 1 implementation

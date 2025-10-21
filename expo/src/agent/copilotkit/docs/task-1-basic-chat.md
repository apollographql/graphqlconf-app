# Task 1: Basic Chat Integration

**Goal**: Establish foundational CopilotKit chat functionality with OpenAI integration and context injection.

**Status**: ✅ Complete

**Dependencies**: None

**Estimated Effort**: 2-3 hours

---

## 📋 Overview

This task creates the basic chat interface using CopilotKit, replacing the Vercel SDK's `useChat` with CopilotKit's `useCopilotChat`. This is the foundation for all subsequent features.

---

## 🎯 Success Criteria

- ✅ User can send messages and receive streaming responses from GPT-4o
- ✅ System prompt from [`prompt.ts`](../prompt.ts) is injected
- ✅ Dynamic context (time, event, location, route) is passed to agent
- ✅ Messages display correctly in UI using existing `OmnibarFrame`
- ✅ No tools exposed yet (pure conversational chat)

---

## 📁 Files Created/Modified

### New Files Created

- `expo/src/agent/copilotkit/Omnibar.tsx` - Main chat UI component
- `expo/src/app/api/copilotkit+api.ts` - API route handler

### Modified Files

- [`expo/src/agent/copilotkit/agent.ts`](../agent.ts) - CopilotRuntime configuration

---

## 🏗️ Implementation Steps

### Step 1: Configure Server-Side Agent

**File**: [`expo/src/agent/copilotkit/agent.ts`](../agent.ts)

**Actual Implementation**:

```typescript
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";

// Create OpenAI adapter with GPT-4o
const serviceAdapter = new OpenAIAdapter({
  model: "gpt-4o",
});

// Create runtime instance
const runtime = new CopilotRuntime();

// Create endpoint handler
const copilotKitHandler = copilotRuntimeNodeHttpEndpoint({
  endpoint: "/copilotkit",
  runtime,
  serviceAdapter,
});

// Wrap handler for compatibility
export async function handler(request: Request): Promise<Response> {
  const result = await copilotKitHandler(request);
  return new Response(result.body, {
    headers: result.headers,
    status: result.status,
  });
}
```

**Notes**:

- OpenAI credentials (`OPENAI_API_KEY`, `OPENAI_ORG_ID`) configured via environment variables automatically
- **No server-side context injection** - Context is injected client-side via `useCopilotReadable` hooks and `makeSystemMessage` callback
- Custom Response wrapper for API route compatibility

**Reference**: Compare with Vercel SDK's context injection:

- [`expo/src/agent/vercelSdk/agent.ts:84-102`](../../vercelSdk/agent.ts#L84-L102)

---

### Step 2: Implement Client-Side UI

**File**: `expo/src/agent/copilotkit/Omnibar.tsx` (new file)

**Actual Implementation**:

```typescript
import { generateAPIUrl } from "@/generateApiUrl";
import {
  CopilotKit,
  useCopilotChatHeadless_c,
  useCopilotReadable,
} from "@copilotkit/react-core";
import { useRef } from "react";
import { useLocalSearchParams, useSegments } from "expo-router/build/hooks";
import { OmnibarFrame } from "@/components/Omnibar/OmnibarFrame";
import { Message } from "@/components/Omnibar/Message";
import { prompt } from "@/agent/prompt";
import { ThemedText } from "@/components/themed-text";

export function Omnibar({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit
      publicLicenseKey="ck_pub_96eb1536bf95dcb94115418033f28590"
      runtimeUrl={generateAPIUrl("/api/copilotkit")}
    >
      <OmnibarContent>{children}</OmnibarContent>
    </CopilotKit>
  );
}

function OmnibarContent({ children }: { children: React.ReactNode }) {
  const route = useSegments().join("/");
  const routeParams = useLocalSearchParams();

  // Build context for agent using useCopilotReadable hooks
  useCopilotReadable({
    description: "The app configured to focus on the event with ID",
    value: process.env.EXPO_PUBLIC_CURRENT_EVENT!,
  });
  useCopilotReadable({
    description: "Location",
    value:
      "The user has not shared their location. Unless they specify, assume that they are at the conference venue.",
  });
  useCopilotReadable({
    description: "Current route",
    value: route,
  });
  useCopilotReadable({
    description: "Current route arguments",
    value: routeParams,
  });

  const omnibarFrame = useRef<OmnibarFrame.Handle>(null);

  // Use CopilotKit's chat hook with system message injection
  const { messages, sendMessage, isLoading, stopGeneration, reset } =
    useCopilotChatHeadless_c({
      // Inject system prompt and context via makeSystemMessage
      makeSystemMessage: (contextString, additionalInstructions) => {
        return (
          `${prompt}

The user has provided you with the following context:
\`\`\`
0.Date and time: ${new Date().toISOString()}${contextString}
\`\`\`
` + (additionalInstructions ? `\n\n${additionalInstructions}` : "")
        );
      },
    });

  return (
    <OmnibarFrame
      messages={messages.map((message) => {
        switch (message.role) {
          case "assistant":
            return (
              <Message role={message.role} key={message.id}>
                <ThemedText>
                  {message.generativeUI?.() || message.content}
                </ThemedText>
              </Message>
            );
          case "user":
            return (
              <Message role={message.role} key={message.id}>
                <ThemedText>{message.content}</ThemedText>
              </Message>
            );
          default:
            return null;
        }
      })}
      handle={omnibarFrame}
      onSendMessage={(content) => {
        sendMessage({
          id: `user-${crypto.randomUUID()}`,
          role: "user",
          content,
        });
      }}
      onReset={async () => {
        stopGeneration();
        reset();
      }}
      state={
        messages.length === 0 ? "pristine" : isLoading ? "incoming" : "ready"
      }
    >
      {children}
    </OmnibarFrame>
  );
}
```

**Key Differences from Planned Implementation**:

1. **Hook Used**: `useCopilotChatHeadless_c` instead of `useCopilotChat`
2. **Context Injection**: Uses `useCopilotReadable` hooks instead of `useEffect` + ref
3. **makeSystemMessage Signature**: Takes `(contextString, additionalInstructions)` parameters
4. **Context Format**: CopilotKit automatically formats context from `useCopilotReadable` hooks
5. **Dynamic Time**: Current time injected in `makeSystemMessage` (not via `useCopilotReadable`)
6. **Message Rendering**: Inline with switch statement (no separate MessagePart component)
7. **Message Structure**: Uses `message.generativeUI?.()` for rendering
8. **API Methods**: `stopGeneration`, `reset` (not `stop`, `reload`)
9. **License Key**: CopilotKit public license key configured

**Reference**: Compare with Vercel SDK's Omnibar:

- [`expo/src/agent/vercelSdk/Omnibar/Omnibar.tsx:22-137`](../../vercelSdk/Omnibar/Omnibar.tsx#L22-L137)

---

### Step 3: Create API Route

**File**: `expo/src/app/api/copilotkit+api.ts` (new file)

**Actual Implementation**:

```typescript
export {
  handler as POST,
  handler as GET,
  handler as OPTIONS,
} from "@/agent/copilotkit/agent";
```

**Notes**: Exports GET, POST, and OPTIONS methods for full API compatibility.

---

## 🧪 Testing Steps

1. **Start Dev Server**:

   ```bash
   cd expo
   npm start
   ```

2. **Open Omnibar**:
   - Click chat icon in app
   - Verify chat interface appears

3. **Send Test Message**:
   - Type "Hello"
   - Verify streaming response from GPT-4o
   - Check message displays correctly

4. **Verify Context Injection**:
   - Ask "What event am I attending?"
   - Agent should know it's GraphQLConf 2025
   - Ask "What time is it?"
   - Agent should use current time from context

5. **Check Console**:
   - No errors in terminal or browser console
   - API calls to `/api/copilotkit` succeed

---

## 🔍 Troubleshooting

### Issue: "Cannot find module '@copilotkit/react-core'"

**Solution**: Install dependencies:

```bash
cd expo
npm install @copilotkit/react-core @copilotkit/runtime openai
```

### Issue: "OpenAI API key not found"

**Solution**: Add to `.env`:

```
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
```

### Issue: Messages not streaming

**Solution**:

- Check network tab for `/api/copilotkit` requests
- Verify OpenAI credentials are valid
- Check terminal for error logs

### Issue: Context not injected

**Solution**:

- Verify `makeSystemMessage` callback receives `contextString` parameter
- Check that `useCopilotReadable` hooks are rendering
- Console.log the `contextString` parameter in `makeSystemMessage` to debug

---

## 📚 Reference Links

### CopilotKit Documentation

- [CopilotKit Quickstart](https://docs.copilotkit.ai/quickstart)
- [useCopilotChat API](https://docs.copilotkit.ai/reference/hooks/useCopilotChat)
- [CopilotRuntime API](https://docs.copilotkit.ai/reference/runtime/CopilotRuntime)

### Vercel SDK Comparison

- [`expo/src/agent/vercelSdk/agent.ts`](../../vercelSdk/agent.ts) - Original implementation
- [`expo/src/agent/vercelSdk/Omnibar/Omnibar.tsx`](../../vercelSdk/Omnibar/Omnibar.tsx) - Original UI

---

## ✅ Completion Checklist

- [x] `agent.ts` configured with OpenAI adapter
- [x] `Omnibar.tsx` created and implemented with `useCopilotChatHeadless_c`
- [x] Context injection via `useCopilotReadable` hooks
- [x] `makeSystemMessage` with `(contextString, additionalInstructions)` signature
- [x] Dynamic time injection in `makeSystemMessage`
- [x] Inline message rendering (no separate MessagePart component)
- [x] API route `/api/copilotkit+api.ts` created (GET/POST/OPTIONS)
- [x] CopilotKit license key configured
- [x] Manual testing completed successfully
- [x] No console errors
- [x] Agent responds with correct context awareness

## 📝 Implementation Notes

**What Was Actually Built**:

- Simple server-side agent without transformRequest
- Context injection via `useCopilotReadable` hooks (not `useEffect` + ref)
- `makeSystemMessage` receives formatted `contextString` from CopilotKit
- Dynamic time injected inline in `makeSystemMessage` callback
- Inline message rendering with switch statement
- Uses `useCopilotChatHeadless_c` hook (not `useCopilotChat`)
- Message structure: `{ id, role, content, generativeUI }`
- API: `sendMessage`, `isLoading`, `stopGeneration`, `reset`

---

## 🚀 Next Steps

Once Task 1 is complete, proceed to:

- **Task 4**: Local Mutations (Bookmarks) - Validates client-side action pattern
- **Task 2**: Supergraph MCP Integration - Adds GraphQL query capabilities

---

**Last Updated**: 2025-10-21

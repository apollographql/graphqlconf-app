# Task 5: Route Navigation & Chat Control

**Goal**: Enable agent to navigate app routes and manage conversation flow (ending chat, resetting history).

**Status**: 🔴 Not Started

**Dependencies**: Task 1 (Basic Chat Integration)

**Estimated Effort**: 4-5 hours

---

## 📋 Overview

This task implements navigation tools for the agent to move users between app screens, plus conversation control features like gracefully ending chats and resetting history. It also includes smart navigation flow that detects when a task is complete.

---

## 🎯 Success Criteria

- ✅ Agent can navigate to any app route with parameters
- ✅ Agent can get information about available routes
- ✅ Agent can fetch data for specific routes
- ✅ Agent can detect task completion after navigation
- ✅ Agent can end conversation with goodbye message
- ✅ Chat auto-closes after successful navigation (configurable)
- ✅ Chat history can be reset
- ✅ Navigation context updates correctly

---

## 📁 Files to Create/Modify

### New Files

- `expo/src/agent/copilotkit/RouteActions.tsx` - Navigation and route tools
- `expo/src/agent/copilotkit/ChatControlActions.tsx` - Chat management tools

### Modified Files

- [`expo/src/agent/copilotkit/Omnibar.tsx`](../Omnibar.tsx) - Register actions and handle chat control
- [`expo/src/agent/copilotkit/agent.ts`](../agent.ts) - Add server-side route actions (if needed)

---

## 🏗️ Implementation Steps

### Step 1: Understand Route System

**Available Routes** (from [`routes.ts`](../../clientTools/routes.ts:29-134)):

```typescript
const availableRoutes = {
  "/(tabs)": "Home",
  "/(tabs)/schedule": "Schedule",
  "/(tabs)/bookmarks": "Bookmarks",
  "/(tabs)/settings": "Settings",
  "/session/[id]": "Session Details",
  "/place/[id]": "Place Details",
};
```

**Route Metadata**:

- `name`: Human-readable name
- `description`: What the route shows
- `inputSchema`: Required parameters (e.g., `{ id: string }`)
- `query`: GraphQL query for route data
- `variables`: Schema for query variables

**Reference**: See full route definitions:

- [`expo/src/agent/clientTools/routes.ts:29-134`](../../clientTools/routes.ts#L29-L134)

---

### Step 2: Create Route Actions

**File**: `expo/src/agent/copilotkit/RouteActions.tsx` (new file)

```typescript
import { useCopilotAction } from "@copilotkit/react-core";
import { useApolloClient } from "@apollo/client";
import { useRouter } from "expo-router";
import { z } from "zod";
import { AgentContext } from "@/agent/AgentContext";
import {
  BookmarksScreen,
  HomeScreen,
  PlaceDetailScreen,
  ScheduleScreen,
  SessionDetailScreen,
} from "@/screens";
import { removeDirectivesFromDocument } from "@apollo/client/utilities";
import { print } from "graphql";

export function useRouteActions(context: AgentContext) {
  const router = useRouter();
  const client = useApolloClient();

  // Action: Get Route Information
  useCopilotAction({
    name: "getRouteInformation",
    description: "Get information about a specific route in the app.",
    parameters: z.object({
      route: z
        .enum([
          "/(tabs)",
          "/(tabs)/schedule",
          "/(tabs)/bookmarks",
          "/(tabs)/settings",
          "/session/[id]",
          "/place/[id]",
        ])
        .describe(
          "The route to get information about. Keep placeholders like '[id]' literal."
        ),
    }),
    handler: async ({ route }) => {
      const routeInfo = getRouteMetadata(route);
      if (!routeInfo) {
        throw new Error(`Route "${route}" not found`);
      }

      return {
        pathname: route,
        name: routeInfo.name,
        description: routeInfo.description,
        params: routeInfo.inputSchema || null,
        // Optionally include data shape
      };
    },
  });

  // Action: Get Current Route Information
  useCopilotAction({
    name: "getCurrentRouteInformation",
    description: "Get information about the current route the user is on.",
    parameters: z.object({}),
    handler: async () => {
      return {
        route: context.route,
        params: context.routeParams,
        // Return same structure as getRouteInformation
      };
    },
  });

  // Action: Get Route Data
  useCopilotAction({
    name: "getRouteData",
    description:
      "Get the data for a specific route by executing its GraphQL query. Use this to preview what data would be shown on a route.",
    parameters: z.object({
      routeDescription: z.union([
        z.object({
          pathname: z.literal("/(tabs)"),
          queryVariables: z.object({
            eventId: z.string(),
          }),
        }),
        z.object({
          pathname: z.literal("/(tabs)/schedule"),
          queryVariables: z.object({
            eventId: z.string(),
          }),
        }),
        z.object({
          pathname: z.literal("/(tabs)/bookmarks"),
          queryVariables: z
            .object({
              identifiers: z.array(
                z.object({
                  id: z.string(),
                  typename: z.string(),
                })
              ),
            })
            .optional(),
        }),
        z.object({
          pathname: z.literal("/(tabs)/settings"),
        }),
        z.object({
          pathname: z.literal("/session/[id]"),
          queryVariables: z.object({
            sessionId: z.string(),
          }),
        }),
        z.object({
          pathname: z.literal("/place/[id]"),
          queryVariables: z.object({
            placeId: z.string(),
          }),
        }),
      ]),
    }),
    handler: async ({ routeDescription }) => {
      const { pathname } = routeDescription;
      const routeInfo = getRouteMetadata(pathname);

      if (!routeInfo?.query) {
        return { message: "This route has no data query" };
      }

      // Execute GraphQL query
      const query = removeDirectivesFromDocument(
        [{ name: "client", remove: true }],
        routeInfo.query
      )!;

      const result = await client.query({
        query,
        variables: (routeDescription as any).queryVariables || {},
      });

      return result.data;
    },
  });

  // Action: Navigate to Route
  useCopilotAction({
    name: "navigateToRoute",
    description: `
Navigate to a specific route in the app, changing the current screen.
Use this sparingly, and only when you are certain the user wants to navigate.
If you're not sure, ask them for permission first.
After navigation succeeds, assume the user is now on that route.
    `.trim(),
    parameters: z.object({
      routeDescription: z.union([
        // Same union as getRouteData
        z.object({
          pathname: z.literal("/(tabs)"),
        }),
        z.object({
          pathname: z.literal("/(tabs)/schedule"),
        }),
        z.object({
          pathname: z.literal("/(tabs)/bookmarks"),
        }),
        z.object({
          pathname: z.literal("/(tabs)/settings"),
        }),
        z.object({
          pathname: z.literal("/session/[id]"),
          params: z.object({ id: z.string() }),
        }),
        z.object({
          pathname: z.literal("/place/[id]"),
          params: z.object({ id: z.string() }),
        }),
      ]),
    }),
    handler: async ({ routeDescription }) => {
      console.log("Navigating to route:", routeDescription);

      // Build route with params
      const { pathname } = routeDescription;
      const params = (routeDescription as any).params;

      if (params) {
        // Replace [id] with actual id
        const route = pathname.replace(/\[(\w+)\]/g, (_, key) => params[key]);
        router.push(route as any);
      } else {
        router.push(pathname as any);
      }

      return {
        success: true,
        route: pathname,
      };
    },
  });
}

// Helper to get route metadata
function getRouteMetadata(pathname: string) {
  const routes = {
    "/(tabs)": {
      name: "Home",
      description: "The home page of the app",
      inputSchema: null,
      query: HomeScreen.Query,
    },
    "/(tabs)/schedule": {
      name: "Schedule",
      description: "The schedule page showing the list of sessions",
      inputSchema: null,
      query: ScheduleScreen.Query,
    },
    "/(tabs)/bookmarks": {
      name: "Bookmarks",
      description: "The bookmarks page showing bookmarked sessions",
      inputSchema: null,
      query: BookmarksScreen.Query,
    },
    "/(tabs)/settings": {
      name: "Settings",
      description: "The settings page of the app",
      inputSchema: null,
      query: null,
    },
    "/session/[id]": {
      name: "Session Details",
      description: "The details page for a specific session",
      inputSchema: { id: "string" },
      query: SessionDetailScreen.Query,
    },
    "/place/[id]": {
      name: "Place Details",
      description: "The details page for a specific place",
      inputSchema: { id: "string" },
      query: PlaceDetailScreen.Query,
    },
  };

  return routes[pathname as keyof typeof routes];
}
```

**Reference**: Compare with Vercel SDK's routes:

- [`expo/src/agent/clientTools/routes.ts:163-299`](../../clientTools/routes.ts#L163-L299)

---

### Step 3: Create Chat Control Actions

**File**: `expo/src/agent/copilotkit/ChatControlActions.tsx` (new file)

```typescript
import { useState } from "react";

export interface ChatControl {
  shouldClose: boolean;
  goodbyeMessage: string | null;
}

export function useChatControl() {
  const [chatControl, setChatControl] = useState<ChatControl>({
    shouldClose: false,
    goodbyeMessage: null,
  });

  return { chatControl, setChatControl };
}

// This will be called from Omnibar to handle chat control
export function handleChatControl(
  setChatControl: (control: ChatControl) => void
) {
  // CopilotKit doesn't have a direct equivalent to Vercel SDK's tool-based
  // chat control, so we'll need to implement this differently.

  // Option 1: Use a custom action
  // Option 2: Detect specific message patterns
  // Option 3: Use CopilotKit's message state management

  // For now, we'll return a handler that can be called manually
  return {
    replaceChatHistory: (goodbyeMessage: string, closeChat: boolean) => {
      setChatControl({
        shouldClose: closeChat,
        goodbyeMessage,
      });
    },
  };
}
```

**Note**: CopilotKit doesn't have direct equivalent of Vercel SDK's `replaceChatHistory` tool. We need to explore:

1. Custom action that signals UI to replace messages
2. Message filtering on client side
3. CopilotKit's built-in conversation management

---

### Step 4: Update Omnibar with Route and Chat Control

**File**: [`expo/src/agent/copilotkit/Omnibar.tsx`](../Omnibar.tsx)

```typescript
import { useRouteActions } from "./RouteActions";
import { useChatControl } from "./ChatControlActions";

function OmnibarContent({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const route = useSegments().join("/");
  const routeParams = useLocalSearchParams();
  const router = useRouter();

  // Build context
  const routeContext = useRef<AgentContext>(null);
  useEffect(() => {
    const now = new Date();
    routeContext.current = {
      currentTime: now.toISOString(),
      currentEvent: process.env.EXPO_PUBLIC_CURRENT_EVENT!,
      location: "...",
      route,
      routeParams,
    };
  });

  // Chat control state
  const { chatControl, setChatControl } = useChatControl();

  // Register route actions
  useRouteActions(routeContext.current!);

  const omnibarFrame = useRef<OmnibarFrame.Handle>(null);

  const {
    messages,
    sendMessage,
    isLoading,
    stop,
    reload,
    setMessages,
  } = useCopilotChat({
    makeSystemMessage: () => JSON.stringify({
      context: routeContext.current,
    }),
  });

  // Handle chat control
  useEffect(() => {
    if (chatControl.goodbyeMessage) {
      // Replace messages with goodbye
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: chatControl.goodbyeMessage,
        },
      ]);

      if (chatControl.shouldClose) {
        setTimeout(() => {
          omnibarFrame.current?.setShowChat(false);
        }, 1000);
      }

      // Reset control
      setChatControl({ shouldClose: false, goodbyeMessage: null });
    }
  }, [chatControl]);

  return (
    <OmnibarFrame
      messages={messages.map((message) => (
        <Message role={message.role} key={message.id}>
          <MessagePart message={message} />
        </Message>
      ))}
      handle={omnibarFrame}
      onSendMessage={(message) => sendMessage({ content: message })}
      onReset={() => {
        stop();
        setMessages([]);
      }}
      state={
        messages.length === 0
          ? "pristine"
          : isLoading
            ? "incoming"
            : "ready"
      }
    >
      {children}
    </OmnibarFrame>
  );
}
```

---

### Step 5: Implement Smart Navigation Flow (Advanced)

**Challenge**: Vercel SDK uses `prepareStep` hook to detect task completion after navigation. CopilotKit doesn't have this exact feature.

**Potential Solutions**:

**Option 1: Server-Side Action** (agent decides to end chat)

Add action for agent to end conversation:

```typescript
// In agent.ts
runtime.addAction({
  name: "endConversation",
  description: "End the conversation politely when the user's task is complete",
  parameters: z.object({
    goodbyeMessage: z.string(),
    closeChat: z.boolean().optional(),
  }),
  handler: async ({ goodbyeMessage, closeChat }) => {
    // Return signal to client
    return {
      type: "end_conversation",
      message: goodbyeMessage,
      close: closeChat ?? true,
    };
  },
});
```

Then handle in client:

```typescript
// In Omnibar.tsx
useCopilotAction({
  name: "endConversation",
  handler: async ({ goodbyeMessage, closeChat }) => {
    setChatControl({
      goodbyeMessage,
      shouldClose: closeChat ?? true,
    });
  },
});
```

**Option 2: Auto-Detection After Navigation**

Monitor navigation events and ask agent if task is complete:

```typescript
// In Omnibar.tsx
const lastNavigationRef = useRef<string | null>(null);

useEffect(() => {
  if (route !== lastNavigationRef.current && lastNavigationRef.current) {
    // Navigation occurred
    lastNavigationRef.current = route;

    // Trigger agent check (pseudo-code)
    // This would require custom integration with CopilotKit
    checkTaskCompletion();
  }
}, [route]);
```

**Recommendation**: Start with Option 1 (manual end conversation action) as it's simpler and doesn't require custom CopilotKit integration.

**Reference**: Compare with Vercel SDK's smart navigation:

- [`expo/src/agent/vercelSdk/agent.ts:133-201`](../../vercelSdk/agent.ts#L133-L201)

---

## 🧪 Testing Steps

### 1. Start Dev Server

```bash
cd expo
npm start
```

### 2. Test Route Information

**Test 1: Get Route Info**

```
User: "What routes are available?"
Expected:
- Agent calls getRouteInformation for multiple routes
- Returns list of available screens
```

**Test 2: Current Route**

```
User: "Where am I now?"
Expected:
- Agent calls getCurrentRouteInformation
- Returns current route and params
```

### 3. Test Route Data

**Test 1: Preview Route Data**

```
User: "What's on the schedule page?"
Expected:
- Agent calls getRouteData for /(tabs)/schedule
- Returns session data without navigating
```

### 4. Test Navigation

**Test 1: Simple Navigation**

```
User: "Take me to the schedule"
Expected:
- Agent calls navigateToRoute
- App navigates to schedule screen
- Context updates to new route
```

**Test 2: Navigation with Parameters**

```
User: "Show me session details for ID 123"
Expected:
- Agent calls navigateToRoute with params: { id: "123" }
- App navigates to /session/123
```

**Test 3: Confirm Before Navigate**

```
User: "Find the GraphQL Federation talk"
Agent: "I found it. Would you like me to open it?"
User: "Yes"
Expected:
- Agent asks permission first
- Navigates only after confirmation
```

### 5. Test Chat Control

**Test 1: End Conversation**

```
User: "Take me to bookmarks"
(Navigation succeeds)
Expected:
- Agent calls endConversation (if auto-detection works)
- Goodbye message appears
- Chat closes after 1 second
```

**Test 2: Manual End**

```
User: "Thanks, that's all I need"
Expected:
- Agent recognizes completion
- Calls endConversation
- Chat ends gracefully
```

**Test 3: Reset Chat**

```
User: (clicks reset button)
Expected:
- Messages cleared
- Chat returns to pristine state
- Can start new conversation
```

### 6. Verify Context Updates

**Check context after navigation**:

1. Navigate to session detail
2. Ask: "Where am I?"
3. Verify agent knows current route and params

---

## 🔍 Troubleshooting

### Issue: "Navigation doesn't work"

**Causes**:

1. Invalid route format
2. Expo Router not configured
3. Missing route params

**Solutions**:

```typescript
// Debug navigation
console.log("Navigating to:", routeDescription);
console.log("Router:", router);

// Test navigation directly
router.push("/session/123");

// Verify route exists
import { useSegments } from "expo-router";
console.log("Current segments:", useSegments());
```

### Issue: "Context not updating after navigation"

**Cause**: `routeContext` ref not updating

**Solution**:

```typescript
// Re-create context on route change
useEffect(() => {
  routeContext.current = {
    currentTime: new Date().toISOString(),
    currentEvent: process.env.EXPO_PUBLIC_CURRENT_EVENT!,
    location: "...",
    route, // This updates
    routeParams, // This updates
  };
}, [route, routeParams]);
```

### Issue: "getRouteData fails"

**Causes**:

1. Query missing client directive removal
2. Variables mismatch
3. Apollo client not configured

**Solutions**:

```typescript
// Check query before execution
const query = removeDirectivesFromDocument(
  [{ name: "client", remove: true }],
  routeInfo.query
)!;
console.log("Query:", print(query));
console.log("Variables:", routeDescription.queryVariables);

// Test query directly
await client.query({
  query: HomeScreen.Query,
  variables: { eventId: process.env.EXPO_PUBLIC_CURRENT_EVENT },
});
```

### Issue: "Chat doesn't close after navigation"

**Cause**: `endConversation` action not triggering or chatControl not working

**Solutions**:

```typescript
// Debug chat control
useEffect(() => {
  console.log("Chat control state:", chatControl);
}, [chatControl]);

// Test closing manually
setChatControl({
  goodbyeMessage: "Test goodbye",
  shouldClose: true,
});

// Verify OmnibarFrame has setShowChat method
console.log("OmnibarFrame handle:", omnibarFrame.current);
```

---

## 📚 Reference Links

### CopilotKit Documentation

- [useCopilotAction Hook](https://docs.copilotkit.ai/reference/hooks/useCopilotAction)
- [Message State Management](https://docs.copilotkit.ai/guides/message-state)

### Expo Router

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [useRouter Hook](https://docs.expo.dev/router/reference/hooks/#userouter)
- [Navigation](https://docs.expo.dev/router/navigating-pages/)

### Vercel SDK Comparison

- [`expo/src/agent/clientTools/routes.ts`](../../clientTools/routes.ts) - Route definitions and tools
- [`expo/src/agent/vercelSdk/agent.ts:133-201`](../../vercelSdk/agent.ts#L133-L201) - Smart navigation flow
- [`expo/src/agent/vercelSdk/Omnibar/NavigateToRouteTool.tsx`](../../vercelSdk/Omnibar/NavigateToRouteTool.tsx) - Navigation handler

---

## ✅ Completion Checklist

- [ ] `RouteActions.tsx` created with 4 route actions
- [ ] `ChatControlActions.tsx` created
- [ ] `useRouteActions()` called in `Omnibar.tsx`
- [ ] Chat control implemented (message replacement + auto-close)
- [ ] Context updates on navigation
- [ ] Manual testing completed:
  - [ ] Get route information
  - [ ] Get current route
  - [ ] Get route data
  - [ ] Navigate to simple route
  - [ ] Navigate with parameters
  - [ ] End conversation manually
  - [ ] Reset chat
- [ ] Smart navigation explored (auto-detect completion)
- [ ] Agent asks permission before navigating
- [ ] No console errors
- [ ] Context always reflects current route

---

## 🚀 Next Steps

Once Task 5 is complete, proceed to:

- **Task 6**: Builders MCP (Remote Events with OAuth)
- **Task 7**: MCP Cache Integration (Optional)

---

**Last Updated**: 2025-10-21

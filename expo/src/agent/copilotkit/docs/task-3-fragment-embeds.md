# Task 3: Fragment Component Embeds

**Goal**: Expose React components as AI tools to display rich content (sessions, speakers, places, maps) with Apollo cache integration.

**Status**: 🔴 Not Started

**Dependencies**: Task 2 (Supergraph MCP Integration)

**Estimated Effort**: 6-8 hours

---

## 📋 Overview

This task converts fragment-based React components into AI-callable tools, allowing the agent to display rich UI instead of plain text. Components read/write to Apollo cache and auto-fetch missing data. This is the most complex task due to Apollo cache integration and error handling.

---

## 🎯 Success Criteria

- ✅ Agent can display sessions using `ShowEmbed-ScheduleListItem`
- ✅ Agent can display speakers using `ShowEmbed-SpeakerListItem`
- ✅ Agent can display places using `ShowEmbed-PlaceListItem`
- ✅ Agent can display maps using `ShowEmbed-PlacesMap`
- ✅ Apollo cache checked before rendering (avoid redundant fetches)
- ✅ Missing fragment data fetched automatically via `entities` query
- ✅ Error states handled gracefully (fallback to text)
- ✅ Components render with Suspense boundaries
- ✅ Agent prefers rich embeds over text lists

---

## 📁 Files to Create/Modify

### New Files

- `expo/src/agent/copilotkit/ShowEmbedAction.tsx` - Client-side embed handlers
- `expo/src/agent/copilotkit/ShowEmbedPart.tsx` - Embed rendering component

### Modified Files

- [`expo/src/agent/copilotkit/agent.ts`](../agent.ts) - Register server-side embed actions
- [`expo/src/agent/copilotkit/Omnibar.tsx`](../Omnibar.tsx) - Add embed rendering
- [`expo/src/agent/copilotkit/MessagePart.tsx`](../MessagePart.tsx) - Detect and render embeds

---

## 🏗️ Implementation Steps

### Step 1: Understand Fragment Component Architecture

**Existing Components** (from [`fragmentComponentEmbeds.ts`](../../clientTools/fragmentComponentEmbeds.ts)):

1. **ScheduleListItem**
   - Fragment: `SchedSession`
   - Displays: Event name, venue, time, speakers
   - Location: [`expo/src/components/ListItems/ScheduleListItem.tsx`](../../../../components/ListItems/ScheduleListItem.tsx)

2. **SpeakerListItem**
   - Fragment: `SchedSpeaker`
   - Displays: Name, position, company
   - Location: [`expo/src/components/ListItems/SpeakerListItem.tsx`](../../../../components/ListItems/SpeakerListItem.tsx)

3. **PlaceListItem**
   - Fragment: `Place`
   - Displays: Name, address
   - Location: [`expo/src/components/ListItems/PlaceListItem.tsx`](../../../../components/ListItems/PlaceListItem.tsx)

4. **PlacesMap**
   - Fragment: `Places` (array)
   - Displays: Interactive map with markers
   - Location: [`expo/src/components/PlacesMap/PlacesMap.tsx`](../../../../components/PlacesMap/PlacesMap.tsx)

**Key Pattern**: Each component has a static `fragments` property:

```typescript
ScheduleListItem.fragments = {
  SchedSession: gql`
    fragment ScheduleListItem_session on SchedSession {
      id
      name
      startTime
      # ... other fields
    }
  `,
};
```

---

### Step 2: Create Server-Side Embed Actions

**File**: [`expo/src/agent/copilotkit/agent.ts`](../agent.ts)

**Add after MCP initialization**:

```typescript
import { availableFragmentComponents } from "@/agent/clientTools/fragmentComponentEmbeds";
import { generateFragmentJsonSchema } from "@/utils/generateJsonSchema";
import { client } from "@/apollo/client";
import { z } from "zod";

// Register each fragment component as an action
Object.entries(availableFragmentComponents).forEach(
  ([componentName, details]) => {
    runtime.addAction({
      name: `ShowEmbed-${componentName}`,
      description: details.description,
      // Convert JSON Schema to Zod schema
      parameters: jsonSchemaToZod(details.schema),
      // Handler runs server-side but signals client to render
      handler: async (args) => {
        // Return structured data that client will intercept
        return {
          type: "embed",
          component: componentName,
          props: args,
        };
      },
    });
  }
);

// Helper to convert JSON Schema to Zod (simplified)
function jsonSchemaToZod(schema: any): z.ZodType {
  // This is a simplified conversion
  // For production, use a library like json-schema-to-zod
  const props = schema.properties;
  const shape: Record<string, z.ZodType> = {};

  for (const [key, value] of Object.entries(props)) {
    const prop = value as any;
    if (prop.type === "object") {
      shape[key] = z.object({
        __typename: z.string(),
        id: z.string(),
      });
    } else if (prop.type === "array") {
      // Handle array of Places for PlacesMap
      shape[key] = z.array(z.any());
    } else if (prop.type === "number") {
      shape[key] = z.number().optional();
    }
  }

  return z.object(shape);
}
```

**Alternative**: If Zod conversion is complex, consider using a library:

```bash
npm install json-schema-to-zod
```

**Reference**: Compare with Vercel SDK's tool registration:

- [`expo/src/agent/clientTools/fragmentComponentEmbeds.ts:99-107`](../../clientTools/fragmentComponentEmbeds.ts#L99-L107)

---

### Step 3: Create Client-Side Embed Handler

**File**: `expo/src/agent/copilotkit/ShowEmbedAction.tsx` (new file)

```typescript
import { useCopilotAction } from "@copilotkit/react-core";
import { useApolloClient } from "@apollo/client";
import { availableFragmentComponents } from "@/agent/clientTools/fragmentComponentEmbeds";
import { firstFragment } from "@/utils/firstFragment";
import { gql, DocumentNode } from "@apollo/client";
import { generateFragmentJsonSchema } from "@/utils/generateJsonSchema";

export function useShowEmbedActions() {
  const client = useApolloClient();

  // Register client-side handler for each embed action
  Object.entries(availableFragmentComponents).forEach(
    ([componentName, details]) => {
      useCopilotAction({
        name: `ShowEmbed-${componentName}`,
        description: details.description,
        // Handler runs client-side to check cache and fetch data
        handler: async (args) => {
          const { Component } = details;

          if (!("fragments" in Component)) {
            throw new Error(`Component ${componentName} has no fragments`);
          }

          const fragments = Component.fragments as Record<string, DocumentNode>;
          const output: Record<string, unknown> = {};
          const missing: Record<string, { __typename: string; id: string }[]> =
            {};

          // Check Apollo cache for each fragment
          return client.cache.batch({
            update(cache) {
              for (const [key, fragment] of Object.entries(fragments)) {
                const firstDef = firstFragment(fragment);
                const targetTypeName = firstDef.typeCondition.name.value;
                const fragmentName = firstDef.name.value;
                const propValue = args[key];
                const propResult = [];

                for (const item of Array.isArray(propValue)
                  ? propValue
                  : [propValue]) {
                  const identifierOnly =
                    item.__typename && Object.keys(item).length === 2;

                  if (identifierOnly) {
                    // Try to read from cache
                    const fragmentData = cache.readFragment({
                      id: cache.identify(item),
                      fragment,
                      fragmentName,
                    });

                    if (!fragmentData) {
                      if (details.fetchIfMissing) {
                        // Mark as missing for fetch
                        (missing[key] ??= []).push(item);
                        continue;
                      }
                      throw new Error(
                        "Could not render component due to missing data. Fall back to text."
                      );
                    }
                    propResult.push(fragmentData);
                  } else {
                    // Write full data to cache
                    try {
                      cache.writeFragment({
                        id: cache.identify(item),
                        fragment,
                        fragmentName,
                        data: item,
                      });
                      propResult.push(item);
                    } catch (e: any) {
                      throw new Error(`Data validation failed: ${e.message}`);
                    }
                  }
                }

                output[targetTypeName] = Array.isArray(propValue)
                  ? propResult
                  : propResult[0];
              }

              // If data is missing, fetch via entities query
              if (Object.keys(missing).length > 0) {
                const shapes = Object.fromEntries(
                  Object.entries(missing).map(([key]) => [
                    key,
                    generateFragmentJsonSchema(fragments[key], client),
                  ])
                );

                // Build query with fragment spreads
                const query = buildEntitiesQuery(missing, fragments);

                // Fetch missing data
                void client
                  .query({
                    query,
                    variables: {
                      identifiers: Object.values(missing)
                        .flat()
                        .map(({ __typename, ...rest }) => ({
                          typename: __typename,
                          ...rest,
                        })),
                    },
                  })
                  .catch(console.error);

                return {
                  state: "recoverable",
                  missing,
                  shapes,
                  message:
                    Object.keys(output).length === 0
                      ? "Fetching missing data..."
                      : "Displaying partial data, fetching rest...",
                  data: output,
                };
              }

              return {
                state: "success",
                message: "Data displayed to user",
                data: output,
              };
            },
          });
        },
      });
    }
  );
}

// Helper to build entities query with fragment spreads
function buildEntitiesQuery(
  missing: Record<string, any[]>,
  fragments: Record<string, DocumentNode>
): DocumentNode {
  const fragmentDefs = Object.values(fragments)
    .map((doc) => firstFragment(doc))
    .map((def) => def.name.value);

  return gql`
    query FetchMissing($identifiers: [EntityIdentifier!]!) {
      entities(identifiers: $identifiers) {
        __typename
        ${fragmentDefs.map((name) => `...${name}`).join("\n        ")}
      }
    }
    ${Object.values(fragments)
      .map((doc) => doc.loc?.source.body)
      .join("\n")}
  `;
}
```

**Reference**: Compare with Vercel SDK's ShowEmbedTool:

- [`expo/src/agent/vercelSdk/Omnibar/ShowEmbedTool.tsx:53-221`](../../vercelSdk/Omnibar/ShowEmbedTool.tsx#L53-L221)

---

### Step 4: Create Embed Rendering Component

**File**: `expo/src/agent/copilotkit/ShowEmbedPart.tsx` (new file)

```typescript
import { Suspense } from "react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { availableFragmentComponents } from "@/agent/clientTools/fragmentComponentEmbeds";

interface ShowEmbedPartProps {
  componentName: string;
  props: Record<string, any>;
}

export function ShowEmbedPart({ componentName, props }: ShowEmbedPartProps) {
  const embed = availableFragmentComponents[
    componentName as keyof typeof availableFragmentComponents
  ];

  if (!embed) {
    return (
      <ThemedView>
        <ThemedText>Unknown component: {componentName}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <Suspense
      fallback={
        <ThemedView
          style={{
            margin: 10,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
          }}
        >
          <ThemedText>Loading {componentName}...</ThemedText>
        </ThemedView>
      }
    >
      <embed.Component {...props} />
    </Suspense>
  );
}
```

**Reference**: Compare with Vercel SDK's ShowEmbedPart:

- [`expo/src/agent/vercelSdk/Omnibar/ShowEmbedTool.tsx:223-256`](../../vercelSdk/Omnibar/ShowEmbedTool.tsx#L223-L256)

---

### Step 5: Update Omnibar to Use Embed Actions

**File**: [`expo/src/agent/copilotkit/Omnibar.tsx`](../Omnibar.tsx)

**Add in `OmnibarContent` component**:

```typescript
import { useShowEmbedActions } from "./ShowEmbedAction";

function OmnibarContent({ children }: { children: React.ReactNode }) {
  // ... existing code ...

  // Register embed actions
  useShowEmbedActions();

  const { messages, sendMessage, isLoading, stop, reload } = useCopilotChat({
    makeSystemMessage: () =>
      JSON.stringify({
        context: routeContext.current,
      }),
  });

  // ... rest of component ...
}
```

---

### Step 6: Update MessagePart to Render Embeds

**File**: [`expo/src/agent/copilotkit/MessagePart.tsx`](../MessagePart.tsx)

```typescript
import { ThemedText } from "@/components/themed-text";
import { ShowEmbedPart } from "./ShowEmbedPart";

interface MessagePartProps {
  message: {
    role: string;
    content: string;
    data?: {
      type?: string;
      component?: string;
      props?: Record<string, any>;
    };
  };
}

export function MessagePart({ message }: MessagePartProps) {
  // Check if message contains embed data
  if (message.data?.type === "embed" && message.data.component) {
    return (
      <ShowEmbedPart
        componentName={message.data.component}
        props={message.data.props || {}}
      />
    );
  }

  // Fallback to text rendering
  return <ThemedText>{message.content}</ThemedText>;
}
```

---

### Step 7: Update System Prompt for Embeds

**File**: [`expo/src/agent/prompt.ts`](../../prompt.ts)

**Ensure prompt mentions embed tools**:

```typescript
export const prompt = `
You are an agent for a conference schedule app.
A user might ask you questions about the schedule, speakers, venues, or other related information.
Use the tools you have available to find the most accurate and up-to-date information.
By default, all user questions should be interpreted as being about the 2025 GraphQLConf conference, unless explicitly stated otherwise.

When you receive tool results, analyze them and provide a helpful response to the user.
You may need to call multiple tools or call the same tool multiple times to get complete information.

**IMPORTANT**: If possible, use the "ShowEmbed-*" tools to show rich information instead of text.
Available embed tools:
- ShowEmbed-ScheduleListItem: Display conference sessions
- ShowEmbed-SpeakerListItem: Display speakers
- ShowEmbed-PlaceListItem: Display places/venues
- ShowEmbed-PlacesMap: Display places on a map (preferred for location queries)

After calling a "ShowEmbed-*" tool, it will return information about what was displayed to the user in the app.
Always wait for the tool result before responding to the user.
Don't repeat the information displayed by that tool in text form, but do provide any additional context that might be helpful.
If the tool returns an error that it could not display the information, fall back to giving the user a fully textual response.

If additional textual output is necessary, use a friendly conversational tone.

Even if the user asks for a "list" or uses other language that implicitly hints at textual content, try to use the "ShowEmbed-*" tools to show the information in a rich format, rather than listing it out yourself.
Only give a textual list if explicitly prompted for text, or if no other option is available.
`.trim();
```

---

## 🧪 Testing Steps

### 1. Start Services

```bash
# Terminal 1: Expo
cd expo
npm start

# Terminal 2: Rover MCP
npm run start_rover
```

### 2. Test Each Embed Type

**Test 1: Display Sessions**

```
User: "Show me today's sessions"
Expected:
- Agent calls GetSessions MCP tool
- Agent calls ShowEmbed-ScheduleListItem with session data
- Schedule cards render in chat
- No plain text list
```

**Test 2: Display Speakers**

```
User: "Who are the speakers?"
Expected:
- Agent queries speaker data
- Agent calls ShowEmbed-SpeakerListItem
- Speaker cards render with names, positions
```

**Test 3: Display Places**

```
User: "Show me coffee shops nearby"
Expected:
- Agent calls GetNearbyPlaces
- Agent calls ShowEmbed-PlacesMap (preferred) or ShowEmbed-PlaceListItem
- Map renders with markers OR place cards show
```

**Test 4: Missing Data Fetch**

```
User: "Show session with ID 12345"
Expected:
- Agent calls ShowEmbed-ScheduleListItem with {__typename: "SchedSession", id: "12345"}
- Client checks cache, data missing
- Client fetches via entities query
- Component renders after fetch
- "Fetching missing data..." message shown
```

### 3. Verify Apollo Cache Integration

**Open React DevTools → Apollo Client DevTools**:

1. Send: "Show me session X"
2. Check cache after render
3. Verify session data is cached
4. Send same query again
5. Verify no duplicate network request

### 4. Test Error Handling

**Test 1: Invalid ID**

```
User: "Show session with ID invalid-999"
Expected:
- Tool returns error
- Agent falls back to text response
- No component crash
```

**Test 2: Network Failure**

```
# Stop Rover MCP server
User: "Show me sessions"
Expected:
- MCP query fails
- Agent explains data unavailable
- No uncaught errors
```

---

## 🔍 Troubleshooting

### Issue: "Component has no fragments"

**Cause**: Component doesn't export static `fragments` property

**Solution**: Verify components:

```typescript
// Check in component file
export const ScheduleListItem = (props) => { ... };
ScheduleListItem.fragments = { SchedSession: gql`...` };
```

### Issue: "Could not render component due to missing data"

**Causes**:

1. Fragment not in cache
2. `fetchIfMissing` not enabled
3. Entities query failing

**Solutions**:

```typescript
// Enable auto-fetch in fragmentComponentEmbeds.ts
ScheduleListItem: (expose(ScheduleListItem, {
  // ...
  fetchIfMissing: true, // ✅ Enable this
}),
  // Check entities query works
  client.query({
    query: gql`
      query Test($identifiers: [EntityIdentifier!]!) {
        entities(identifiers: $identifiers) {
          __typename
          id
        }
      }
    `,
    variables: {
      identifiers: [{ typename: "SchedSession", id: "123" }],
    },
  }));
```

### Issue: "Zod schema validation failed"

**Cause**: JSON Schema → Zod conversion issues

**Solution**: Use proper converter:

```bash
npm install json-schema-to-zod
```

```typescript
import { jsonSchemaToZod as convert } from "json-schema-to-zod";

const zodSchema = convert(details.schema);
```

### Issue: Embeds not rendering

**Causes**:

1. `useShowEmbedActions()` not called
2. Message data structure wrong
3. Component name mismatch

**Solutions**:

```typescript
// Verify in Omnibar.tsx
useShowEmbedActions(); // ✅ Must be called

// Debug message data
console.log("Message data:", message.data);

// Check component name matches
const validNames = Object.keys(availableFragmentComponents);
console.log("Valid embed components:", validNames);
```

### Issue: "Multiple renders causing infinite loop"

**Cause**: Apollo cache writes triggering re-renders

**Solution**: Use `client.cache.batch()` to wrap writes:

```typescript
return client.cache.batch({
  update(cache) {
    // All cache operations here
    cache.writeFragment({ ... });
    return result;
  },
});
```

---

## 📚 Reference Links

### CopilotKit Documentation

- [useCopilotAction Hook](https://docs.copilotkit.ai/reference/hooks/useCopilotAction)
- [Custom Renderers](https://docs.copilotkit.ai/guides/custom-renderers)

### Apollo Client

- [Cache API](https://www.apollographql.com/docs/react/caching/cache-interaction/)
- [readFragment](https://www.apollographql.com/docs/react/caching/cache-interaction/#readfragment)
- [writeFragment](https://www.apollographql.com/docs/react/caching/cache-interaction/#writefragment)

### Vercel SDK Comparison

- [`expo/src/agent/clientTools/fragmentComponentEmbeds.ts`](../../clientTools/fragmentComponentEmbeds.ts) - Component definitions
- [`expo/src/agent/vercelSdk/Omnibar/ShowEmbedTool.tsx`](../../vercelSdk/Omnibar/ShowEmbedTool.tsx) - Original implementation

### GraphQL

- [Fragment Colocation Pattern](https://www.apollographql.com/docs/react/data/fragments/#colocating-fragments)
- [generateFragmentJsonSchema](../../../../utils/generateJsonSchema.ts) - Schema generation utility

---

## ✅ Completion Checklist

- [ ] Server-side embed actions registered in `agent.ts`
- [ ] JSON Schema → Zod conversion working
- [ ] `ShowEmbedAction.tsx` created with Apollo cache logic
- [ ] `ShowEmbedPart.tsx` created for rendering
- [ ] `useShowEmbedActions()` called in `Omnibar.tsx`
- [ ] `MessagePart.tsx` updated to detect embeds
- [ ] System prompt updated to mention embed tools
- [ ] All 4 embed types tested (sessions, speakers, places, map)
- [ ] Apollo cache integration working (no duplicate fetches)
- [ ] Missing data auto-fetch working
- [ ] Error handling tested (invalid IDs, network failures)
- [ ] Suspense loading states working
- [ ] No console errors or infinite loops

---

## 🚀 Next Steps

Once Task 3 is complete, proceed to:

- **Task 4**: Local Mutations (Bookmarks) - If not already done
- **Task 5**: Route Navigation & Chat Control

---

**Last Updated**: 2025-10-21

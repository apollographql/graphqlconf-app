# Integration Patterns

This document describes the GraphQL integration patterns used throughout this codebase. These patterns ensure type safety, component isolation, and maintainable data fetching.

## Fragment Colocation

Fragment colocation is the foundational pattern for all data fetching in this application. It ensures that each component explicitly declares its data requirements and maintains proper type safety with Apollo Client's data masking.

### Core Principles

1. **Each component owns its fragment** - Components define GraphQL fragments for the exact data they need
2. **Fragments live next to components** - Fragment definitions are colocated in the same file as the component
3. **Type safety via code generation** - GraphQL Code Generator creates TypeScript types automatically
4. **Data masking** - Apollo Client ensures components only access their declared fragment data
5. **Fragment spreading** - Parent components spread child fragments to compose data requirements

### Pattern Structure

#### 1. Component with Fragment Definition

Components declare their fragments using a specific pattern:

```tsx
// src/components/ListItems/ScheduleListItem.tsx
import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { ScheduleListItem_SessionFragmentDoc } from "./ScheduleListItem.generated";

// Fragment definition in if(false) block - this fragment is used by codegen to create `ScheduleListItem_SessionFragmentDoc` in the colocated generated file
// Will be stripped at runtime
if (false) {
  gql`
    fragment ScheduleListItem_session on SchedSession {
      __typename
      id
      name
      isBookmarked @client
      venue {
        id
        name
      }
      start_time
      end_time
    }
  `;
}

// Export fragments as static property
ScheduleListItem.fragments = {
  session: ScheduleListItem_SessionFragmentDoc,
} as const;

// Register fragment with Apollo Client
fragmentRegistry.register(ScheduleListItem.fragments.session);

// Component implementation
export function ScheduleListItem({
  session,
}: {
  session:
    | FragmentType<typeof ScheduleListItem.fragments.session>
    | FromParent<typeof ScheduleListItem.fragments.session>;
}) {
  const { data } = useSuspenseFragment({
    fragment: ScheduleListItem.fragments.session,
    fragmentName: "ScheduleListItem_session",
    from: session,
  });

  return <div>{data.name}</div>;
}
```

**Key aspects:**

- **`if (false)` block**: Contains the fragment definition for IDE tooling (syntax highlighting, autocomplete). This is stripped at runtime.
- **Static `.fragments` property**: Exports the generated fragment document for parent components to reference
- **Fragment registry**: Registers fragments globally so Apollo Client can recognize them
- **`FragmentType<T>` type**: an object from a parent query/fragment that is guaranteed to include this fragment
- **`FromParent<T>` type ** - an object of the shape `{ __typename: "SchedSession", id: string }` 
- a component can use either or both types depending on its use case
- **`useSuspenseFragment`**: Reads the data for the fragment from the cache

#### 2. Generated Types File

GraphQL Code Generator creates a `.generated.ts` file next to each component:

```tsx
// src/components/ListItems/ScheduleListItem.generated.ts
export type ScheduleListItem_SessionFragment = {
  __typename: 'SchedSession';
  id: string;
  name: string;
  isBookmarked: boolean;
  venue: { __typename: 'SchedVenue'; id: string; name: string | null } | null;
  start_time: string;
  end_time: string;
} & { ' $fragmentName'?: 'ScheduleListItem_SessionFragment' };

export const ScheduleListItem_SessionFragmentDoc = {
  // ... DocumentNode definition
}: TypedDocumentNode<
  ScheduleListItem_SessionFragment,
  ScheduleListItem_SessionFragmentVariables
>;
```

**Key aspects:**

- **Fragment type**: TypeScript type matching the fragment selection
- **Fragment document**: The actual GraphQL AST for the fragment. This is a `TypedDocumentNode` which includes types for variables and results and will automatically ensure type safety when used in queries/fragments
- **Fragment name branding**: The `$fragmentName` property ensures data masking works correctly

#### 3. Parent Component Spreading Fragments

Parent components spread child fragments in their queries/fragments:

```tsx
// src/screens/Schedule/components/ScheduleList.tsx
import { ScheduleListItem } from "@/components/ListItems/ScheduleListItem";

if (false) {
  gql`
    fragment ScheduleList_Query on Query {
      event(id: $eventId) {
        id
        sessions {
          id
          start_time_ts
          ...ScheduleListItem_session  # Spread child fragment
        }
      }
    }
  `;
}

ScheduleList.fragments = {
  Query: ScheduleList_QueryFragmentDoc,
} as const;
fragmentRegistry.register(ScheduleList.fragments.Query);

export function ScheduleList({ parent }: {
  parent: FragmentType<typeof ScheduleList.fragments.Query>;
}) {
  const { data } = useSuspenseFragment({
    fragment: ScheduleList.fragments.Query,
    fragmentName: "ScheduleList_Query",
    from: parent,
  });

  return (
    <SectionList
      data={data.event?.sessions}
      renderItem={({ item }) => <ScheduleListItem session={item} />}
    />
  );
}
```

**Key aspects:**

- **Fragment spreading**: `...ScheduleListItem_session` includes the child fragment in the parent query or parent fragment
- **No need to import fragment doc**: The fragment name reference is enough; the registry handles the rest
- **Data masking preserved**: Parent can't access child fragment fields directly
- **Type safety**: TypeScript ensures the correct data shape is passed to child components

### Benefits

1. **Declarative data needs**: Each component clearly states what data it requires
1. **Type Safety**: TypeScript enforces that components receive the exact data they declare
2. **Data Isolation**: Components can only access data from their own fragments (not parent or sibling data)
3. **Refactoring Safety**: Changing a component's data needs only requires updating its fragment
4. **No Over-fetching**: Each component explicitly declares what it needs
5. **Composability**: Fragments compose naturally through spreading
6. **Colocation**: Data requirements live next to the UI code that uses them

### Fragment Naming Convention

Follow this naming pattern for consistency:

```
{ComponentName}_{propName}
```

The fragment name is composed of the exact component name, followed by an underscore and the name of the prop that passes in the parent object or `{ __typename, id }` combination. 

Examples:
- `ScheduleListItem_session` (`ScheduleListItem` component receives a `session` prop for SchedSession type)
- `SpeakerListItem_speaker` (`SpeakerListItem` component receives a `speaker` prop for SchedSpeaker type)
- `PlaceListItem_place` (`PlaceListItem` component receives a `place` prop for Place type)
- `PlacesMap_places` (`PlacesMap` component receives a `places` prop for array of Place types)
- `Omnibar_frameworks` (`Omnibar` component receives a `frameworks` prop for Query type with AI framework data)

The prop name should:
- Describe **what the data represents** to the component
- Be **concise and semantic** (prefer `session` over `SchedSession`)
- Match the **component's prop interface** exactly
- Be singular for a single parent object or identifier, plural for an array of parent objects or identifiers.

### Client-Side Fields

Fragments can include client-side fields using the `@client` directive:

```graphql
fragment MyComponent_MyType on MyType {
  id
  serverField
  isBookmarked @client  # Client-only field
}
```

Client-side fields are:
- Defined in Apollo Client's type policies
- Not sent to the server
- Resolved from local cache or reactive variables
- Fully type-safe when code-generated

### When to Use This Pattern

**Always use fragment colocation for components that need to access API data**

### Code Generation

Run code generation after modifying fragments:

```bash
cd expo
npm run codegen        # One-time generation
npm run codegen:watch  # Watch mode during development
```

Generated files follow the pattern:
- **Source**: `src/components/MyComponent.tsx`
- **Generated**: `src/components/MyComponent.generated.ts`

### Further Reading

- Apollo Client Data Masking: https://apollographql.com/docs/react/data/fragments/#data-masking
- Fragment Colocation: https://apollographql.com/docs/react/data/fragments/#colocating-fragments
- GraphQL Code Generator: https://the-guild.dev/graphql/codegen

---

## AI Embed Tools

Embed Tools allow UI components originally designed for specific screen positions to be reused within the AI chat interface. They expose React components as AI tools using the Vercel AI SDK, enabling the AI agent to display rich, interactive content instead of plain text responses.

### Core Concept

Embed Tools bridge three systems:
1. **React Components** - UI components with fragment-based data requirements
2. **Apollo Cache** - Normalized GraphQL data storage
3. **AI Tools** - LLM-callable functions with JSON Schema validation

When the AI calls an embed tool, the system either:
- Reads existing data from the Apollo cache, or
- Writes new data to the cache first

Then renders the component with a fragment identifier (`{ __typename, id }`), allowing the component to read its required data via `useSuspenseFragment`.

### Three Embed Approaches

#### Approach 1: Fragment Identifier Embeds (Cache-Only)

**Use case**: Display entities known to be in the cache from previous queries.

**Example**: `SpeakerListItem`, `PlaceListItem`

```tsx
// expo/src/agent/clientTools/embeds/fragments.ts
/** A function returning a JSON Schema describing the necessary identifier object (id and __typename) for the first fragment in a DocumentNode */
declare function fragmentIdentifier(fragmentDoc: DocumentNode): JSONSchema7Definition

export const availableFragmentComponents = {
  SpeakerListItem: expose(SpeakerListItem, {
    description: `Display a speaker item, e.g. a conference speaker`,
    props: {
      speaker: fragmentIdentifier(SpeakerListItem.fragments.speaker),
    },
  }),
  // ...
};
```

**Tool schema generated for the AI**:
```json
{
  "type": "object",
  "properties": {
    "speaker": {
      "type": "object",
      "properties": {
        "__typename": { "type": "string", "const": "SchedSpeaker" },
        "id": { "type": "string" }
      },
      "required": ["__typename", "id"]
    }
  }
}
```

**AI calls the tool with**:
```json
{
  "speaker": {
    "__typename": "SchedSpeaker",
    "id": "12345"
  }
}
```

**Execution flow**:
1. AI calls `ShowEmbed-ScheduleListItem` with `{ __typename, id }`
2. `handleShowEmbedToolCall` detects identifier-only input (only 2 keys)
3. Attempts to read fragment data from cache using `cache.readFragment()`
4. If data exists: Returns success, component renders with cached data
5. If data missing: Returns error, AI falls back to text response

**Key characteristics**:
- **Minimal payload**: Only `__typename` and `id` sent to tool
- **Assumes data exists**: Relies on previous queries populating the cache
- **Fast**: No data writing, direct cache read
- **Error handling**: Returns error if data not found, prompting AI to use text fallback

#### Approach 1b: Fragment Identifier Embeds with Auto-Fetch

**Use case**: Display entities that might or might not be in cache, with automatic fallback to fetching.

**Example**: `ScheduleListItem`

```tsx
// expo/src/agent/clientTools/embeds/fragments.ts
export const availableFragmentComponents = {
  ScheduleListItem: expose(ScheduleListItem, {
    description: `Display a schedule item, e.g. a conference talk`,
    props: {
      session: fragmentIdentifier(ScheduleListItem.fragments.session),
    },
    fetchIfMissing: true,  // Enable automatic fetching
  }),
  // ...
};
```

**Tool schema generated for the AI**:
Same as Approach 1 - only `__typename` and `id`:
```json
{
  "type": "object",
  "properties": {
    "session": {
      "type": "object",
      "properties": {
        "__typename": { "type": "string", "const": "SchedSession" },
        "id": { "type": "string" }
      },
      "required": ["__typename", "id"]
    }
  }
}
```

**AI calls the tool with**:
```json
{
  "session": {
    "__typename": "SchedSession",
    "id": "12345"
  }
}
```

**Execution flow**:
1. AI calls `ShowEmbed-ScheduleListItem` with `{ __typename, id }`
2. `handleShowEmbedToolCall` detects identifier-only input (only 2 keys)
3. Attempts to read fragment data from cache using `cache.readFragment()`
4. If data exists: Returns success, component renders with cached data
5. If data missing AND `fetchIfMissing: true`:
   - Executes GraphQL query to fetch the entity from the server
   - Writes fetched data to cache using `cache.writeQuery()`
   - Returns success, component renders with freshly fetched data
6. If data missing AND no fetch configured: Returns error

**Implementation in `handleShowEmbedToolCall`**:

```tsx
if (identifierOnly) {
  // Try to read from cache
  const fragmentData = cache.readFragment({
    id: cache.identify(item),
    fragment,
    fragmentName,
  });

  if (!fragmentData) {
    // Cache miss - check if we should fetch
    if (embed.fetchIfMissing) {
      // Execute query to fetch entity by ID
      void client.query({
        query: GetEntityQuery,  // Generated query for this entity type
        variables: { typename: item.__typename, id: item.id },
      }).catch();

      // Data now in cache, component can render
      return {
        state: "recoverable",
        message: "Data was missing from cache, but will be fetched and the component will be displayed. It will have this shape: <shape>",
      }
    } else {
      return {
        state: "output-error",
        errorText: "Could not render component due to missing data.",
      };
    }
  }
}
```

**Key characteristics**:
- **Minimal payload**: Only `__typename` and `id` sent to tool
- **Cache-first strategy**: Checks cache before fetching
- **Automatic fallback**: Fetches from server if cache misses
- **Reliability**: Always succeeds if entity exists on server
- **Performance**: Fast when cached, graceful degradation when not
- **Transparent to AI**: AI doesn't need to know about cache state

**Trade-offs**:
- **Pro**: Combines minimal payload with reliability
- **Pro**: Works regardless of cache state
- **Pro**: No AI error handling needed
- **Con**: Additional network request on cache miss
- **Con**: Requires entity query to be available for the type
- **Con**: Slightly more complex implementation

#### Approach 2: Full Fragment Data Embeds

**Use case**: Display entities from external sources or when cache state is uncertain.

**Example**: `PlacesMap`

```tsx
// expo/src/agent/clientTools/embeds/fragments.ts
/** A function retunring a JSON Schema describing the full data shape of the first fragment in a DocumentNode */
declare function fullFragmentData(fragmentDoc: DocumentNode): JSONSchema7Definition

export const availableFragmentComponents = {
  PlacesMap: expose(PlacesMap, {
    description: `Display a map with markers for one or more locations`,
    props: {
      places: {
        type: "array",
        items: fullFragmentData(PlacesMap.fragments.places),
      },
    },
  }),
};
```

**Tool schema generated for the AI**:
```json
{
  "type": "object",
  "properties": {
    "places": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "__typename": { "type": "string", "const": "Place" },
          "id": { "type": "string" },
          "displayName": { "type": "string" },
          "location": {
            "type": "object",
            "properties": {
              "latitude": { "type": "number" },
              "longitude": { "type": "number" }
            }
          }
          // ... all fragment fields with full type information
        }
      }
    }
  }
}
```

**AI calls the tool with complete data**:
```json
{
  "places": [
    {
      "__typename": "Place",
      "id": "place_123",
      "displayName": "Coffee Shop",
      "location": { "latitude": 37.7749, "longitude": -122.4194 }
    }
  ]
}
```

**Execution flow**:
1. AI calls `ShowEmbed-PlacesMap` with full fragment data
2. `handleShowEmbedToolCall` detects full data (more than 2 keys)
3. Writes data to cache using `cache.writeFragment()`
4. Component renders with identifier, reads from cache via `useSuspenseFragment`
5. If write fails: Returns error with schema validation message

**Key characteristics**:
- **Complete payload**: All fragment fields included
- **Self-contained**: Doesn't rely on existing cache state
- **Schema-validated**: AI SDK validates data against fragment schema
- **Data persistence**: Writes to cache, making data available to other components

### Fragment Schema Generation

Full fragment data embeds use `@apollo/graphql-standard-schema` to generate JSON Schema from GraphQL fragments (this package is not fully finished and currently not published yet, it is added directly to this repository):

```tsx
// expo/src/agent/clientTools/embeds/fragmentSchemaGenerator.ts
import { GraphQLStandardSchemaGenerator } from "@apollo/graphql-standard-schema";

export function getFragmentJSONSchema(
  fragmentDoc: DocumentNode,
  fragmentName?: string
) {
  const generator = new GraphQLStandardSchemaGenerator({ schema: cachedSchema });
  const standardSchema = generator.getFragmentSchema(fragmentDoc, { fragmentName });

  return standardSchema["~standard"].toJSONSchema({
    io: "input",
    target: "draft-2020-12",
  });
}
```

This generates strict JSON Schema matching the GraphQL fragment structure, ensuring:
- Type safety between GraphQL and AI tool schemas
- Automatic validation of AI-provided data
- Accurate LLM tool descriptions for better AI decision-making

Note that AI tools often use JSON Schema more as a recommendation on the argument shape rather than strict validation, so the AI may still call the tool with slightly different shapes. This can cause bugs. Additional validation might be necessary, especially for nested objects and arrays. More modern AI models are significantly better at following complex JSON Schema.

### Tool Registration

Embed tools are registered alongside other agent tools:

```tsx
// expo/src/agent/agent.ts
import { componentTools } from "@/agent/clientTools/embeds/fragments";

const tools = {
  ...supergraphMcp.tools,      // MCP server tools
  ...remoteEventsMcp.tools,    // Remote MCP tools
  ...componentTools,           // Embed tools (ShowEmbed-*)
  ...clientTools,              // Client-side tools
};

streamText({
  model: createOpenAI(...)("gpt-4o"),
  tools,
  // ...
});
```

All embed tools are prefixed with `ShowEmbed-` (e.g., `ShowEmbed-ScheduleListItem`, `ShowEmbed-PlacesMap`).
The prompt instructs the AI to prefer these tools over text when possible.

### Tool Execution and Rendering

#### Server-Side: Tool Execution

When the AI calls an embed tool, `handleShowEmbedToolCall` handles the execution in the browser:

```tsx
// expo/src/components/Omnibar/ShowEmbedTool.tsx
export function handleShowEmbedToolCall(
  toolCall: ToolCall,
  client: ApolloClient
): void | ToolResult {
  if (!toolCall.toolName.startsWith("ShowEmbed-")) return;

  const componentName = toolCall.toolName.substring("ShowEmbed-".length);
  const { Component } = availableFragmentComponents[componentName];
  const props = toolCall.input;

  return client.cache.batch({
    update(cache): ToolResult {
      for (const [key, fragment] of Object.entries(Component.fragments)) {
        const propValue = props[key];

        for (const item of Array.isArray(propValue) ? propValue : [propValue]) {
          const identifierOnly = item.__typename && Object.keys(item).length === 2;

          if (identifierOnly) {
            // Approach 1: Read from cache
            const fragmentData = cache.readFragment({
              id: cache.identify(item),
              fragment,
              fragmentName,
            });

            if (!fragmentData) {
              return {
                state: "output-error",
                errorText: "Could not render component due to missing data. Fall back to text response.",
              };
            }
          } else {
            // Approach 2: Write to cache
            try {
              cache.writeFragment({
                id: cache.identify(item),
                fragment,
                fragmentName,
                data: item,
              });
            } catch (e) {
              return {
                state: "output-error",
                errorText: "Data could not be written. Arguments didn't satisfy the inputSchema.",
              };
            }
          }
        }
      }

      return {
        toolCallId: toolCall.toolCallId,
        output: ["This data has been displayed to the user:", props],
      };
    },
  });
}
```

#### Client-Side: Component Rendering

After tool execution succeeds, the chat UI renders the component:

```tsx
// expo/src/components/Omnibar/ShowEmbedTool.tsx
export function ShowEmbedPart({ part }: { part: ShowEmbedToolUIInvocation }) {
  const componentName = part.type.substring("tool-ShowEmbed-".length);

  if (part.state === "output-available") {
    const embed = availableFragmentComponents[componentName];

    return (
      <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
        <embed.Component {...(part.input as any)} />
      </Suspense>
    );
  }
}
```

The component receives fragment identifiers and reads full data via `useSuspenseFragment`.

### AI Agent Instructions

The agent is instructed to prefer rich embeds over text:

```tsx
// expo/src/agent/prompt.ts
export const prompt = `
If possible, use the "ShowEmbed-*" tools to show rich information.
After calling a "ShowEmbed-*" tool, wait for the tool result before responding.
Don't repeat the information displayed by that tool in text form.
If the tool returns an error, fall back to giving the user a fully textual response.

Even if the user asks for a "list", try to use the "ShowEmbed-*" tools
rather than listing it out yourself.
`;
```

### When to Use Each Approach

#### Use Approach 1 (Fragment Identifier - Cache-Only) When:
- Displaying results immediately after an MCP query (e.g., search results just fetched)
- You want maximum performance with minimal network requests
- Cache state is guaranteed (data was just fetched by a previous tool call)
- You want to detect and report missing data to the AI for error handling

#### Use Approach 1b (Fragment Identifier with Auto-Fetch) When:
- Displaying entities that might or might not be cached
- You want minimal tool payload but need reliability
- Cache state is uncertain but entities are fetchable by ID
- You want transparent cache-first behavior without AI intervention
- **Recommended default** for most entity display scenarios

#### Use Approach 2 (Full Fragment Data) When:
- Displaying data from external non-GraphQL sources
- The AI is transforming, aggregating, or computing data client-side
- Data isn't fetchable via entity queries (no `@key` on the type)
- Tool payload size isn't a concern
- You want complete control over what data is cached

### Creating New Embed Tools

To expose a new component as an embed tool:

1. **Ensure the component uses fragment colocation** (see Fragment Colocation section)

2. **Register the component in `fragments.ts`**:

```tsx
// expo/src/agent/clientTools/embeds/fragments.ts
import { MyNewListItem } from "@/components/ListItems/MyNewListItem";

export const availableFragmentComponents = {
  // ... existing embeds

  MyNewListItem: expose(MyNewListItem, {
    description: `Display a custom entity with rich formatting`,
    props: {
      // Choose approach:

      // Approach 1: Cache-only (errors if not cached)
      MyEntity: fragmentIdentifier(MyNewListItem.fragments.MyEntity),

      // Approach 1b: Auto-fetch (recommended default)
      MyEntity: fragmentIdentifier(MyNewListItem.fragments.MyEntity),
      fetchIfMissing: true,

      // Approach 2: Full data payload
      MyEntity: fullFragmentData(MyNewListItem.fragments.MyEntity),
    },
  }),
};
```

3. **Write clear tool descriptions** - The AI uses these to decide when to call the tool

4. **Configure `fetchIfMissing` (for Approach 1b)**:
   - Set `fetchIfMissing: true` to enable automatic fetching on cache miss
   - Requires the entity type to have a query operation (e.g., `GetEntities`)
   - Works best with federated entities that support `@key` directive

5. **Test cache behavior**:
   - For cache-only embeds: Ensure previous queries populate the cache
   - For auto-fetch embeds: Test both cached and uncached scenarios
   - For full data embeds: Verify schema validation and cache writes

6. **Run code generation** to update types:
```bash
cd expo
npm run codegen
```

### Benefits

1. **Rich UI in chat**: Display interactive components instead of plain text
2. **Component reuse**: Leverage existing UI components without modification
3. **Type safety**: Full GraphQL-to-JSON-Schema type checking
4. **Cache integration**: Seamless integration with Apollo Client's normalized cache
5. **Flexible data sourcing**: Support both cached and fresh data
6. **Graceful fallback**: Automatic text fallback when data unavailable

### Further Reading

- Vercel AI SDK Tools: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- Apollo Client Cache: https://apollographql.com/docs/react/caching/overview
- JSON Schema: https://json-schema.org/

---

## GraphQL Tool Cache Integration

This pattern automatically populates the Apollo cache with GraphQL query results from AI tool calls to the Apollo MCP, enabling Fragment Identifier Embeds to work seamlessly without explicit cache management.

### The Problem

When the AI agent calls MCP tools that execute GraphQL queries (e.g., `GetSessions`, `GetEvents`, `GetNearbyPlaces`), the results are sent back to the agent as tool outputs. As a side effect of how the Vercel AI SDK works, these results are not only exposed to the server, but also are sent to the browser.
However, these results aren't automatically available in the Apollo cache, which means:

1. Fragment Identifier Embeds can't find the data (cache miss)
2. The AI would need to use Full Fragment Data Embeds instead
3. Component queries would refetch data unnecessarily

### The Solution

`GraphQLToolChatTransport` extends the Vercel AI SDK's `DefaultChatTransport` to intercept the tool response stream and automatically write GraphQL query results to the Apollo cache.

### How It Works

#### 1. Custom Transport Class

The transport extends `DefaultChatTransport` and intercepts the response stream:

```tsx
// expo/src/components/Omnibar/GraphQLToolChatTransport.ts
import { ApolloClient, DocumentNode } from "@apollo/client";
import { DefaultChatTransport, UIMessageChunk } from "ai";

export class GraphQLToolChatTransport extends DefaultChatTransport<UIMessage> {
  private client: ApolloClient;

  constructor(
    client: ApolloClient,
    options: ConstructorParameters<typeof DefaultChatTransport>[0]
  ) {
    super(options);
    this.client = client;
  }

  override processResponseStream(
    stream: ReadableStream<Uint8Array>
  ): ReadableStream<UIMessageChunk> {
    const toolCalls: Record<string, { name: string; variables?: OperationVariables }> = {};
    const { client } = this;

    return super.processResponseStream(stream).pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk); // Pass through all chunks

          switch (chunk.type) {
            case "tool-input-start":
              // Track tool call initiation
              toolCalls[chunk.toolCallId] = { name: chunk.toolName };
              break;

            case "tool-input-available":
              // Store tool variables
              const tool = toolCalls[chunk.toolCallId];
              if (tool) tool.variables = chunk.input;
              break;

            case "tool-output-available":
              // Write GraphQL results to cache
              const tool = toolCalls[chunk.toolCallId];
              const queryDetails = KnownQueries[tool.name.toLowerCase()];
              const data = chunk.output?.structuredContent?.data;

              if (queryDetails && data) {
                client.writeQuery({
                  query: queryDetails.query,
                  data,
                  variables: {
                    ...queryDetails.defaultVariables,
                    ...tool.variables,
                  },
                });
              }

              delete toolCalls[chunk.toolCallId];
              break;
          }
        },
      })
    );
  }
}
```

**Key aspects:**

- **Stream passthrough**: All chunks are passed through unchanged to maintain normal chat behavior
- **Tool tracking**: Tracks tool calls from start to completion
- **Selective writing**: Only writes results from known GraphQL queries
- **Variable merging**: Combines default variables with call-specific variables

#### 2. Known Queries Registry

The transport maintains a registry of GraphQL queries that should be written to cache:

```tsx
// expo/src/components/Omnibar/GraphQLToolChatTransport.ts
import * as KNOWN from "@/agent/mcp/supergraph-mcp-operations";

const KnownQueries: Record<
  string,
  { query: DocumentNode; defaultVariables?: OperationVariables }
> = Object.fromEntries(
  Object.entries(KNOWN).map(([key, value]) => [
    key.toLowerCase(),
    { query: value },
  ])
);

// Add custom tool with default variables
KnownQueries["getcurrentevent"] = {
  query: KNOWN.GetEvents,
  defaultVariables: { ids: [process.env.EXPO_PUBLIC_CURRENT_EVENT] },
};
```

**Registry structure:**

- **Key**: Tool name (lowercase) - e.g., `"getsessions"`, `"getevents"`
- **Value**: Object with `query` (DocumentNode) and optional `defaultVariables`

**Registered queries:**

- `GetEntities` - Fetch mixed entity types by ID
- `GetEvents` - Fetch conference events
- `GetSessions` - Fetch conference sessions with filters
- `GetNearbyPlaces` - Search nearby places via Google Maps
- `GetPlaceDetails` - Get detailed place information
- `getCurrentEvent` - Custom tool wrapping GetEvents with current event ID

This list gets updated as new MCP operations are added - GraphQL Codegen reads `.graphql` files in `connector/operations/` and generates typed exports in `supergraph-mcp-operations.ts`.

#### 3. Integration with Chat UI

The transport is instantiated in the Omnibar component:

```tsx
// expo/src/components/Omnibar/Omnibar.tsx
import { useApolloClient } from "@apollo/client/react";
import { useChat } from "@ai-sdk/react";
import { GraphQLToolChatTransport } from "./GraphQLToolChatTransport";

export function Omnibar({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();

  const { messages, sendMessage } = useChat({
    transport: new GraphQLToolChatTransport(client, {
      fetch: expoFetch,
      api: generateAPIUrl("/api/chat"),
      body: (messages) => ({
        messages,
        context: {
          currentTime: new Date().toISOString(),
          currentEvent: process.env.EXPO_PUBLIC_CURRENT_EVENT!,
          location: "...",
        },
      }),
    }),
    onToolCall({ toolCall }) {
      // Handle client-side tool calls (embeds, bookmarks)
      const handled =
        handleShowEmbedToolCall(toolCall, client) ||
        handleGetBookmarksToolCall(toolCall) ||
        handleToggleBookmarksToolCall(toolCall, client);

      if (handled) addToolResult(await handled);
    },
  });

  // ... chat UI
}
```

**Key aspects:**

- Transport receives the Apollo client instance
- Hooks into the AI SDK's chat system
- Works alongside client-side tool handlers

#### 4. MCP Operations File Structure

The supergraph MCP operations are generated from `.graphql` files:

```
connector/operations/
├── getEvents.graphql       -> GetEvents tool
├── getSessions.graphql     -> GetSessions tool
├── getEntities.graphql     -> GetEntities tool
├── getNearbyPlaces.graphql -> GetNearbyPlaces tool
└── googleMapsGetPlaceDetails.graphql -> GetPlaceDetails tool
```

These are:
1. Exposed as MCP tools by the Apollo MCP Server (running on port 5000)
2. Made available to the AI agent
3. Code-generated into TypedDocumentNodes in `supergraph-mcp-operations.ts`
4. Registered in `KnownQueries` for cache integration

### Complete Flow Example

**User asks**: "Show me sessions about GraphQL"

1. **AI calls MCP tool**: `GetSessions({ eventId: "...", nameLike: "GraphQL" })`
2. **MCP server executes**: Queries the supergraph and returns results
3. **Transport intercepts**: Detects `tool-output-available` chunk
4. **Cache write**: `client.writeQuery()` normalizes and stores session data
5. **AI calls embed**: `ShowEmbed-ScheduleListItem({ session: { __typename: "SchedSession", id: "session_123" } })`
6. **Embed reads cache**: Component uses `useSuspenseFragment` to read from cache
7. **UI renders**: ScheduleListItem displays with rich formatting

**Without this pattern**, step 5 would fail because the session data wouldn't be in the cache.

### Benefits

1. **Automatic cache population**: No manual cache management needed
2. **Enables identifier embeds**: Fragment Identifier Embeds work seamlessly
3. **Reduces payload size**: AI can send minimal identifiers instead of full data
4. **Normalized cache**: Data is properly normalized via `writeQuery`
5. **Component reuse**: Other components can read the same cached data
6. **Optimistic UI**: Cache updates are immediate as tool results stream in

### Adding New Queries

To add support for a new GraphQL query:

1. **Add operation file** in `connector/operations/`:
   ```graphql
   # connector/operations/getVenues.graphql
   query GetVenues($eventId: String!) {
     event(id: $eventId) {
       venues {
         id
         name
         address
       }
     }
   }
   ```

2. **Regenerate types** (automatic with watch mode):
   ```bash
   cd expo
   npm run codegen
   ```

3. **Optionally add custom entry** with default variables:
   ```tsx
   KnownQueries["getcurrentvenues"] = {
     query: KNOWN.GetVenues,
     defaultVariables: { eventId: process.env.EXPO_PUBLIC_CURRENT_EVENT },
   };
   ```

### Caveats and Considerations

#### Partial Results

If a tool call returns partial data (e.g., only a subset of fields), `writeQuery` will only update those fields in the cache.

**Solution**: Ensure MCP operations fetch all fields needed by components.

#### Error Handling

The transport doesn't currently handle error states from tool calls.

**Future enhancement**: Could write error states to cache or trigger refetch logic.

### Debugging

Enable logging to see cache writes:

```tsx
// In GraphQLToolChatTransport.ts
console.log("Writing tool call result to Apollo cache", {
  tool: tool.name,
  query: print(queryDetails.query),
  variables: { ...queryDetails.defaultVariables, ...tool.variables },
  data,
});
```

Use Apollo Client DevTools to inspect cache contents after tool calls.

### Further Reading

- Vercel AI SDK Custom Transports: https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot#custom-transport
- Apollo Client `writeQuery`: https://apollographql.com/docs/react/caching/cache-interaction/#writequery
- Transform Streams API: https://developer.mozilla.org/en-US/docs/Web/API/TransformStream

---

## Client-Side LocalState Tools

This pattern exposes Apollo Client's LocalState (client-side GraphQL resolvers) as AI tools, enabling the agent to interact with browser-only state like bookmarks, preferences, and other persistent local data.

### The Problem

LocalState resolvers run exclusively in the browser and have access to:
- AsyncStorage/localStorage for persistence
- Browser-only APIs
- Client-side cache state

However, the AI agent runs server-side and:
- Can't execute LocalState mutations/queries
- Has no access to browser storage
- Can't read client-side fields marked with `@client`

**Traditional approach**: Expose LocalState via MCP server operations
**Problem**: MCP server runs server-side and can't access browser storage

**Solution**: Create client-side AI tools that execute in the browser with full LocalState access.

### The Solution: Client-Side Tools

Define AI tools that run in the browser's `onToolCall` handler instead of on the server, giving them full access to LocalState resolvers and browser APIs.

### Example: Bookmarks System

The bookmarks system demonstrates this pattern by exposing two LocalState operations as client-side tools:

#### 1. Tool Definitions (Server-Side)

Tools are defined with the AI SDK and registered alongside MCP tools:

```tsx
// expo/src/agent/clientTools/bookmarks.ts
import { jsonSchema, tool } from "ai";

export const clientTools = {
  getBookmarks: tool({
    description:
      "Get all bookmarked items (sessions, speakers, places, etc). Returns an array of objects with __typename and id fields.",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        typename: {
          type: "string",
          description: "Optional filter to only return bookmarks of a specific typename",
        },
      },
      additionalProperties: false,
    }),
  }),

  toggleBookmarks: tool({
    description:
      "Toggle bookmark status for one or more items. Bookmarked state persists across app sessions.",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Array of items to bookmark/unbookmark",
          items: {
            type: "object",
            properties: {
              typename: {
                type: "string",
                description: "The __typename of the entity",
              },
              id: {
                type: "string",
                description: "The id of the entity",
              },
              bookmarked: {
                type: "boolean",
                description: "Set to true to bookmark, false to unbookmark, or omit to toggle",
              },
            },
            required: ["typename", "id"],
            additionalProperties: false,
          },
        },
      },
      required: ["items"],
      additionalProperties: false,
    }),
  }),
};
```

**Key aspects:**

- Tools defined using Vercel AI SDK's `tool()` helper
- OpenAPI/JSON Schema format provides type safety and LLM guidance
- Descriptions explain when and how to use each tool
- No implementation - these are "shells" registered with the agent

#### 2. Tool Registration

Client tools are registered alongside MCP tools in the agent:

```tsx
// expo/src/agent/agent.ts
import { clientTools } from "@/agent/clientTools/bookmarks";
import { componentTools } from "@/agent/clientTools/embeds/fragments";

const tools = {
  ...supergraphMcp.tools,   // Server-side MCP tools
  ...remoteEventsMcp.tools, // Remote MCP tools
  ...componentTools,        // Embed tools (client-side)
  ...clientTools,           // LocalState tools (client-side)
};

streamText({
  model: createOpenAI(...)("gpt-4o"),
  tools,
  // ...
});
```

The AI sees all tools equally but doesn't know which execute server-side vs. client-side.

#### 3. Client-Side Tool Handlers

Handlers execute in the browser when the AI calls these tools:

**GetBookmarks Handler:**

```tsx
// expo/src/components/Omnibar/GetBookmarksTool.tsx
import { getBookmarks } from "@/utils/bookmarksStorage";

export function handleGetBookmarksToolCall(
  toolCall: ToolCall
): void | Promise<ToolResult> {
  if (toolCall.toolName !== "getBookmarks") return;

  return (async () => {
    const { typename } = toolCall.input as { typename?: string };

    const bookmarks = await getBookmarks();
    const filtered = typename
      ? bookmarks.filter((bookmark) => bookmark.typename === typename)
      : bookmarks;

    return {
      tool: toolCall.toolName,
      toolCallId: toolCall.toolCallId,
      output: {
        bookmarks: filtered.map((bookmark) => ({
          __typename: bookmark.typename,
          id: bookmark.id,
        })),
        count: filtered.length,
      },
    };
  })();
}
```

**ToggleBookmarks Handler:**

```tsx
// expo/src/components/Omnibar/ToggleBookmarksTool.tsx
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";

export function handleToggleBookmarksToolCall(
  toolCall: ToolCall,
  client: ApolloClient
): void | Promise<ToolResult> {
  if (toolCall.toolName !== "toggleBookmarks") return;

  return (async () => {
    const { items } = toolCall.input as { items: BookmarkItem[] };

    const results = await Promise.all(
      items.map(async (item) => {
        const { data } = await client.mutate({
          mutation: ToggleBookmarkDocument,
          variables: {
            id: item.id,
            typename: item.typename,
            isBookmarked: item.bookmarked,
          },
        });
        return data?.toggleBookmark;
      })
    );

    return {
      tool: toolCall.toolName,
      toolCallId: toolCall.toolCallId,
      output: { results, success: true },
    };
  })();
}
```

**Key aspects:**

- Handlers check `toolCall.toolName` to determine if they should handle the call
- Return `undefined` if not their tool (allows chaining multiple handlers)
- Execute LocalState mutations via `client.mutate()`
- Have full access to browser APIs (AsyncStorage, localStorage, etc.)
- Return tool results in the standard format

#### 4. Handler Registration in Chat UI

Handlers are called in the `onToolCall` callback:

```tsx
// expo/src/components/Omnibar/Omnibar.tsx
import { handleGetBookmarksToolCall } from "./GetBookmarksTool";
import { handleToggleBookmarksToolCall } from "./ToggleBookmarksTool";

const { messages, sendMessage, addToolResult } = useChat({
  transport: new GraphQLToolChatTransport(client, { /* ... */ }),

  async onToolCall({ toolCall }) {
    if (toolCall.dynamic) return;

    const handled =
      handleShowEmbedToolCall(toolCall, client) ||
      handleGetBookmarksToolCall(toolCall) ||
      handleToggleBookmarksToolCall(toolCall, client);

    if (handled) {
      addToolResult(await handled);
      return;
    }
  },
});
```

**Key aspects:**

- `onToolCall` executes in the browser for every tool call
- Handlers are tried in sequence using `||` short-circuit
- First handler that returns a value handles the tool
- Result is added back to the conversation via `addToolResult()`

### LocalState Implementation

#### Storage Layer

Bookmarks are stored in AsyncStorage (React Native) or localStorage (web):

```tsx
// expo/src/utils/bookmarksStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mutex } from "async-mutex";

const BOOKMARKS_KEY = "@graphqlconf:bookmarks";
const bookmarksMutex = new Mutex();

export async function getBookmarks(): Promise<BookmarkItem[]> {
  const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
  const bookmarksMap = data ? JSON.parse(data) : {};

  return Object.keys(bookmarksMap).map((key) => {
    const [typename, id] = key.split(":");
    return { id, typename };
  });
}

export async function toggleBookmark(
  id: string,
  __typename: string,
  shouldBeBookmarked?: boolean
): Promise<boolean> {
  return await bookmarksMutex.runExclusive(async () => {
    const bookmarksMap = await getBookmarksMap();
    const key = `${__typename}:${id}`;

    if (shouldBeBookmarked === undefined) {
      // Toggle current state
      bookmarksMap[key] = !bookmarksMap[key];
    } else {
      // Set explicit state
      if (shouldBeBookmarked) {
        bookmarksMap[key] = true;
      } else {
        delete bookmarksMap[key];
      }
    }

    await saveBookmarksMap(bookmarksMap);
    return !!bookmarksMap[key];
  });
}

export async function isBookmarked(parent: {
  id: string;
  __typename: string;
}): Promise<boolean> {
  const bookmarksMap = await getBookmarksMap();
  const key = `${parent.__typename}:${parent.id}`;
  return key in bookmarksMap;
}
```

**Key aspects:**

- Mutex prevents race conditions during concurrent updates
- Data stored as `{ "typename:id": true }` map for fast lookups
- Supports toggle, explicit set, and explicit unset operations

#### GraphQL LocalState Integration

LocalState resolvers expose bookmarks via GraphQL:

```tsx
// expo/src/apollo/bookmarksResolvers.ts
import type { LocalState } from "@apollo/client/local-state";
import { getBookmarks, toggleBookmark, isBookmarked } from "@/utils/bookmarksStorage";

export const bookmarksResolvers = {
  Query: {
    bookmarks: async (_root: unknown, args: { typename?: string }) => {
      const allBookmarks = await getBookmarks();
      if (args.typename) {
        return allBookmarks.filter((bookmark) => bookmark.typename === args.typename);
      }
      return allBookmarks;
    },
  },

  Mutation: {
    toggleBookmark: async (
      _root: unknown,
      args: { id: string; typename: string; isBookmarked?: boolean }
    ) => {
      const newState = await toggleBookmark(args.id, args.typename, args.isBookmarked);
      return { __typename: args.typename, id: args.id, isBookmarked: newState };
    },
  },

  SchedSession: {
    isBookmarked,
  },

  SchedSpeaker: {
    isBookmarked,
  },

  Place: {
    isBookmarked,
  },
} satisfies LocalState.Resolvers;
```

**Key aspects:**

- `Query.bookmarks` - Returns all bookmarked entities
- `Mutation.toggleBookmark` - Toggles bookmark state
- Field resolvers on entity types - Resolves `isBookmarked @client` field

#### Client Configuration

LocalState is configured in Apollo Client:

```tsx
// expo/src/apollo/client.ts
import { LocalState } from "@apollo/client/local-state";
import { bookmarksResolvers } from "@/apollo/bookmarksResolvers";

const client = new ApolloClient({
  cache: new InMemoryCache({ /* ... */ }),
  link: new HttpLink({ uri }),
  localState: new LocalState({
    resolvers: bookmarksResolvers,
  }),
});
```

#### Mutation Definition

The `toggleBookmark` mutation is defined with `@client`:

```tsx
// expo/src/mutations/ToggleBookmark.ts
import { gql } from "@apollo/client";

if (false) {
  gql`
    mutation ToggleBookmark(
      $id: String!
      $typename: String!
      $isBookmarked: Boolean
    ) {
      toggleBookmark(id: $id, typename: $typename, isBookmarked: $isBookmarked)
        @client {
        __typename
        id
        isBookmarked
      }
    }
  `;
}
```

The `@client` directive tells Apollo to resolve this mutation locally instead of sending to the server.

### Complete Flow Example

**User says**: "Bookmark this session for me"

1. **AI calls tool**: `toggleBookmarks({ items: [{ typename: "SchedSession", id: "session_123", bookmarked: true }] })`
2. **Server streams**: Tool call chunks flow to browser via Vercel AI SDK
3. **Handler executes**: `handleToggleBookmarksToolCall` detects the tool call
4. **Mutation runs**: Executes `client.mutate({ mutation: ToggleBookmarkDocument })` with `@client` directive
5. **LocalState resolves**: `bookmarksResolvers.Mutation.toggleBookmark` runs in browser
6. **Storage updates**: Writes to AsyncStorage via `toggleBookmark()`
7. **Cache updates**: Apollo cache updates `isBookmarked` field on entity
8. **Tool result**: Handler returns success to agent
9. **AI confirms**: "I've bookmarked that session for you"

### Benefits

1. **Browser API access**: Tools can use localStorage, cookies, device APIs
2. **Persistent state**: Data persists across app sessions
3. **GraphQL integration**: Works seamlessly with Apollo Client queries/mutations
4. **Type safety**: Full TypeScript types from mutation → handler → storage
5. **Cache reactivity**: Changes trigger Apollo cache updates and UI re-renders
6. **Universal pattern**: Works for any client-side state (preferences, drafts, etc.)

### Creating New LocalState Tools

To add a new client-side tool:

#### 1. Define Storage Layer

```tsx
// expo/src/utils/myFeatureStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getMyData(): Promise<MyData> {
  const data = await AsyncStorage.getItem("@app:mydata");
  return data ? JSON.parse(data) : defaultValue;
}

export async function setMyData(value: MyData): Promise<void> {
  await AsyncStorage.setItem("@app:mydata", JSON.stringify(value));
}
```

#### 2. Create LocalState Resolvers

```tsx
// expo/src/apollo/myFeatureResolvers.ts
import type { LocalState } from "@apollo/client/local-state";
import { getMyData, setMyData } from "@/utils/myFeatureStorage";

export const myFeatureResolvers = {
  Query: {
    myData: async () => getMyData(),
  },

  Mutation: {
    updateMyData: async (_root: unknown, args: { value: MyData }) => {
      await setMyData(args.value);
      return { success: true, value: args.value };
    },
  },
} satisfies LocalState.Resolvers;
```

#### 3. Register Resolvers in Apollo Client

```tsx
// expo/src/apollo/client.ts
import { myFeatureResolvers } from "@/apollo/myFeatureResolvers";

const client = new ApolloClient({
  // ...
  localState: new LocalState({
    resolvers: {
      ...bookmarksResolvers,
      ...myFeatureResolvers,
    },
  }),
});
```

#### 4. Define Mutation with @client

```tsx
// expo/src/mutations/UpdateMyData.ts
import { gql } from "@apollo/client";

if (false) {
  gql`
    mutation UpdateMyData($value: MyDataInput!) {
      updateMyData(value: $value) @client {
        success
        value
      }
    }
  `;
}
```

#### 5. Create AI Tool Definition

```tsx
// expo/src/agent/clientTools/myFeature.ts
import { jsonSchema, tool } from "ai";

export const myFeatureTool = {
  updateMyData: tool({
    description: "Update user's custom data",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        value: {
          type: "object",
          properties: {
            // Define your data shape
          },
          additionalProperties: false,
        },
      },
      required: ["value"],
      additionalProperties: false,
    }),
  }),
};
```

#### 6. Create Tool Handler

```tsx
// expo/src/components/Omnibar/MyFeatureTool.tsx
import { UpdateMyDataDocument } from "@/mutations/UpdateMyData";

export function handleMyFeatureToolCall(
  toolCall: ToolCall,
  client: ApolloClient
): void | Promise<ToolResult> {
  if (toolCall.toolName !== "updateMyData") return;

  return (async () => {
    const { value } = toolCall.input;

    const { data } = await client.mutate({
      mutation: UpdateMyDataDocument,
      variables: { value },
    });

    return {
      tool: toolCall.toolName,
      toolCallId: toolCall.toolCallId,
      output: { success: data?.updateMyData.success },
    };
  })();
}
```

#### 7. Register Handler in Omnibar

```tsx
// expo/src/components/Omnibar/Omnibar.tsx
const handled =
  handleShowEmbedToolCall(toolCall, client) ||
  handleGetBookmarksToolCall(toolCall) ||
  handleToggleBookmarksToolCall(toolCall, client) ||
  handleMyFeatureToolCall(toolCall, client);
```

### Use Cases

This pattern is ideal for:

- **Bookmarks/Favorites**: Persistent user selections
- **User Preferences**: Theme, language, notification settings
- **Draft Content**: Unsaved forms, in-progress edits
- **Local Analytics**: Usage tracking without server
- **Offline State**: Queue actions for later sync
- **Session State**: Shopping cart, filters, view preferences

### Caveats

#### Server-Side Rendering

LocalState resolvers don't run server-side. If using SSR:
- Provide default values for client fields
- Hydrate state after client mounts

#### Data Synchronization

If data should sync to server:
- Implement background sync logic
- Use optimistic updates for better UX
- Handle conflicts appropriately

#### Type Safety

The `@client` directive bypasses schema validation:
- Document expected shapes in resolvers
- Use TypeScript for runtime safety
- Consider GraphQL Code Generator for type generation

### Further Reading

- Apollo Client LocalState: https://apollographql.com/docs/react/local-state/local-state-management/
- Vercel AI SDK onToolCall: https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot#ontoolcall
- AsyncStorage (React Native): https://react-native-async-storage.github.io/async-storage/

---

## Entities Pattern (Federated Node Interface)

The Entities pattern provides a unified way to fetch heterogeneous entities by their `{ __typename, id }` identifiers, similar to Relay's Node interface. This enables efficient querying of mixed entity types (e.g., bookmarks) from multiple subgraphs including Apollo Connectors.

### The Problem

Many use cases require fetching mixed entity types in a single query:
- **Bookmarks**: User may bookmark sessions, speakers, and places
- **Search results**: Searches may return different entity types
- **AI queries**: Agent needs to fetch entities by ID without knowing how to "reach" them in terms of a normal query

**Ideal solution**: Query like Relay's Node interface:
```graphql
query {
  entities(identifiers: [
    { typename: "SchedSession", id: "session_123" },
    { typename: "Place", id: "place_456" }
  ]) {
    ... on SchedSession { name start_time }
    ... on Place { displayName { text } }
  }
}
```

**Challenges with Apollo Connectors**:
1. Connectors don't support interface definitions directly
2. Connectors always require network requests (can't just "mirror" input to output)
3. Need to coordinate entities across multiple subgraphs (conference data, Google Maps, etc.)

### The Solution: Hybrid Approach

Use a **hand-written subgraph** that defines the Entity interface and mirrors identifiers, letting Apollo Federation resolve the actual data from connector subgraphs.

### Architecture

#### 1. Hand-Written Entities Subgraph

A minimal federation subgraph runs in the Expo API route:

```tsx
// expo/src/app/api/graphql+api.ts
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "@apollo/client";

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.10"
      import: ["@key", "@external"]
    )

  type Query {
    entities(identifiers: [EntityIdentifier!]!): [Entity!]!
  }

  input EntityIdentifier {
    typename: String!
    id: String!
  }

  interface Entity {
    id: String!
  }

  # Extend types from other subgraphs to implement Entity
  extend type SchedSession implements Entity @key(fields: "id") {
    id: String! @external
  }

  extend type SchedSpeaker implements Entity @key(fields: "id") {
    id: String! @external
  }

  extend type SchedEvent implements Entity @key(fields: "id") {
    id: String! @external
  }

  extend type SchedVenue implements Entity @key(fields: "id") {
    id: String! @external
  }

  extend type Place implements Entity @key(fields: "id") {
    id: String! @external
  }
`;

const resolvers = {
  Query: {
    entities: (
      _: unknown,
      { identifiers }: { identifiers: { typename: string; id: string }[] }
    ) => {
      // Simply mirror identifiers back with __typename
      return identifiers.map(({ typename, id }) => ({
        __typename: typename,
        id,
      }));
    },
  },

  Entity: {
    __resolveType(obj: { __typename: string }) {
      return obj.__typename;
    },
  },
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });
const server = new ApolloServer({ schema });

export async function POST(request: Request) {
  // Handle GraphQL requests...
}
```

**Key aspects:**

- **Interface definition**: `Entity` interface with `id: String!`
- **Entity implementations**: All entity types extend to implement Entity
- **`@key(fields: "id")`**: Marks types as federation entities
- **`@external`**: Declares fields owned by other subgraphs
- **Mirror resolver**: Returns `{ __typename, id }` - federation does the rest

#### 2. Connector Subgraphs with Entity Support

Connector subgraphs define entity types with `@key` directives:

**Conferences subgraph** (`connector/conferences.graphqls`):

```graphql
type SchedSession
  @key(fields: "id")
  @connect(
    source: "conf"
    http: { GET: "sessions", queryParams: "id: $batch.id" }
    selection: """
    id
    name
    description
    start_time
    # ... more fields
    """
  ) {
  id: String!
  name: String!
  description: String!
  # ...
}

type SchedSpeaker
  @key(fields: "id")
  @connect(
    source: "conf"
    http: { GET: "speakers", queryParams: "id: $batch.id" }
    selection: """
    id
    name
    company
    # ... more fields
    """
  ) {
  id: String!
  name: String!
  company: String!
  # ...
}
```

**Places subgraph** (`connector/places.graphqls`):

```graphql
type Query {
  place(id: String!): Place
    @connect(
      source: "places"
      http: { GET: "places/{$args.id}" }
      selection: """
      ${
        id
        displayName { text }
        location { latitude longitude }
        # ... more fields
      }
      """
      entity: true  # Marks this as an entity resolver
    )
}

type Place @key(fields: "id") {
  id: String!
  displayName: LocalizedText!
  location: LatLng!
  # ...
}
```

**Key aspects:**

- **`@key(fields: "id")`**: Enables federation entity resolution
- **Batch resolution**: `$batch.id` allows batching entity requests
- **`entity: true`**: On query fields, marks as entity resolver
- **Connector resolution**: Federation calls these automatically when resolving entities

#### 3. Workaround: Noop Endpoints

In some cases, it might also be useful to create a `event` top-level query field instead of going through `entities` - those will do a network request to a `noop` endpoint, but ignore the result and just return the mirrored identifier for federation to resolve.

```graphql
type Query {
  event(id: String!): SchedEvent
    @connect(source: "base", http: { GET: "noop" }, selection: "id: $args.id")

  session(id: String!): SchedSession
    @connect(source: "base", http: { GET: "noop" }, selection: "id: $args.id")

  speaker(id: String!): SchedSpeaker
    @connect(source: "base", http: { GET: "noop" }, selection: "id: $args.id")
}
```

#### 4. MCP Operation

The entities query is exposed to the AI agent as an MCP tool:

```graphql
# connector/operations/getEntities.graphql
# Retrieves details for a list of entities, identified by their IDs and typenames.
query GetEntities($identifiers: [EntityIdentifier!]!) {
  entities(identifiers: $identifiers) {
    ... on SchedEvent {
      __typename
      id
      name
      year
      start_date
      end_date
      city
    }

    ... on SchedSession {
      __typename
      id
      name
      start_time_ts
    }

    ... on SchedSpeaker {
      __typename
      id
      name
      company
    }

    ... on SchedVenue {
      __typename
      id
      venueName: name
    }

    ... on Place {
      __typename
      id
      displayName { text }
      location { latitude longitude }
      primaryTypeDisplayName { text }
    }
  }
}
```

**Key aspects:**

- Uses inline fragments for each entity type
- Selects appropriate fields for each type
- AI agent can call this to fetch any entity by ID
- Cache Integration pattern writes results to Apollo cache

### Usage Example: Bookmarks Screen

The BookmarksScreen demonstrates the full pattern with the `@export` directive, using local state as a variable passed to the GraphQL server:

```tsx
// expo/src/screens/Bookmarks/BookmarksScreen.tsx
import { gql } from "@apollo/client";

if (false) {
  gql`
    query BookmarksScreenQuery($identifiers: [EntityIdentifier!]!) {
      # Fetch bookmarks from LocalState and export to variable
      bookmarks @client @export(as: "identifiers") {
        id
        typename
      }

      # Use exported variable to fetch full entity data
      entities(identifiers: $identifiers) {
        id
        ... on SchedSession {
          ...ScheduleListItem_session
        }
        ... on SchedSpeaker {
          ...SpeakerListItem_speaker
        }
        ... on Place {
          ...PlaceListItem_place
        }
      }
    }
  `;
}

export function BookmarksScreen({ queryRef }) {
  const { data } = useReadQuery(queryRef);

  return (
    <ScrollView>
      {data.entities.map((entity) => {
        if (entity.__typename === "SchedSession") {
          return <ScheduleListItem key={entity.id} session={entity} />;
        }
        if (entity.__typename === "SchedSpeaker") {
          return <SpeakerListItem key={entity.id} speaker={entity} />;
        }
        if (entity.__typename === "Place") {
          return <PlaceListItem key={entity.id} place={entity} />;
        }
        return null;
      })}
    </ScrollView>
  );
}
```

**Query execution flow:**

1. **LocalState resolution**: `bookmarks @client` fetches from AsyncStorage
2. **`@export` directive**: Apollo exports bookmarks as `$identifiers` variable
3. **Entities query**: Uses `$identifiers` to fetch full data
4. **Federation routing**: Router sends requests to appropriate subgraphs
5. **Entity resolution**: Each subgraph resolves its entities via `@key`
6. **UI rendering**: Component renders mixed list with type-specific components

### Complete Flow Example

**User bookmarks**: Session "session_123", Speaker "speaker_456", Place "place_789"

1. **Query execution**:
   ```graphql
   query {
     bookmarks @client @export(as: "identifiers") {
       id
       typename
     }
     entities(identifiers: $identifiers) {
       ... on SchedSession { name }
       ... on SchedSpeaker { name }
       ... on Place { displayName { text } }
     }
   }
   ```

2. **LocalState resolves bookmarks**:
   ```json
   {
     "bookmarks": [
       { "id": "session_123", "typename": "SchedSession" },
       { "id": "speaker_456", "typename": "SchedSpeaker" },
       { "id": "place_789", "typename": "Place" }
     ]
   }
   ```

3. **Apollo exports to variable**:
   ```json
   $identifiers = [
     { "typename": "SchedSession", "id": "session_123" },
     { "typename": "SchedSpeaker", "id": "speaker_456" },
     { "typename": "Place", "id": "place_789" }
   ]
   ```

4. **Entities subgraph mirrors**:
   ```json
   [
     { "__typename": "SchedSession", "id": "session_123" },
     { "__typename": "SchedSpeaker", "id": "speaker_456" },
     { "__typename": "Place", "id": "place_789" }
   ]
   ```

5. **Federation resolves entities**:
   - Router sees `SchedSession` needs "name" → routes to conferences subgraph
   - Router sees `SchedSpeaker` needs "name" → routes to conferences subgraph
   - Router sees `Place` needs "displayName" → routes to places subgraph

6. **Connector subgraphs fetch**:
   - Conferences: Batches `GET /sessions?id=session_123&id=speaker_456` (via `$batch.id`)
   - Places: Calls `GET /places/place_789`

7. **Final result**:
   ```json
   {
     "entities": [
       { "__typename": "SchedSession", "id": "session_123", "name": "GraphQL Best Practices" },
       { "__typename": "SchedSpeaker", "id": "speaker_456", "name": "Jane Doe" },
       { "__typename": "Place", "id": "place_789", "displayName": { "text": "Coffee Shop" } }
     ]
   }
   ```

### Benefits

1. **Unified interface**: Single query for mixed entity types
2. **Federation routing**: Automatic routing to correct subgraphs
3. **Batching**: Connectors batch entity requests efficiently
4. **Type safety**: TypeScript types for each entity type
5. **AI integration**: Agent can fetch any entity by ID
6. **Bookmarks support**: Perfect for heterogeneous bookmark lists
7. **Cache efficiency**: Normalized cache works across queries

### Adding New Entity Types

To add a new entity type to the pattern:

#### 1. Add to Entities Subgraph

```tsx
// expo/src/app/api/graphql+api.ts
const typeDefs = gql`
  # ... existing schema

  extend type MyNewEntity implements Entity @key(fields: "id") {
    id: String! @external
  }
`;
```

#### 2. Define in Connector Subgraph

```graphql
# connector/mySubgraph.graphqls
type MyNewEntity
  @key(fields: "id")
  @connect(
    source: "mySource"
    http: { GET: "myentities", queryParams: "id: $batch.id" }
    selection: """
    id
    name
    description
    """
  ) {
  id: String!
  name: String!
  description: String!
}
```

#### 3. Add to GetEntities Operation

```graphql
# connector/operations/getEntities.graphql
query GetEntities($identifiers: [EntityIdentifier!]!) {
  entities(identifiers: $identifiers) {
    # ... existing fragments

    ... on MyNewEntity {
      __typename
      id
      name
      description
    }
  }
}
```

#### 4. Create List Item Component

```tsx
// expo/src/components/ListItems/MyNewEntityListItem.tsx
export function MyNewEntityListItem({ MyNewEntity }) {
  const { data } = useSuspenseFragment({
    fragment: MyNewEntityListItem.fragments.MyNewEntity,
    from: MyNewEntity,
  });

  return <View><Text>{data.name}</Text></View>;
}
```

#### 5. Update Usage Points

Add rendering logic in screens that display entities:

```tsx
if (entity.__typename === "MyNewEntity") {
  return <MyNewEntityListItem key={entity.id} MyNewEntity={entity} />;
}
```

### Caveats and Considerations

#### Connector Limitations

- Connectors **must** make network requests (can't skip API calls)
- The `noop` endpoint workaround adds an extra round trip

#### Schema Coordination

- Entity subgraph must be updated when new types are added
- Keep `GetEntities` operation in sync with available types
- Document which types implement the Entity interface

#### Alternative: Direct Query Fields

For single-type lookups, direct field queries can used where available:
```graphql
query {
  session(id: "123") { name }
}
```

Use `entities` when:
- Fetching mixed types (bookmarks, search results)
- Fetching more than one entity, without a known "parent" element that can be queried
- Need to batch diverse entity requests

### Further Reading

- Apollo Federation Entity Resolution: https://apollographql.com/docs/federation/entities/
- Relay Node Interface: https://relay.dev/graphql/objectidentification.htm
- Apollo Connectors Entity Support: https://apollographql.com/docs/graphos/schema-design/connectors/
- Apollo `@export` Directive: https://apollographql.com/docs/apollo-server/schema/directives/#export
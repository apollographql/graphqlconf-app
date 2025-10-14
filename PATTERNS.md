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
import { ScheduleListItem_SchedSessionFragmentDoc } from "./ScheduleListItem.generated";

// Fragment definition in if(false) block - this fragment is used by codegen to create `ScheduleListItem_SchedSessionFragmentDoc` in the colocated generated file
// Will be stripped at runtime
if (false) {
  gql`
    fragment ScheduleListItem_SchedSession on SchedSession {
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
  SchedSession: ScheduleListItem_SchedSessionFragmentDoc,
} as const;

// Register fragment with Apollo Client
fragmentRegistry.register(ScheduleListItem.fragments.SchedSession);

// Component implementation
export function ScheduleListItem({
  SchedSession,
}: {
  SchedSession:
    | FragmentType<typeof ScheduleListItem.fragments.SchedSession>
    | FromParent<typeof ScheduleListItem.fragments.SchedSession>;
}) {
  const { data } = useSuspenseFragment({
    fragment: ScheduleListItem.fragments.SchedSession,
    fragmentName: "ScheduleListItem_SchedSession",
    from: SchedSession,
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
export type ScheduleListItem_SchedSessionFragment = {
  __typename: 'SchedSession';
  id: string;
  name: string;
  isBookmarked: boolean;
  venue: { __typename: 'SchedVenue'; id: string; name: string | null } | null;
  start_time: string;
  end_time: string;
} & { ' $fragmentName'?: 'ScheduleListItem_SchedSessionFragment' };

export const ScheduleListItem_SchedSessionFragmentDoc = {
  // ... DocumentNode definition
}: TypedDocumentNode<
  ScheduleListItem_SchedSessionFragment,
  ScheduleListItem_SchedSessionFragmentVariables
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
          ...ScheduleListItem_SchedSession  # Spread child fragment
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
      renderItem={({ item }) => <ScheduleListItem SchedSession={item} />}
    />
  );
}
```

**Key aspects:**

- **Fragment spreading**: `...ScheduleListItem_SchedSession` includes the child fragment in the parent query or parent fragment
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
{ComponentName}_{TypeName}
```

Examples:
- `ScheduleListItem_SchedSession`
- `SpeakerListItem_SchedSpeaker`
- `PlaceListItem_Place`
- `BookmarksScreen_Query`

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

### Two Embed Approaches

#### Approach 1: Fragment Identifier Embeds

**Use case**: Display entities assumed to be already in the cache from previous queries.

**Example**: `ScheduleListItem`, `SpeakerListItem`, `PlaceListItem`

```tsx
// expo/src/agent/clientTools/embeds/fragments.ts
/** A function returning a JSON Schema describing the necessary identifier object (id and __typename) for the first fragment in a DocumentNode */
declare function fragmentIdentifier(fragmentDoc: DocumentNode): JSONSchema7Definition

export const availableFragmentComponents = {
  ScheduleListItem: expose(ScheduleListItem, {
    description: `Display a schedule item, e.g. a conference talk`,
    props: {
      SchedSession: fragmentIdentifier(ScheduleListItem.fragments.SchedSession),
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
    "SchedSession": {
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
  "SchedSession": {
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
5. If data missing: Returns error, AI falls back to text response

**Key characteristics**:
- **Minimal payload**: Only `__typename` and `id` sent to tool
- **Assumes data exists**: Relies on previous queries populating the cache
- **Fast**: No data writing, direct cache read
- **Error handling**: Returns error if data not found, prompting AI to use text fallback

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
      Places: {
        type: "array",
        items: fullFragmentData(PlacesMap.fragments.Places),
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
    "Places": {
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
  "Places": [
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

#### Use Fragment Identifier Embeds When:
- Displaying results from a previous query (e.g., search results, bookmarks)
- The AI fetched data using an MCP tool that populated the cache
- You want minimal tool payload size
- Cache state is predictable

#### Use Full Fragment Data Embeds When:
- Displaying data from external APIs (e.g., Google Maps places)
- Cache state is uncertain or the data wasn't fetched via GraphQL
- The AI needs to transform or aggregate data before display
- You want self-contained tool calls that don't depend on cache state

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
      MyEntity: fragmentIdentifier(MyNewListItem.fragments.MyEntity),  // Approach 1
      // OR
      MyEntity: fullFragmentData(MyNewListItem.fragments.MyEntity),    // Approach 2
    },
  }),
};
```

3. **Write clear tool descriptions** - The AI uses these to decide when to call the tool

4. **Test cache behavior**:
   - For identifier embeds: Ensure previous queries populate the cache
   - For full data embeds: Verify schema validation and cache writes

5. **Run code generation** to update types:
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
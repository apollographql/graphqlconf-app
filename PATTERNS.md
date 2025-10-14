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
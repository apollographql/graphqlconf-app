# Task 4: Local Mutations (Bookmarks)

**Goal**: Expose bookmark operations as client-side actions for the AI agent.

**Status**: 🔴 Not Started

**Dependencies**: Task 1 (Basic Chat Integration)

**Estimated Effort**: 2-3 hours

---

## 📋 Overview

This task creates client-side actions for bookmark management, allowing the agent to retrieve and modify bookmarked items. This is a simpler task that validates the client-side action pattern before tackling more complex features.

---

## 🎯 Success Criteria

- ✅ Agent can retrieve all bookmarked items
- ✅ Agent can filter bookmarks by typename
- ✅ Agent can add bookmarks to sessions, speakers, places
- ✅ Agent can remove bookmarks
- ✅ Bookmark state persists in local storage
- ✅ Apollo cache updates reflect bookmark changes
- ✅ Multiple bookmarks can be toggled in one operation

---

## 📁 Files to Create/Modify

### New Files

- `expo/src/agent/copilotkit/BookmarksActions.tsx` - Client-side bookmark actions

### Modified Files

- [`expo/src/agent/copilotkit/Omnibar.tsx`](../Omnibar.tsx) - Register bookmark actions

---

## 🏗️ Implementation Steps

### Step 1: Understand Existing Bookmark Infrastructure

**Bookmark Storage** ([`expo/src/utils/bookmarksStorage.ts`](../../../utils/bookmarksStorage.ts)):

- Stores bookmarks in AsyncStorage
- Format: `{ typename: string, id: string }[]`
- Functions: `getBookmarks()`, `addBookmark()`, `removeBookmark()`

**Bookmark Mutation** ([`expo/src/mutations/ToggleBookmark.ts`](../../../mutations/ToggleBookmark.ts)):

- GraphQL local mutation: `toggleBookmark`
- Updates Apollo cache with `@client` directive
- Accepts: `id`, `typename`, `isBookmarked` (optional)

**Bookmark Schemas** ([`expo/src/agent/clientTools/bookmarks.ts`](../../clientTools/bookmarks.ts)):

- `getBookmarks`: Optional typename filter
- `toggleBookmarks`: Array of items with optional target state

---

### Step 2: Create Bookmark Actions

**File**: `expo/src/agent/copilotkit/BookmarksActions.tsx` (new file)

```typescript
import { useCopilotAction } from "@copilotkit/react-core";
import { useApolloClient } from "@apollo/client";
import { getBookmarks } from "@/utils/bookmarksStorage";
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";
import { z } from "zod";

export function useBookmarksActions() {
  const client = useApolloClient();

  // Action: Get Bookmarks
  useCopilotAction({
    name: "getBookmarks",
    description:
      "Get all bookmarked items (sessions, speakers, places, etc). Returns an array of objects with __typename and id fields that can be used with GetEntities to fetch more details.",
    parameters: z.object({
      typename: z
        .string()
        .optional()
        .describe(
          "Optional filter to only return bookmarks of a specific typename (e.g., 'SchedSession', 'SchedSpeaker', 'Place')"
        ),
    }),
    handler: async ({ typename }) => {
      const bookmarks = await getBookmarks();
      const filtered = typename
        ? bookmarks.filter((bookmark) => bookmark.typename === typename)
        : bookmarks;

      return {
        bookmarks: filtered.map((bookmark) => ({
          __typename: bookmark.typename,
          id: bookmark.id,
        })),
        count: filtered.length,
      };
    },
  });

  // Action: Toggle Bookmarks
  useCopilotAction({
    name: "toggleBookmarks",
    description:
      "Toggle bookmark status for one or more items. Can bookmark, unbookmark, or toggle items. The bookmarked state persists across app sessions.",
    parameters: z.object({
      items: z
        .array(
          z.object({
            typename: z
              .string()
              .describe(
                "The __typename of the entity (e.g., 'SchedSession', 'SchedSpeaker', 'Place')"
              ),
            id: z.string().describe("The id of the entity"),
            bookmarked: z
              .boolean()
              .optional()
              .describe(
                "If a specific target state is desired, set this to true (to bookmark) or false (to unbookmark). Otherwise this operation will just toggle, which might not end up in the desired state."
              ),
          })
        )
        .describe("Array of items to bookmark/unbookmark"),
    }),
    handler: async ({ items }) => {
      if (!Array.isArray(items)) {
        return {
          error: "items must be an array",
          success: false,
        };
      }

      const results = await Promise.all(
        items.map(async (item) => {
          console.log("Toggling bookmark:", item);
          const { data } = await client.mutate({
            mutation: ToggleBookmarkDocument,
            variables: {
              id: item.id,
              typename: item.typename,
              isBookmarked: item.bookmarked,
            },
          });
          console.log("Bookmark result:", data);
          return data?.toggleBookmark;
        })
      );

      return {
        results,
        success: true,
      };
    },
  });
}
```

**Reference**: Compare with Vercel SDK's bookmark tools:

- [`expo/src/agent/vercelSdk/Omnibar/GetBookmarksTool.tsx`](../../vercelSdk/Omnibar/GetBookmarksTool.tsx)
- [`expo/src/agent/vercelSdk/Omnibar/ToggleBookmarksTool.tsx`](../../vercelSdk/Omnibar/ToggleBookmarksTool.tsx)

---

### Step 3: Register Bookmark Actions in Omnibar

**File**: [`expo/src/agent/copilotkit/Omnibar.tsx`](../Omnibar.tsx)

**Add in `OmnibarContent` component**:

```typescript
import { useBookmarksActions } from "./BookmarksActions";

function OmnibarContent({ children }: { children: React.ReactNode }) {
  // ... existing code ...

  // Register bookmark actions
  useBookmarksActions();

  // ... rest of component ...
}
```

---

### Step 4: Update System Prompt (Optional)

**File**: [`expo/src/agent/prompt.ts`](../../prompt.ts)

**Add mention of bookmark capabilities**:

```typescript
export const prompt = `
You are an agent for a conference schedule app.
// ... existing prompt ...

You have access to bookmark management:
- Use "getBookmarks" to retrieve items the user has bookmarked
- Use "toggleBookmarks" to add or remove bookmarks for sessions, speakers, or places
- Bookmarks persist across app sessions

// ... rest of prompt ...
`.trim();
```

---

## 🧪 Testing Steps

### 1. Start Dev Server

```bash
cd expo
npm start
```

### 2. Test Get Bookmarks

**Test 1: Get All Bookmarks (Empty)**

```
User: "What have I bookmarked?"
Expected:
- Agent calls getBookmarks action
- Returns empty array (if no bookmarks)
- Agent responds: "You haven't bookmarked anything yet"
```

**Test 2: Add Bookmark First (Manual)**

- Manually bookmark a session in app
- Ask again: "What have I bookmarked?"
- Expected: Returns bookmarked session

### 3. Test Toggle Bookmarks

**Test 1: Bookmark a Session**

```
User: "Bookmark the GraphQL Federation talk"
Expected:
- Agent queries sessions to find ID
- Agent calls toggleBookmarks with session ID
- Agent confirms: "I've bookmarked that session for you"
- Verify bookmark icon shows in app
```

**Test 2: Unbookmark**

```
User: "Remove that bookmark"
Expected:
- Agent calls getBookmarks to find recent bookmark
- Agent calls toggleBookmarks with bookmarked: false
- Bookmark removed
```

**Test 3: Bookmark Multiple Items**

```
User: "Bookmark all talks by John Doe"
Expected:
- Agent queries speaker sessions
- Agent calls toggleBookmarks with multiple items
- All sessions bookmarked
```

### 4. Test Filtering

**Test 1: Filter by Type**

```
User: "Show me my bookmarked sessions"
Expected:
- Agent calls getBookmarks with typename: "SchedSession"
- Only session bookmarks returned
```

### 5. Verify Persistence

1. Bookmark several items via agent
2. Close and reopen app
3. Ask: "What are my bookmarks?"
4. Expected: All bookmarks still present

### 6. Verify Apollo Cache Updates

**Open React DevTools → Apollo Client DevTools**:

1. Check cache before bookmark
2. Toggle bookmark via agent
3. Verify cache updated (isBookmarked field changed)
4. Navigate to bookmarks tab in app
5. Verify UI reflects change

---

## 🔍 Troubleshooting

### Issue: "getBookmarks returns empty array"

**Causes**:

1. AsyncStorage not initialized
2. Wrong storage key
3. Platform-specific storage issues

**Solutions**:

```typescript
// Debug storage directly
import { getBookmarks } from "@/utils/bookmarksStorage";

const bookmarks = await getBookmarks();
console.log("Bookmarks in storage:", bookmarks);

// Check AsyncStorage directly
import AsyncStorage from "@react-native-async-storage/async-storage";
const raw = await AsyncStorage.getItem("bookmarks");
console.log("Raw storage:", raw);
```

### Issue: "toggleBookmarks mutation fails"

**Causes**:

1. Apollo client not configured for local mutations
2. ToggleBookmarkDocument not found
3. Type policy missing

**Solutions**:

```typescript
// Verify mutation document
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";
console.log("Mutation doc:", ToggleBookmarkDocument);

// Check Apollo client config
// See expo/src/apollo/client.ts for local state setup

// Test mutation directly
await client.mutate({
  mutation: ToggleBookmarkDocument,
  variables: {
    id: "test-id",
    typename: "SchedSession",
    isBookmarked: true,
  },
});
```

### Issue: "Bookmark icon doesn't update in UI"

**Cause**: Cache not updating or component not subscribed

**Solutions**:

```typescript
// Check cache update in ToggleBookmark mutation resolver
// See expo/src/apollo/client.ts

// Ensure components use cache.watch or useFragment
// See expo/src/components/BookmarkIcon.tsx
```

### Issue: "Multiple bookmarks fail partway through"

**Cause**: One mutation failing stops Promise.all

**Solution**: Use Promise.allSettled for better error handling:

```typescript
const results = await Promise.allSettled(
  items.map(async (item) => {
    return await client.mutate({
      mutation: ToggleBookmarkDocument,
      variables: item,
    });
  })
);

const successful = results.filter((r) => r.status === "fulfilled");
const failed = results.filter((r) => r.status === "rejected");

return {
  success: failed.length === 0,
  successful: successful.length,
  failed: failed.length,
  results,
};
```

---

## 📚 Reference Links

### CopilotKit Documentation

- [useCopilotAction Hook](https://docs.copilotkit.ai/reference/hooks/useCopilotAction)
- [Client-Side Actions](https://docs.copilotkit.ai/guides/client-actions)

### Vercel SDK Comparison

- [`expo/src/agent/clientTools/bookmarks.ts`](../../clientTools/bookmarks.ts) - Original schemas
- [`expo/src/agent/vercelSdk/Omnibar/GetBookmarksTool.tsx`](../../vercelSdk/Omnibar/GetBookmarksTool.tsx) - getBookmarks handler
- [`expo/src/agent/vercelSdk/Omnibar/ToggleBookmarksTool.tsx`](../../vercelSdk/Omnibar/ToggleBookmarksTool.tsx) - toggleBookmarks handler

### Project Infrastructure

- [`expo/src/utils/bookmarksStorage.ts`](../../../utils/bookmarksStorage.ts) - Storage utilities
- [`expo/src/mutations/ToggleBookmark.ts`](../../../mutations/ToggleBookmark.ts) - Apollo mutation
- [`expo/src/apollo/client.ts`](../../../apollo/client.ts) - Local state configuration

---

## ✅ Completion Checklist

- [ ] `BookmarksActions.tsx` created with both actions
- [ ] `useBookmarksActions()` called in `Omnibar.tsx`
- [ ] System prompt updated (optional)
- [ ] Manual testing completed:
  - [ ] Get empty bookmarks
  - [ ] Add bookmark via agent
  - [ ] Get bookmarks returns added item
  - [ ] Remove bookmark via agent
  - [ ] Bookmark multiple items
  - [ ] Filter by typename
- [ ] Persistence verified (bookmarks survive app reload)
- [ ] Apollo cache updates verified
- [ ] UI reflects bookmark changes
- [ ] No console errors
- [ ] Error handling tested (invalid IDs, network failures)

---

## 🚀 Next Steps

Once Task 4 is complete, proceed to:

- **Task 2**: Supergraph MCP Integration - If not already done
- **Task 5**: Route Navigation & Chat Control

---

**Last Updated**: 2025-10-21

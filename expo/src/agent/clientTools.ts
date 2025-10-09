import { tool } from "ai";
import { z } from "zod/v4";

export const clientTools = {
  getFavorites: tool({
    description:
      "Get all favorited items (sessions, speakers, places, etc). Returns an array of objects with __typename and id fields that can be used with GetEntities to fetch more details.",
    inputSchema: z.object({
      typename: z
        .string()
        .optional()
        .describe(
          "Optional filter to only return favorites of a specific typename (e.g., 'SchedSession', 'SchedSpeaker', 'Place')"
        ),
    }),
  }),
  toggleBookmarks: tool({
    description:
      "Toggle bookmark/favorite status for one or more items. Can bookmark, unbookmark, or toggle items. The bookmarked state persists across app sessions.",
    inputSchema: z.object({
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
  }),
};

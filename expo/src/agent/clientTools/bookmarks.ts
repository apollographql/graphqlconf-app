import { validatingJSONSchema } from "@/utils/validatingJSONSchema";
import { tool } from "ai";

export const clientTools = {
  getBookmarks: tool({
    description:
      "Get all bookmarked items (sessions, speakers, places, etc). Returns an array of objects with __typename and id fields that can be used with GetEntities to fetch more details.",
    inputSchema: validatingJSONSchema({
      type: "object",
      properties: {
        typename: {
          type: "string",
          description:
            "Optional filter to only return bookmarks of a specific typename (e.g., 'SchedSession', 'SchedSpeaker', 'Place')",
        },
      },
      additionalProperties: false,
    }),
  }),
  toggleBookmarks: tool({
    description:
      "Toggle bookmark status for one or more items. Can bookmark, unbookmark, or toggle items. The bookmarked state persists across app sessions.",
    inputSchema: validatingJSONSchema({
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
                description:
                  "The __typename of the entity (e.g., 'SchedSession', 'SchedSpeaker', 'Place')",
              },
              id: {
                type: "string",
                description: "The id of the entity",
              },
              bookmarked: {
                type: "boolean",
                description:
                  "If a specific target state is desired, set this to true (to bookmark) or false (to unbookmark). Otherwise this operation will just toggle, which might not end up in the desired state.",
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

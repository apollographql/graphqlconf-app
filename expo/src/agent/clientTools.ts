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
};

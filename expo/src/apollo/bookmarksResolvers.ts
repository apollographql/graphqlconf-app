import type { LocalState } from "@apollo/client/local-state";
import {
  getBookmarks,
  toggleBookmark,
  isBookmarked,
} from "@/utils/bookmarksStorage";

export const bookmarksResolvers = {
  Query: {
    bookmarks: async (_root: unknown, args: { typename?: string }) => {
      const allBookmarks = await getBookmarks();
      if (args.typename) {
        return allBookmarks.filter(
          (bookmark) => bookmark.typename === args.typename
        );
      }
      return allBookmarks;
    },
  },

  Mutation: {
    toggleBookmark: async (
      _root: unknown,
      args: { id: string; typename: string; isBookmarked?: boolean },
      { client }
    ) => {
      const newState = await toggleBookmark(
        args.id,
        args.typename,
        args.isBookmarked
      );
      client.cache.evict({ fieldName: "bookmarks" });
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

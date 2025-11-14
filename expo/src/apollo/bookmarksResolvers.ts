import {
  getBookmarks,
  toggleBookmark,
  isBookmarked,
} from "@/utils/bookmarksStorage";
import { Resolvers } from "./localResolvers.generated.types";
import { DeepPartial } from "@apollo/client/utilities";

export const bookmarksResolvers: DeepPartial<Resolvers> = {
  Query: {
    bookmarks: async (_root: unknown, args) => {
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
    toggleBookmark: async (_root: unknown, args, { client }) => {
      const newState = await toggleBookmark(
        args.id,
        args.typename,
        args.isBookmarked ?? undefined
      );
      client.cache.evict({ fieldName: "bookmarks" });
      return {
        __typename: args.typename as any,
        id: args.id,
        isBookmarked: newState,
      };
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
};

import type { LocalState } from "@apollo/client/local-state";
import { getFavorites, toggleFavorite, isFavorite } from "@/utils/favoritesStorage";

export const favoritesResolvers = {
  Query: {
    favorites: async (_root: unknown, args: { typename?: string }) => {
      const allFavorites = await getFavorites();
      if (args.typename) {
        return allFavorites.filter((fav) => fav.typename === args.typename);
      }
      return allFavorites;
    },
  },

  Mutation: {
    toggleFavorite: async (
      _root: unknown,
      args: { id: string; typename: string; isFavorite?: boolean }
    ) => {
      const newState = await toggleFavorite(
        args.id,
        args.typename,
        args.isFavorite
      );
      return { __typename: args.typename, id: args.id, isFavorite: newState };
    },
  },

  SchedSession: {
    isFavorite,
  },

  SchedSpeaker: {
    isFavorite,
  },

  Place: {
    isFavorite,
  },
} satisfies LocalState.Resolvers;

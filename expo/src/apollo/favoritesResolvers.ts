import type { LocalState } from "@apollo/client/local-state";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  isFavorite,
} from "@/utils/favoritesStorage";

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
    addFavorite: async (
      _root: unknown,
      args: { id: string; typename: string }
    ) => {
      await addFavorite(args.id, args.typename);
      return { __typename: args.typename, id: args.id, isFavorite: true };
    },

    removeFavorite: async (
      _root: unknown,
      args: { id: string; typename: string }
    ) => {
      await removeFavorite(args.id, args.typename);
      return { __typename: args.typename, id: args.id, isFavorite: false };
    },

    toggleFavorite: async (
      _root: unknown,
      args: { id: string; typename: string }
    ) => {
      const newState = await toggleFavorite(args.id, args.typename);
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

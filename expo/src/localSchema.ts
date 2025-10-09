import { gql } from "@apollo/client";

// eslint-disable-next-line no-unused-expressions
gql`
  directive @unmask(mode: String) on FRAGMENT_SPREAD | INLINE_FRAGMENT
  # for some reason src/language-server/project/defaultClientSchema.ts doesn't seem to be included?
  directive @client(
    """
    When true, the client will never use the cache for this value. See
    https://www.apollographql.com/docs/react/local-state/local-resolvers/#forcing-resolvers-with-clientalways-true
    """
    always: Boolean
  ) on FIELD | FRAGMENT_DEFINITION | INLINE_FRAGMENT

  interface FavoriteEntity {
    id: String!
    isFavorite: Boolean!
  }

  type Favorite {
    id: String!
    typename: String!
    timestamp: String!
  }

  extend type SchedSession implements FavoriteEntity {
    isFavorite: Boolean!
  }

  extend type SchedSpeaker implements FavoriteEntity {
    isFavorite: Boolean!
  }

  extend type Place implements FavoriteEntity {
    isFavorite: Boolean!
  }

  extend type Query {
    favorites(typename: String): [Favorite!]!
  }

  type Mutation {
    addFavorite(id: String!, typename: String!): FavoriteEntity!
    removeFavorite(id: String!, typename: String!): FavoriteEntity!
    toggleFavorite(id: String!, typename: String!): FavoriteEntity!
  }
`;

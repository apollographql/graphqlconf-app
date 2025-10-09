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

  interface BookmarkEntity {
    id: String!
    isBookmarked: Boolean!
  }

  type Bookmark {
    id: String!
    typename: String!
    timestamp: String!
  }

  extend type SchedSession implements BookmarkEntity {
    isBookmarked: Boolean!
  }

  extend type SchedSpeaker implements BookmarkEntity {
    isBookmarked: Boolean!
  }

  extend type Place implements BookmarkEntity {
    isBookmarked: Boolean!
  }

  extend type Query {
    bookmarks(typename: String): [Bookmark!]!
  }

  type Mutation {
    toggleBookmark(
      id: String!
      typename: String!
      isBookmarked: Boolean
    ): BookmarkEntity!
  }
`;

import { gql } from "@apollo/client";
export * from "./ToggleBookmark.generated";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    mutation ToggleBookmark(
      $id: String!
      $typename: String!
      $isBookmarked: Boolean
    ) {
      toggleBookmark(id: $id, typename: $typename, isBookmarked: $isBookmarked)
        @client {
        __typename
        id
        isBookmarked
      }
    }
  `;
}

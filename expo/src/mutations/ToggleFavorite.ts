import { gql } from "@apollo/client";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    mutation ToggleFavorite($id: String!, $typename: String!) {
      toggleFavorite(id: $id, typename: $typename) @client {
        __typename
        id
        isFavorite
      }
    }
  `;
}
export { ToggleFavoriteDocument } from "./ToggleFavorite.generated";

import { gql } from "@apollo/client";
import { QueryRef } from "@apollo/client/react";
import { HomeScreenDocument } from "./HomeScreen.generated";
import { HomeScreenContent } from "./components/HomeScreenContent";
import { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query HomeScreen($eventId: String!) {
      ...HomeScreenContent_Query
    }
  `;
}

HomeScreen.Query = HomeScreenDocument;

export function HomeScreen({
  queryRef,
  variables,
}: {
  queryRef: QueryRef<
    ResultOf<typeof HomeScreen.Query>,
    VariablesOf<typeof HomeScreen.Query>
  >;
  variables: VariablesOf<typeof HomeScreen.Query>;
}) {
  return (
    <HomeScreenContent
      parent={"ROOT_QUERY" as any}
      queryRef={queryRef}
      variables={variables}
    />
  );
}

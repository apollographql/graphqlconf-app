import { gql } from "@apollo/client";
import {
  QueryRef,
  useQueryRefHandlers,
  useReadQuery,
} from "@apollo/client/react";
import { HomeScreenDocument } from "./HomeScreen.generated";
import { HomeScreenContent } from "./components/HomeScreenContent";
import { VariablesOf } from "@graphql-typed-document-node/core";
import { ThemedText } from "@/components/ThemedText";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query HomeScreen($eventId: String!) {
      event(id: $eventId) {
        id
        ...HomeScreenContent_event
      }
    }
  `;
}

HomeScreen.Query = HomeScreenDocument;

export function HomeScreen({
  queryRef,
  variables,
}: {
  queryRef: QueryRef.ForQuery<typeof HomeScreen.Query>;
  variables: VariablesOf<typeof HomeScreen.Query>;
}) {
  const { refetch } = useQueryRefHandlers(queryRef);
  const { data } = useReadQuery(queryRef);

  if (!data.event) {
    return <ThemedText>No event found.</ThemedText>;
  }
  return (
    <HomeScreenContent
      event={data.event}
      refetch={refetch}
      variables={variables}
    />
  );
}

import { gql } from "@apollo/client";
import {
  QueryRef,
  useQueryRefHandlers,
  useReadQuery,
} from "@apollo/client/react";
import { ScheduleScreenDocument } from "./ScheduleScreen.generated";
import { ScheduleList } from "./components/ScheduleList";
import { VariablesOf } from "@graphql-typed-document-node/core";
import { ThemedText } from "@/components/ThemedText";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query ScheduleScreen($eventId: String!) {
      event(id: $eventId) {
        id
        ...ScheduleList_event
      }
    }
  `;
}

ScheduleScreen.Query = ScheduleScreenDocument;

export function ScheduleScreen({
  queryRef,
  variables,
}: {
  queryRef: QueryRef.ForQuery<typeof ScheduleScreen.Query>;
  variables: VariablesOf<typeof ScheduleScreen.Query>;
}) {
  const { refetch } = useQueryRefHandlers(queryRef);
  const { data } = useReadQuery(queryRef);

  if (!data.event) {
    return <ThemedText>No event found.</ThemedText>;
  }
  return (
    <ScheduleList event={data.event} refetch={refetch} variables={variables} />
  );
}

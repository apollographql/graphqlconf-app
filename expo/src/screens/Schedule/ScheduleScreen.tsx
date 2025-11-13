import { gql } from "@apollo/client";
import {
  QueryRef,
  useQueryRefHandlers,
  useReadQuery,
} from "@apollo/client/react";
import { ScheduleScreenDocument } from "./ScheduleScreen.generated";
import { ScheduleList } from "./components/ScheduleList";
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
}: {
  queryRef: QueryRef.ForQuery<typeof ScheduleScreen.Query>;
}) {
  const { data } = useReadQuery(queryRef);
  const { refetch } = useQueryRefHandlers(queryRef);
  if (!data.event) {
    return <ThemedText>No event found.</ThemedText>;
  }
  return <ScheduleList event={data.event} refetch={refetch} />;
}

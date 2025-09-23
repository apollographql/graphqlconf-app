import { gql, TypedDocumentNode } from "@apollo/client";
import { ThemedText } from "../themed-text";
import { first } from "rxjs";

export interface SectionHeaderFragment_SchedEvent {
  start_time: string | null;
  start_weekday: string | null;
}

const SchedEvent: TypedDocumentNode<SectionHeaderFragment_SchedEvent> = gql`
  fragment SectionHeader_SchedEvent on SchedEvent {
    start_time
    start_weekday
  }
`;

SectionHeader.fragments = {
  SchedEvent,
} as const;

export function SectionHeader({
  event,
  firstEventOfDay,
}: {
  event: SectionHeaderFragment_SchedEvent;
  firstEventOfDay: boolean;
}) {
  return (
    <>
      {!firstEventOfDay ? null : <ThemedText>{event.start_weekday}</ThemedText>}
      <ThemedText>{event.start_time}</ThemedText>
    </>
  );
}

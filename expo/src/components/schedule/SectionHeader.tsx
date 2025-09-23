import { gql } from "@apollo/client";
import { ResultOf } from "@graphql-typed-document-node/core";
import { ThemedText } from "../themed-text";

import { SectionHeader_SchedEventFragmentDoc } from "./SectionHeader.generated";
import { fragmentRegistry } from "@/apollo_client";
if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment SectionHeader_SchedEvent on SchedEvent {
      start_time
      start_weekday
    }
  `;
}
SectionHeader.fragments = {
  SchedEvent: SectionHeader_SchedEventFragmentDoc,
} as const;
fragmentRegistry.register(SectionHeader.fragments.SchedEvent);

export function SectionHeader({
  event,
  firstEventOfDay,
}: {
  event: ResultOf<typeof SectionHeader.fragments.SchedEvent>;
  firstEventOfDay: boolean;
}) {
  return (
    <>
      {!firstEventOfDay ? null : <ThemedText>{event.start_weekday}</ThemedText>}
      <ThemedText>{event.start_time}</ThemedText>
    </>
  );
}

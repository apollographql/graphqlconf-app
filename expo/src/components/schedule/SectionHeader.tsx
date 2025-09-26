import { gql } from "@apollo/client";
import { ResultOf } from "@graphql-typed-document-node/core";
import { ThemedText } from "../themed-text";

import { SectionHeader_SchedEventFragmentDoc } from "./SectionHeader.generated";
import { fragmentRegistry } from "@/apollo_client";
import { useMemo } from "react";
if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment SectionHeader_SchedEvent on SchedSession {
      id
      start_time
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
  const weekday = useMemo(
    () =>
      new Date(event.start_time ?? "").toLocaleDateString(undefined, {
        weekday: "long",
      }),
    [event.start_time]
  );
  return (
    <>
      {!firstEventOfDay ? null : <ThemedText>{weekday}</ThemedText>}
      <ThemedText>{event.start_time}</ThemedText>
    </>
  );
}

import { fragmentRegistry, From } from "@/apollo_client";
import { gql } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import {
  ScheduleListItem_SchedSessionFragmentDoc,
  ScheduleListItem_SchedSessionFragment,
} from "./ScheduleItem.generated";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment ScheduleListItem_SchedSession on SchedSession {
      __typename
      id
      name
      venue {
        id
        name
      }
      event {
        start_time
        end_time
        type
        subtype
      }
      speakers {
        username
        name
      }
    }
  `;
}

ScheduleListItem.fragments = {
  SchedSession: ScheduleListItem_SchedSessionFragmentDoc,
} as const;
fragmentRegistry.register(ScheduleListItem.fragments.SchedSession);

export function ScheduleListItem({
  schedSession,
}: {
  schedSession: From<ScheduleListItem_SchedSessionFragment>;
}) {
  const { data } = useSuspenseFragment({
    fragment: ScheduleListItem.fragments.SchedSession,
    from: schedSession,
  });

  return (
    <ThemedView
      style={{ padding: 5, margin: 10, borderWidth: 1, borderBottomWidth: 1 }}
    >
      <ThemedText>{data.name}</ThemedText>
      {!data.venue ? null : <ThemedText>{data.venue?.name}</ThemedText>}
      <ThemedText>
        {data.event?.start_time} - {data.event?.end_time}
      </ThemedText>
      {!data.speakers ? null : (
        <ThemedText>
          {data.speakers?.map((s) => s.name ?? s.username).join(", ")}
        </ThemedText>
      )}
    </ThemedView>
  );
}

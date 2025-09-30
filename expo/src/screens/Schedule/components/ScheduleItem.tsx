import { fragmentRegistry, FromParent } from "@/apollo_client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ScheduleListItem_SchedSessionFragmentDoc } from "./ScheduleItem.generated";

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
      start_time
      end_time
      type
      subtype
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
  SchedSession,
}: {
  SchedSession:
    | FragmentType<typeof ScheduleListItem.fragments.SchedSession>
    | FromParent<typeof ScheduleListItem.fragments.SchedSession>;
}) {
  const { data } = useSuspenseFragment({
    fragment: ScheduleListItem.fragments.SchedSession,
    fragmentName: "ScheduleListItem_SchedSession",
    from: SchedSession,
  });

  return (
    <ThemedView
      style={{ padding: 5, margin: 10, borderWidth: 1, borderBottomWidth: 1 }}
    >
      <ThemedText>{data.name}</ThemedText>
      {!data.venue ? null : <ThemedText>{data.venue?.name}</ThemedText>}
      <ThemedText>
        {data.start_time} - {data.end_time}
      </ThemedText>
      {!data.speakers ? null : (
        <ThemedText>
          {data.speakers?.map((s) => s.name ?? s.username).join(", ")}
        </ThemedText>
      )}
    </ThemedView>
  );
}

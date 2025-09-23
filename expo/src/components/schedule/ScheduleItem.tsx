import { From } from "@/apollo_client";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

type ScheduleListItemFragment_SchedSession = {
  __typename: "SchedSession";
  id: string;
  name: string | null;
  venue: { id: string; name: string | null } | null;
  event: {
    start_time: string | null;
    end_time: string | null;
    type: string | null;
    subtype: string | null;
  } | null;
  speakers:
    | {
        username: string;
        name: string | null;
      }[]
    | null;
};

const SchedSession: TypedDocumentNode<ScheduleListItemFragment_SchedSession> = gql`
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

ScheduleListItem.fragments = {
  SchedSession,
};

export function ScheduleListItem({
  schedSession,
}: {
  schedSession: From<ScheduleListItemFragment_SchedSession>;
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

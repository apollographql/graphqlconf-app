import { FragmentType, gql } from "@apollo/client";
import {
  QueryRef,
  useQueryRefHandlers,
  useSuspenseFragment,
} from "@apollo/client/react";
import { useMemo, useTransition } from "react";
import { SectionList } from "react-native";
import { ScheduleListItem } from "@/components/ListItems/ScheduleListItem";
import { fragmentRegistry } from "@/apollo/client";
import { SectionHeader } from "./SectionHeader";
import { ThemedText } from "@/components/ThemedText";
import { ScheduleList_EventFragmentDoc } from "./ScheduleList.generated";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment ScheduleList_event on Query {
      event(id: $eventId) {
        id
        sessions {
          id
          start_time_ts
          venue {
            id
          }
          ...ScheduleListItem_session
          ...SectionHeader_event
        }
      }
    }
  `;
}

ScheduleList.fragments = {
  event: ScheduleList_EventFragmentDoc,
} as const;
fragmentRegistry.register(ScheduleList.fragments.event);

export function ScheduleList({
  event,
  queryRef,
  variables,
}: {
  event: FragmentType<typeof ScheduleList.fragments.event>;
  queryRef: QueryRef;
  variables: { eventId: string };
}) {
  const { refetch } = useQueryRefHandlers(queryRef);
  const [refreshing, transition] = useTransition();
  const onRefresh = () => {
    transition(() => {
      refetch();
    });
  };

  const { data } = useSuspenseFragment({
    fragment: ScheduleList.fragments.event,
    fragmentName: "ScheduleList_event",
    from: event,
    variables,
  });
  const sections = useMemo(() => {
    // Flatten sessions from all events (typically just one event per year)
    const sessions = data.event?.sessions || [];
    const grouped = Object.groupBy(sessions, (item) => item.start_time_ts ?? 0);
    let previousDay: undefined | string;
    return Object.entries(grouped)
      .map(([timeslot, items]) => {
        const startTime = items?.[0]?.start_time_ts;
        return {
          firstEvent: items?.[0],
          weekday: startTime
            ? new Date(startTime * 1000).toLocaleDateString(undefined, {
                weekday: "long",
              })
            : "",
          timeslot: Number(timeslot) || 0,
          data: items ?? [],
        };
      })
      .sort((a, b) => a.timeslot - b.timeslot)
      .map((section) => {
        if (section.weekday !== previousDay) {
          previousDay = section.weekday ?? undefined;
          return { ...section, firstEventOfDay: true };
        }
        return { ...section, firstEventOfDay: false };
      });
  }, [data.event]);
  return (
    <SectionList
      refreshing={refreshing}
      onRefresh={onRefresh}
      style={{ margin: 5 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ScheduleListItem session={item} />}
      renderSectionHeader={({ section: { firstEvent, firstEventOfDay } }) =>
        firstEvent ? (
          <SectionHeader event={firstEvent} firstEventOfDay={firstEventOfDay} />
        ) : (
          <ThemedText>No time</ThemedText>
        )
      }
    />
  );
}

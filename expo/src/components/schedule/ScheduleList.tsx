import { gql, TypedDocumentNode } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { useMemo } from "react";
import { SectionList } from "react-native";
import { ScheduleListItem } from "./ScheduleItem";
import { From } from "@/apollo_client";
import { SectionHeader } from "./SectionHeader";
import { ResultOf } from "@graphql-typed-document-node/core";
import { ThemedText } from "../themed-text";

type ScheduleListQueryFragment_Query = {
  schedule_2025:
    | null
    | {
        id: string;
        event:
          | null
          | ({
              start_time_epoch: number | null;
              start_weekday: string | null;
            } & ResultOf<typeof SectionHeader.fragments.SchedEvent>);
        venue: null | {
          id: string;
        };
      }[];
};
const Query: TypedDocumentNode<ScheduleListQueryFragment_Query> = gql`
  fragment ScheduleList_Query on Query {
    schedule_2025 {
      id
      event {
        start_time_epoch
        start_weekday
        ...SectionHeader_SchedEvent @unmask #needs to be passed unmasked as it cannot be normalized
      }
      venue {
        id
      }
      ...ScheduleListItem_SchedSession
    }
  }
  ${ScheduleListItem.fragments.SchedSession}
  ${SectionHeader.fragments.SchedEvent}
`;

ScheduleList.fragments = {
  Query,
} as const;

export function ScheduleList({
  parent,
}: {
  parent: From<ScheduleListQueryFragment_Query>;
}) {
  const { data } = useSuspenseFragment({
    fragment: ScheduleList.fragments.Query,
    fragmentName: "ScheduleList_Query",
    from: parent,
  });
  const sections = useMemo(() => {
    const grouped = Object.groupBy(
      data.schedule_2025 || [],
      (item) => item.event?.start_time_epoch ?? 0
    );
    let previousDay: undefined | string;
    return Object.entries(grouped)
      .map(([timeslot, items]) => {
        return {
          firstEvent: items?.[0].event,
          timeslot: Number(timeslot) || 0,
          data: items ?? [],
        };
      })
      .sort((a, b) => a.timeslot - b.timeslot)
      .map((section) => {
        if (section.firstEvent?.start_weekday !== previousDay) {
          previousDay = section.firstEvent?.start_weekday ?? undefined;
          return { ...section, firstEventOfDay: true };
        }
        return { ...section, firstEventOfDay: false };
      });
  }, [data.schedule_2025]);
  return (
    <SectionList
      style={{ margin: 5 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ScheduleListItem schedSession={item} />}
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

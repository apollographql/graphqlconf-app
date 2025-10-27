import { FragmentType, gql } from "@apollo/client";
import {
  QueryRef,
  useQueryRefHandlers,
  useSuspenseFragment,
} from "@apollo/client/react";
import { useMemo, useTransition } from "react";
import { ScrollView, RefreshControl, StyleSheet } from "react-native";
import { ScheduleListItem } from "@/components/ListItems/ScheduleListItem";
import { fragmentRegistry } from "@/apollo/client";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HomeScreenContent_EventFragmentDoc } from "./HomeScreenContent.generated";
import { Fonts } from "@/constants/theme";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment HomeScreenContent_event on Query {
      event(id: $eventId) {
        id
        name
        sessions {
          id
          start_time_ts
          end_date
          end_time
          type
          ...ScheduleListItem_session
        }
      }
    }
  `;
}

HomeScreenContent.fragments = {
  event: HomeScreenContent_EventFragmentDoc,
} as const;
fragmentRegistry.register(HomeScreenContent.fragments.event);

export function HomeScreenContent({
  event,
  queryRef,
  variables,
}: {
  event: FragmentType<typeof HomeScreenContent.fragments.event>;
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
    fragment: HomeScreenContent.fragments.event,
    fragmentName: "HomeScreenContent_event",
    from: event,
    variables,
  });

  const { ongoingTalks, upcomingTalk } = useMemo(() => {
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const sessions = data.event?.sessions || [];

    // Organizational session types to filter out (normalized in connectors)
    const organizationalTypes = ["Registration", "Breaks"];

    // Helper function to convert end_date and end_time to timestamp
    const getEndTimestamp = (event: {
      end_date: string;
      end_time: string;
    }): number | null => {
      if (!event.end_date || !event.end_time) return null;
      try {
        const dateTimeStr = `${event.end_date}T${event.end_time}`;
        return Math.floor(new Date(dateTimeStr).getTime() / 1000);
      } catch {
        return null;
      }
    };

    // Find ongoing talks (start_time_ts <= now < end_time_ts), excluding organizational sessions
    const ongoing = sessions.filter((session) => {
      const endTs = getEndTimestamp(session);
      return (
        session.start_time_ts &&
        endTs &&
        session.start_time_ts <= now &&
        endTs > now &&
        !organizationalTypes.includes(session.type)
      );
    });

    // Find next upcoming talk (start_time_ts > now, sorted by start time), excluding organizational sessions
    const upcoming = sessions
      .filter(
        (session) =>
          session.start_time_ts &&
          session.start_time_ts > now &&
          !organizationalTypes.includes(session.type)
      )
      .sort((a, b) => (a.start_time_ts ?? 0) - (b.start_time_ts ?? 0))[0];

    return {
      ongoingTalks: ongoing,
      upcomingTalk: upcoming,
    };
  }, [data.event?.sessions]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.title}>
          {data.event?.name ?? "Event"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Happening Now
        </ThemedText>
        {ongoingTalks.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            No talks are currently in progress
          </ThemedText>
        ) : (
          ongoingTalks.map((talk) => (
            <ScheduleListItem key={talk.id} session={talk} />
          ))
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Up Next
        </ThemedText>
        {!upcomingTalk ? (
          <ThemedText style={styles.emptyText}>
            No upcoming talks scheduled
          </ThemedText>
        ) : (
          <ScheduleListItem session={upcomingTalk} />
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyText: {
    fontStyle: "italic",
    opacity: 0.6,
    padding: 16,
  },
});

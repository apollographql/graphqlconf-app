import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ScheduleListItem_SessionFragmentDoc } from "./ScheduleListItem.generated";
import { BookmarkIcon } from "@/components/BookmarkIcon";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment ScheduleListItem_session on SchedSession {
      __typename
      id
      name
      isBookmarked @client
      venue {
        id
        name
      }
      start_time
      end_time
      type
      subtype
      speakers {
        id
        username
        name
      }
    }
  `;
}

ScheduleListItem.fragments = {
  session: ScheduleListItem_SessionFragmentDoc,
} as const;
fragmentRegistry.register(ScheduleListItem.fragments.session);

export function ScheduleListItem({
  session,
}: {
  session:
    | FragmentType<typeof ScheduleListItem.fragments.session>
    | FromParent<typeof ScheduleListItem.fragments.session>;
}) {
  const { data } = useSuspenseFragment({
    fragment: ScheduleListItem.fragments.session,
    fragmentName: "ScheduleListItem_session",
    from: session,
  });

  return (
    <Link href={`/session/${data.id}`} asChild>
      <Pressable>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText>{data.name}</ThemedText>
            </ThemedView>
            <BookmarkIcon
              id={data.id}
              typename={data.__typename}
              isBookmarked={data.isBookmarked}
            />
          </ThemedView>
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
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    margin: 10,
    borderWidth: 1,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
});

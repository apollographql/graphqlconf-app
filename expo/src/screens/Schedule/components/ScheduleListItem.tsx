import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment, useMutation } from "@apollo/client/react";
import { Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ScheduleListItem_SchedSessionFragmentDoc } from "./ScheduleListItem.generated";
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment ScheduleListItem_SchedSession on SchedSession {
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

  const [toggleBookmark] = useMutation(ToggleBookmarkDocument);

  const handleToggleBookmark = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark({
      variables: {
        id: data.id,
        typename: data.__typename,
      },
    });
  };

  return (
    <Link href={`/session/${data.id}`} asChild>
      <Pressable>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText>{data.name}</ThemedText>
            </ThemedView>
            <Pressable onPress={handleToggleBookmark} hitSlop={8}>
              <Ionicons
                name={data.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#007AFF"
              />
            </Pressable>
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

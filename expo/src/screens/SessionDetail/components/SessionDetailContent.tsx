import { FragmentType, gql } from "@apollo/client";
import {
  QueryRef,
  useQueryRefHandlers,
  useSuspenseFragment,
  useMutation,
} from "@apollo/client/react";
import { useTransition } from "react";
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { Ionicons } from "@expo/vector-icons";
import { fragmentRegistry, FromParent } from "@/apollo_client";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SessionDetailContent_SchedSessionFragmentDoc } from "./SessionDetailContent.generated";
import { Fonts } from "@/constants/theme";
import { ToggleFavoriteDocument } from "@/mutations/ToggleFavorite";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment SessionDetailContent_SchedSession on SchedSession {
      __typename
      id
      name
      isFavorite @client
      description
      type
      subtype
      start_date
      start_time
      end_date
      end_time
      venue {
        id
        name
      }
      speakers {
        id
        username
        name
        company
        position
      }
      files {
        path
        name
      }
    }
  `;
}

SessionDetailContent.fragments = {
  SchedSession: SessionDetailContent_SchedSessionFragmentDoc,
} as const;
fragmentRegistry.register(SessionDetailContent.fragments.SchedSession);

export function SessionDetailContent({
  SchedSession,
  queryRef,
}: {
  SchedSession:
    | FragmentType<typeof SessionDetailContent.fragments.SchedSession>
    | FromParent<typeof SessionDetailContent.fragments.SchedSession>;
  queryRef: QueryRef;
}) {
  const { width } = useWindowDimensions();
  const textColor = useThemeColor({}, "text");
  const { refetch } = useQueryRefHandlers(queryRef);
  const [refreshing, transition] = useTransition();
  const onRefresh = () => {
    transition(() => {
      refetch();
    });
  };

  const { data: session } = useSuspenseFragment({
    fragment: SessionDetailContent.fragments.SchedSession,
    fragmentName: "SessionDetailContent_SchedSession",
    from: SchedSession,
  });

  const [toggleFavorite] = useMutation(ToggleFavoriteDocument);

  const handleToggleFavorite = () => {
    toggleFavorite({
      variables: {
        id: session.id,
        typename: session.__typename,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>
            {session.name}
          </ThemedText>
          <Pressable onPress={handleToggleFavorite} hitSlop={8}>
            <Ionicons
              name={session.isFavorite ? "bookmark" : "bookmark-outline"}
              size={32}
              color="#007AFF"
            />
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Type
          </ThemedText>
          <ThemedText>{session.type}</ThemedText>
          {!session.subtype ? null : <ThemedText>{session.subtype}</ThemedText>}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Time
          </ThemedText>
          <ThemedText>
            {session.start_date} {session.start_time} - {session.end_time}
          </ThemedText>
        </ThemedView>

        {!session.venue ? null : (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Venue
            </ThemedText>
            <ThemedText>{session.venue.name}</ThemedText>
          </ThemedView>
        )}

        {!session.description ? null : (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Description
            </ThemedText>
            <RenderHtml
              contentWidth={width}
              source={{ html: session.description }}
              baseStyle={{
                color: textColor,
                fontSize: 16,
                lineHeight: 24,
              }}
              defaultTextProps={{
                selectable: true,
              }}
            />
          </ThemedView>
        )}

        {!session.speakers
          ? null
          : session.speakers.length > 0 && (
              <ThemedView style={styles.section}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Speakers
                </ThemedText>
                {session.speakers.map((speaker) => (
                  <ThemedView key={speaker.id} style={styles.speaker}>
                    <ThemedText type="defaultSemiBold">
                      {speaker.name}
                    </ThemedText>
                    {speaker.position && speaker.company && (
                      <ThemedText>
                        {speaker.position} at {speaker.company}
                      </ThemedText>
                    )}
                  </ThemedView>
                ))}
              </ThemedView>
            )}

        {!session.files || session.files.length === 0 ? null : (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Files
            </ThemedText>
            {session.files.map((file, idx) => (
              <ThemedText key={idx}>{file.name}</ThemedText>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.rounded,
    flex: 1,
    marginRight: 12,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  speaker: {
    marginBottom: 12,
  },
});

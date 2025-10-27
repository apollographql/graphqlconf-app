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
import { fragmentRegistry, FromParent } from "@/apollo/client";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SessionDetailContent_SessionFragmentDoc } from "./SessionDetailContent.generated";
import { Fonts } from "@/constants/theme";
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment SessionDetailContent_session on SchedSession {
      __typename
      id
      name
      isBookmarked @client
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
  session: SessionDetailContent_SessionFragmentDoc,
} as const;
fragmentRegistry.register(SessionDetailContent.fragments.session);

export function SessionDetailContent({
  session,
  queryRef,
}: {
  session:
    | FragmentType<typeof SessionDetailContent.fragments.session>
    | FromParent<typeof SessionDetailContent.fragments.session>;
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

  const { data } = useSuspenseFragment({
    fragment: SessionDetailContent.fragments.session,
    fragmentName: "SessionDetailContent_session",
    from: session,
  });

  const [toggleBookmark] = useMutation(ToggleBookmarkDocument);

  const handleToggleBookmark = () => {
    toggleBookmark({
      variables: {
        id: data.id,
        typename: data.__typename,
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
            {data.name}
          </ThemedText>
          <Pressable onPress={handleToggleBookmark} hitSlop={8}>
            <Ionicons
              name={data.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={32}
              color="#007AFF"
            />
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Type
          </ThemedText>
          <ThemedText>{data.type}</ThemedText>
          {!data.subtype ? null : <ThemedText>{data.subtype}</ThemedText>}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Time
          </ThemedText>
          <ThemedText>
            {data.start_date} {data.start_time} - {data.end_time}
          </ThemedText>
        </ThemedView>

        {!data.venue ? null : (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Venue
            </ThemedText>
            <ThemedText>{data.venue.name}</ThemedText>
          </ThemedView>
        )}

        {!data.description ? null : (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Description
            </ThemedText>
            <RenderHtml
              contentWidth={width}
              source={{ html: data.description }}
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

        {!data.speakers
          ? null
          : data.speakers.length > 0 && (
              <ThemedView style={styles.section}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Speakers
                </ThemedText>
                {data.speakers.map((speaker) => (
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

        {!data.files || data.files.length === 0 ? null : (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Files
            </ThemedText>
            {data.files.map((file, idx) => (
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

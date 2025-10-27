import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SpeakerListItem_SpeakerFragmentDoc } from "./SpeakerListItem.generated";
import { BookmarkIcon } from "@/components/BookmarkIcon";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment SpeakerListItem_speaker on SchedSpeaker {
      __typename
      id
      name
      company
      position
      avatar
      isBookmarked @client
    }
  `;
}

SpeakerListItem.fragments = {
  speaker: SpeakerListItem_SpeakerFragmentDoc,
} as const;
fragmentRegistry.register(SpeakerListItem.fragments.speaker);

export function SpeakerListItem({
  speaker,
}: {
  speaker:
    | FragmentType<typeof SpeakerListItem.fragments.speaker>
    | FromParent<typeof SpeakerListItem.fragments.speaker>;
}) {
  const { data } = useSuspenseFragment({
    fragment: SpeakerListItem.fragments.speaker,
    fragmentName: "SpeakerListItem_speaker",
    from: speaker,
  });

  return (
    <Pressable>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.name}>{data.name}</ThemedText>
            {data.position && (
              <ThemedText style={styles.subtitle}>
                {data.position}
                {data.company && ` at ${data.company}`}
              </ThemedText>
            )}
          </ThemedView>
          <BookmarkIcon
            id={data.id}
            typename={data.__typename}
            isBookmarked={data.isBookmarked}
          />
        </ThemedView>
      </ThemedView>
    </Pressable>
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
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});

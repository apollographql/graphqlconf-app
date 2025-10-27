import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { PlaceListItem_PlaceFragmentDoc } from "./PlaceListItem.generated";
import { BookmarkIcon } from "@/components/BookmarkIcon";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment PlaceListItem_place on Place {
      __typename
      id
      displayName {
        text
        languageCode
      }
      formattedAddress
      isBookmarked @client
    }
  `;
}

PlaceListItem.fragments = {
  place: PlaceListItem_PlaceFragmentDoc,
} as const;
fragmentRegistry.register(PlaceListItem.fragments.place);

export function PlaceListItem({
  place,
}: {
  place:
    | FragmentType<typeof PlaceListItem.fragments.place>
    | FromParent<typeof PlaceListItem.fragments.place>;
}) {
  const { data } = useSuspenseFragment({
    fragment: PlaceListItem.fragments.place,
    fragmentName: "PlaceListItem_place",
    from: place,
  });

  return (
    <Link href={`/place/${data.id}`} asChild>
      <Pressable>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText style={styles.name}>
                {data.displayName?.text}
              </ThemedText>
              {data.formattedAddress && (
                <ThemedText style={styles.subtitle}>
                  {data.formattedAddress}
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

import { gql } from "@apollo/client";
import { useReadQuery, QueryRef } from "@apollo/client/react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BookmarksScreenQueryDocument } from "./BookmarksScreen.generated";
import {
  ResultOf,
  TypedDocumentNode,
  VariablesOf,
} from "@graphql-typed-document-node/core";
import { ScheduleListItem } from "@/components/ListItems/ScheduleListItem";
import { SpeakerListItem } from "@/components/ListItems/SpeakerListItem";
import { PlaceListItem } from "@/components/ListItems/PlaceListItem";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query BookmarksScreenQuery($identifiers: [EntityIdentifier!]!) {
      bookmarks @client @export(as: "identifiers") {
        id
        typename
      }
      entities(identifiers: $identifiers) {
        id
        ... on SchedSession {
          ...ScheduleListItem_session
        }
        ... on SchedSpeaker {
          ...SpeakerListItem_speaker
        }
        ... on Place {
          ...PlaceListItem_place
        }
      }
    }
  `;
}

BookmarksScreen.Query = BookmarksScreenQueryDocument as TypedDocumentNode<
  ResultOf<typeof BookmarksScreenQueryDocument>,
  // work around an incompatibility between AC local state and codegen - it doesn't omit `@export` variables
  Omit<VariablesOf<typeof BookmarksScreenQueryDocument>, "identifiers">
>;

export function BookmarksScreen({
  queryRef,
}: {
  queryRef: QueryRef<ResultOf<typeof BookmarksScreen.Query>>;
}) {
  const { data } = useReadQuery(queryRef);

  if (!data.entities || data.entities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No bookmarks yet</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Tap the bookmark icon on sessions, speakers, or places to save them
          here
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerText}>My Bookmarks</ThemedText>
      </ThemedView>
      {data.entities.map((entity) => {
        if (!entity) return null;

        if (entity.__typename === "SchedSession") {
          return <ScheduleListItem key={entity.id} session={entity} />;
        }

        if (entity.__typename === "SchedSpeaker") {
          return <SpeakerListItem key={entity.id} speaker={entity} />;
        }

        if (entity.__typename === "Place") {
          return <PlaceListItem key={entity.id} place={entity} />;
        }

        return null;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});

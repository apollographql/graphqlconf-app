import { FragmentType, gql } from "@apollo/client";
import { PlaceMarkerInfoFragmentDoc } from "./PlaceMarkerInfo.generated";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";
import { useFragment } from "@apollo/client/react";
import { Link } from "expo-router";

export { PlaceMarkerInfoFragmentDoc };

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment PlaceMarkerInfo on Place {
      id
      displayName {
        text
      }
      location {
        latitude
        longitude
      }
      primaryTypeDisplayName {
        text
      }
    }
  `;
}

export interface PlaceMarkerInfoProps {
  Place: FragmentType<typeof PlaceMarkerInfoFragmentDoc>;
  showLink?: boolean;
}

PlaceMarkerInfo.fragments = {
  Place: PlaceMarkerInfoFragmentDoc,
} as const;

export function PlaceMarkerInfo({ Place, showLink }: PlaceMarkerInfoProps) {
  const { data: place } = useFragment({
    fragment: PlaceMarkerInfo.fragments.Place,
    fragmentName: "PlaceMarkerInfo",
    from: Place,
  });

  return (
    <View>
      <ThemedText style={styles.title}>{place.displayName?.text}</ThemedText>
      {place.primaryTypeDisplayName?.text && (
        <ThemedText style={styles.description}>
          {place.primaryTypeDisplayName.text}
        </ThemedText>
      )}
      {showLink && (
        <Link href={`/place/${place.id}`} asChild>
          <ThemedText style={styles.link}>View Details →</ThemedText>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
  },
  description: {
    fontSize: 12,
    opacity: 0.7,
  },
  link: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 8,
    fontWeight: "600",
  },
});

export function getPlaceMarkerData(place: {
  id: string;
  location: { latitude: number; longitude: number };
  displayName: { text: string };
  primaryTypeDisplayName?: { text: string } | null;
}) {
  return {
    id: place.id,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    title: place.displayName.text,
    description: place.primaryTypeDisplayName?.text,
  };
}

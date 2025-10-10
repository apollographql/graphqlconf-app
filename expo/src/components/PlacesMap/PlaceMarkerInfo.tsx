import { FragmentType, gql } from "@apollo/client";
import { PlaceMarkerInfoFragmentDoc } from "./PlaceMarkerInfo.generated";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";
import { useFragment } from "@apollo/client/react";

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
}

PlaceMarkerInfo.fragments = {
  Place: PlaceMarkerInfoFragmentDoc,
} as const;

export function PlaceMarkerInfo({ Place }: PlaceMarkerInfoProps) {
  const { data: place } = useFragment({
    fragment: PlaceMarkerInfo.fragments.Place,
    fragmentName: "PlaceMarkerInfo",
    from: Place,
  });

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{place.displayName?.text}</ThemedText>
      {place.primaryTypeDisplayName?.text && (
        <ThemedText style={styles.description}>
          {place.primaryTypeDisplayName.text}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    maxWidth: 200,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
  },
  description: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export function getPlaceMarkerData(place: {
  location: { latitude: number; longitude: number };
  displayName: { text: string };
  primaryTypeDisplayName?: { text: string } | null;
}) {
  return {
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    title: place.displayName.text,
    description: place.primaryTypeDisplayName?.text,
  };
}

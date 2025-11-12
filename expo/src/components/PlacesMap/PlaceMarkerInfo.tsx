import { FragmentType, gql } from "@apollo/client";
import { PlaceMarkerInfo_PlaceFragmentDoc } from "./PlaceMarkerInfo.generated";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useFragment } from "@apollo/client/react";
import { Link } from "expo-router";

export { PlaceMarkerInfo_PlaceFragmentDoc };

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment PlaceMarkerInfo_place on Place {
      id
      displayName {
        text
        languageCode
      }
      location {
        latitude
        longitude
      }
      primaryTypeDisplayName {
        text
        languageCode
      }
    }
  `;
}

export interface PlaceMarkerInfoProps {
  place: FragmentType<typeof PlaceMarkerInfo_PlaceFragmentDoc>;
  showLink?: boolean;
}

PlaceMarkerInfo.fragments = {
  place: PlaceMarkerInfo_PlaceFragmentDoc,
} as const;

export function PlaceMarkerInfo({ place, showLink }: PlaceMarkerInfoProps) {
  const { data } = useFragment({
    fragment: PlaceMarkerInfo.fragments.place,
    fragmentName: "PlaceMarkerInfo_place",
    from: place,
  });

  return (
    <View>
      <ThemedText style={styles.title}>{data.displayName?.text}</ThemedText>
      {data.primaryTypeDisplayName?.text && (
        <ThemedText style={styles.description}>
          {data.primaryTypeDisplayName.text}
        </ThemedText>
      )}
      {showLink && (
        <Link href={`/place/${data.id}`} asChild>
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

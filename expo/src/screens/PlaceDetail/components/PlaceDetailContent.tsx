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
  Pressable,
  Linking,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fragmentRegistry, FromParent } from "@/apollo/client";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PlaceDetailContent_PlaceFragmentDoc } from "./PlaceDetailContent.generated";
import { Fonts } from "@/constants/theme";
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";
import { SinglePlaceMap } from "@/components/SinglePlaceMap/SinglePlaceMap";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment PlaceDetailContent_Place on Place {
      __typename
      id
      isBookmarked @client
      displayName {
        text
      }
      primaryTypeDisplayName {
        text
      }
      formattedAddress
      shortFormattedAddress
      location {
        latitude
        longitude
      }
      googleMapsUri
      googleMapsLinks {
        directionsUri
        placeUri
        reviewsUri
        photosUri
      }
      photos {
        id
        widthPx
        heightPx
        authorAttributions {
          displayName
        }
      }
      businessStatus
    }
  `;
}

PlaceDetailContent.fragments = {
  Place: PlaceDetailContent_PlaceFragmentDoc,
} as const;
fragmentRegistry.register(PlaceDetailContent.fragments.Place);

export function PlaceDetailContent({
  Place,
  queryRef,
}: {
  Place:
    | FragmentType<typeof PlaceDetailContent.fragments.Place>
    | FromParent<typeof PlaceDetailContent.fragments.Place>;
  queryRef: QueryRef;
}) {
  const { refetch } = useQueryRefHandlers(queryRef);
  const [refreshing, transition] = useTransition();
  const onRefresh = () => {
    transition(() => {
      refetch();
    });
  };

  const { data: place } = useSuspenseFragment({
    fragment: PlaceDetailContent.fragments.Place,
    fragmentName: "PlaceDetailContent_Place",
    from: Place,
  });

  const [toggleBookmark] = useMutation(ToggleBookmarkDocument);

  const handleToggleBookmark = () => {
    toggleBookmark({
      variables: {
        id: place.id,
        typename: place.__typename,
      },
    });
  };

  const openInGoogleMaps = () => {
    if (place.googleMapsUri) {
      Linking.openURL(place.googleMapsUri);
    }
  };

  const openDirections = () => {
    if (place.googleMapsLinks?.directionsUri) {
      Linking.openURL(place.googleMapsLinks.directionsUri);
    }
  };

  // Get the first photo if available
  const firstPhoto = place.photos?.[0];
  const photoUrl = firstPhoto
    ? `https://places.googleapis.com/v1/${firstPhoto.id}/media?maxHeightPx=400&maxWidthPx=800&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        {photoUrl && (
          <Image
            source={{ uri: photoUrl }}
            style={styles.photo}
            resizeMode="cover"
          />
        )}

        <ThemedView style={styles.titleRow}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              {place.displayName.text}
            </ThemedText>
            {place.primaryTypeDisplayName?.text && (
              <ThemedText style={styles.subtitle}>
                {place.primaryTypeDisplayName.text}
              </ThemedText>
            )}
          </ThemedView>
          <Pressable onPress={handleToggleBookmark} hitSlop={8}>
            <Ionicons
              name={place.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={32}
              color="#007AFF"
            />
          </Pressable>
        </ThemedView>

        {place.businessStatus && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.businessStatus}>
              {place.businessStatus}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Address
          </ThemedText>
          <ThemedText>{place.formattedAddress}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Location
          </ThemedText>
          <ThemedText style={styles.coordinates}>
            {place.location.latitude.toFixed(6)},{" "}
            {place.location.longitude.toFixed(6)}
          </ThemedText>
          <Pressable
            onPress={openInGoogleMaps}
            style={styles.mapContainer}
          >
            <SinglePlaceMap
              latitude={place.location.latitude}
              longitude={place.location.longitude}
              title={place.displayName.text}
              height={200}
            />
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={openDirections}>
            <Ionicons name="navigate" size={20} color="#007AFF" />
            <ThemedText style={styles.buttonText}>Directions</ThemedText>
          </Pressable>

          <Pressable style={styles.button} onPress={openInGoogleMaps}>
            <Ionicons name="map" size={20} color="#007AFF" />
            <ThemedText style={styles.buttonText}>Open in Maps</ThemedText>
          </Pressable>
        </ThemedView>

        {place.photos && place.photos.length > 1 && (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Photos ({place.photos.length})
            </ThemedText>
            <ThemedText style={styles.photoAttribution}>
              Photos by Google Maps contributors
            </ThemedText>
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
    paddingBottom: 16,
  },
  photo: {
    width: "100%",
    height: 200,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: Fonts.rounded,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  label: {
    marginBottom: 8,
  },
  coordinates: {
    marginBottom: 12,
  },
  mapContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  businessStatus: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  buttonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  photoAttribution: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
});

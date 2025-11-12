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
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PlaceDetailContent_PlaceFragmentDoc } from "./PlaceDetailContent.generated";
import { Fonts } from "@/constants/theme";
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";
import { SinglePlaceMap } from "@/components/SinglePlaceMap/SinglePlaceMap";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment PlaceDetailContent_place on Place {
      __typename
      id
      isBookmarked @client
      displayName {
        text
        languageCode
      }
      primaryTypeDisplayName {
        text
        languageCode
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
          uri
          displayName
        }
      }
      businessStatus
    }
  `;
}

PlaceDetailContent.fragments = {
  place: PlaceDetailContent_PlaceFragmentDoc,
} as const;
fragmentRegistry.register(PlaceDetailContent.fragments.place);

export function PlaceDetailContent({
  place: place,
  queryRef,
}: {
  place:
    | FragmentType<typeof PlaceDetailContent.fragments.place>
    | FromParent<typeof PlaceDetailContent.fragments.place>;
  queryRef: QueryRef;
}) {
  const { refetch } = useQueryRefHandlers(queryRef);
  const [refreshing, transition] = useTransition();
  const onRefresh = () => {
    transition(() => {
      refetch();
    });
  };

  const { data } = useSuspenseFragment({
    fragment: PlaceDetailContent.fragments.place,
    fragmentName: "PlaceDetailContent_place",
    from: place,
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

  const openInGoogleMaps = () => {
    if (data.googleMapsUri) {
      Linking.openURL(data.googleMapsUri);
    }
  };

  const openDirections = () => {
    if (data.googleMapsLinks?.directionsUri) {
      Linking.openURL(data.googleMapsLinks.directionsUri);
    }
  };

  // Get the first photo if available
  const firstPhoto = data.photos?.[0];
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
              {data.displayName.text}
            </ThemedText>
            {data.primaryTypeDisplayName?.text && (
              <ThemedText style={styles.subtitle}>
                {data.primaryTypeDisplayName.text}
              </ThemedText>
            )}
          </ThemedView>
          <Pressable onPress={handleToggleBookmark} hitSlop={8}>
            <Ionicons
              name={data.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={32}
              color="#007AFF"
            />
          </Pressable>
        </ThemedView>

        {data.businessStatus && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.businessStatus}>
              {data.businessStatus}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Address
          </ThemedText>
          <ThemedText>{data.formattedAddress}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Location
          </ThemedText>
          <ThemedText style={styles.coordinates}>
            {data.location.latitude.toFixed(6)},{" "}
            {data.location.longitude.toFixed(6)}
          </ThemedText>
          <Pressable onPress={openInGoogleMaps} style={styles.mapContainer}>
            <SinglePlaceMap
              latitude={data.location.latitude}
              longitude={data.location.longitude}
              title={data.displayName.text}
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

        {data.photos && data.photos.length > 1 && (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Photos ({data.photos.length})
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

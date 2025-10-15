import { StyleSheet, View } from "react-native";
import RNMapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  PlaceMarkerInfoFragmentDoc,
  getPlaceMarkerData,
} from "./PlaceMarkerInfo";
import { useFragment } from "@apollo/client/react";
import { FragmentType } from "@apollo/client";
import { useRouter } from "expo-router";
import { useMemo } from "react";

// check export shape consistency between web and native versions of this file
declare let native: typeof import("./PlacesMap");
declare let web: typeof import("./PlacesMap.web");
if (false) {
  native = web;
  web = native;
}

export interface PlacesMapProps {
  Places: FragmentType<typeof PlaceMarkerInfoFragmentDoc>[];
  height?: number;
}

PlacesMap.fragments = {
  Places: PlaceMarkerInfoFragmentDoc,
} as const;

export function PlacesMap({ Places: locations, height = 300 }: PlacesMapProps) {
  const router = useRouter();

  const places = useFragment({
    fragment: PlacesMap.fragments.Places,
    fragmentName: "PlaceMarkerInfo",
    from: locations,
  });

  // Extract marker data from fragments
  const markerData = useMemo(() => {
    if (!places.every((place) => place.dataState === "complete")) return [];
    return places.map((place) => getPlaceMarkerData(place.data));
  }, [places]);

  if (markerData.length === 0) {
    return null;
  }

  // Calculate the center and region to show all markers
  const latitudes = markerData.map((loc) => loc.latitude);
  const longitudes = markerData.map((loc) => loc.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const latDelta = (maxLat - minLat) * 1.5 || 0.01; // Add padding
  const lngDelta = (maxLng - minLng) * 1.5 || 0.01; // Add padding

  return (
    <View style={[styles.container, { height }]}>
      <RNMapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
      >
        {markerData.map((location, idx) => (
          <Marker
            key={idx}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.title}
            description={location.description}
            onCalloutPress={() => {
              router.push(`/place/${location.id}`);
            }}
            // Custom callout is not working with this version of react-native-maps (due to a bug)
            // newer versions of react-native-maps have fixed this, but do not work
            // with Expo go yet, so to keep this app simple we use the default callout
            // children={
            //   <Callout style={styles.calloutContainer}>
            //   <View>
            //     <Text>Test</Text>
            //   </View>
            // </Callout>
            // }
          />
        ))}
      </RNMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 8,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

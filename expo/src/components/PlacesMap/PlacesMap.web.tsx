import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import type { PlacesMapProps } from "./PlacesMap";
import {
  PlaceMarkerInfo,
  getPlaceMarkerData,
  PlaceMarkerInfoFragmentDoc,
} from "./PlaceMarkerInfo";
import { useApolloClient } from "@apollo/client/react";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";

export type { PlacesMapProps };

PlacesMap.fragments = {
  Places: PlaceMarkerInfoFragmentDoc,
} as const;

export function PlacesMap({ Places: locations, height = 300 }: PlacesMapProps) {
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(
    null
  );
  const client = useApolloClient();

  if (locations.length === 0) {
    return null;
  }

  // Extract marker data from fragments
  const markerData = locations.map((incoming) => {
    const place = client.readFragment({
      fragment: PlacesMap.fragments.Places,
      fragmentName: "PlaceMarkerInfo",
      id: client.cache.identify(incoming),
    })!;
    return getPlaceMarkerData(place);
  });

  // Calculate the center and bounds to show all markers
  const latitudes = markerData.map((loc) => loc.latitude);
  const longitudes = markerData.map((loc) => loc.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calculate appropriate zoom level based on bounds
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

  // Rough zoom calculation (zoom decreases as area increases)
  let zoom = 15;
  if (maxDiff > 0.1) zoom = 10;
  if (maxDiff > 1) zoom = 7;
  if (maxDiff > 5) zoom = 5;

  const apiKey =
    { ...process.env }["EXPO_PUBLIC_" + "GOOGLE_MAPS_API_KEY"] || "";

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={[styles.container, { height }]}>
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: centerLat, lng: centerLng }}
            defaultZoom={zoom}
            mapId={process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID || "map"}
            style={{ width: "100%", height: "100%" }}
          >
            {markerData.map((location, idx) => (
              <AdvancedMarker
                key={idx}
                position={{ lat: location.latitude, lng: location.longitude }}
                title={location.title}
                onClick={() => setSelectedMarkerIndex(idx)}
              >
                <Pin />
              </AdvancedMarker>
            ))}
            {selectedMarkerIndex !== null && (
              <InfoWindow
                position={{
                  lat: markerData[selectedMarkerIndex].latitude,
                  lng: markerData[selectedMarkerIndex].longitude,
                }}
                onCloseClick={() => setSelectedMarkerIndex(null)}
              >
                <View style={styles.infoWindowContainer}>
                  <PlaceMarkerInfo
                    Place={locations[selectedMarkerIndex]}
                    showLink
                  />
                </View>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 8,
  },
  infoWindowContainer: {
    padding: 8,
    maxWidth: 220,
  },
});

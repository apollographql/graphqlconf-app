import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import type { MapLocation, PlacesMapProps } from "./PlacesMap";
export type { MapLocation, PlacesMapProps };

PlacesMap.fragments = {} as const;

export function PlacesMap({ locations, height = 300 }: PlacesMapProps) {
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(
    null
  );

  if (locations.length === 0) {
    return null;
  }

  // Calculate the center and bounds to show all markers
  const latitudes = locations.map((loc) => loc.latitude);
  const longitudes = locations.map((loc) => loc.longitude);

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
    <View style={[styles.container, { height }]}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={zoom}
          mapId={process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID || "map"}
          style={{ width: "100%", height: "100%" }}
        >
          {locations.map((location, idx) => (
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
                lat: locations[selectedMarkerIndex].latitude,
                lng: locations[selectedMarkerIndex].longitude,
              }}
              onCloseClick={() => setSelectedMarkerIndex(null)}
            >
              <div style={{ padding: "8px", maxWidth: "200px" }}>
                {locations[selectedMarkerIndex].title && (
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      fontSize: "14px",
                    }}
                  >
                    {locations[selectedMarkerIndex].title}
                  </div>
                )}
                {locations[selectedMarkerIndex].description && (
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {locations[selectedMarkerIndex].description}
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 8,
  },
});

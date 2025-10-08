import { StyleSheet, View } from "react-native";
import RNMapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// check export shape consistency between web and native versions of this file
declare let native: typeof import("./PlacesMap");
declare let web: typeof import("./PlacesMap.web");
if (false) {
  native = web;
  web = native;
}

export interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export interface PlacesMapProps {
  locations: MapLocation[];
  height?: number;
}

PlacesMap.fragments = {} as const;

export function PlacesMap({ locations, height = 300 }: PlacesMapProps) {
  if (locations.length === 0) {
    return null;
  }

  // Calculate the center and region to show all markers
  const latitudes = locations.map((loc) => loc.latitude);
  const longitudes = locations.map((loc) => loc.longitude);

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
        {locations.map((location, idx) => (
          <Marker
            key={idx}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.title}
            description={location.description}
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

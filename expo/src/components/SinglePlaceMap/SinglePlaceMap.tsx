import { StyleSheet, View } from "react-native";
import RNMapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// check export shape consistency between web and native versions of this file
declare let native: typeof import("./SinglePlaceMap");
declare let web: typeof import("./SinglePlaceMap.web");
if (false) {
  native = web;
  web = native;
}

export interface SinglePlaceMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: number;
}

export function SinglePlaceMap({
  latitude,
  longitude,
  title,
  height = 200,
}: SinglePlaceMapProps) {
  return (
    <View style={[styles.container, { height }]}>
      <RNMapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
          title={title}
        />
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

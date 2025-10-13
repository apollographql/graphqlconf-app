import { StyleSheet, View } from "react-native";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  ColorScheme,
} from "@vis.gl/react-google-maps";
import type { SinglePlaceMapProps } from "./SinglePlaceMap";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";

export type { SinglePlaceMapProps };

export function SinglePlaceMap({
  latitude,
  longitude,
  title,
  height = 200,
}: SinglePlaceMapProps) {
  const colorScheme = useColorScheme();
  const apiKey =
    { ...process.env }["EXPO_PUBLIC_" + "GOOGLE_MAPS_API_KEY"] || "";

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={[styles.container, { height }]}>
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: latitude, lng: longitude }}
            defaultZoom={15}
            mapId={process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID || "map"}
            colorScheme={
              colorScheme === "dark" ? ColorScheme.DARK : ColorScheme.LIGHT
            }
            style={{ width: "100%", height: "100%" }}
            gestureHandling="none"
            disableDefaultUI
          >
            <AdvancedMarker
              position={{ lat: latitude, lng: longitude }}
              title={title}
            >
              <Pin />
            </AdvancedMarker>
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
});

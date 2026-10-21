import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

// Which map renders on this device:
//   iOS      -> Apple Maps (native; works in Expo Go and store builds, no key)
//   Android  -> Google Maps, but only in a real build that ships a Maps API key
//               (Expo Go dropped Google Maps on Android in SDK 53; see app.config.js)
//   otherwise-> MapLibre + OpenFreeMap vector tiles (free, keyless) in a WebView / iframe
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const hasGoogleMapsKey = !!Constants.expoConfig?.extra?.googleMapsAndroid;

export const MAP_ENGINE =
  Platform.OS === "ios"
    ? "apple"
    : Platform.OS === "android" && hasGoogleMapsKey && !isExpoGo
      ? "google"
      : "maplibre";

export const MAP_ENGINE_LABEL = {
  apple: "Apple Maps",
  google: "Google Maps",
  maplibre: "OpenFreeMap",
}[MAP_ENGINE];

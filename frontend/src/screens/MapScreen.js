import * as React from "react";
import { View, StyleSheet } from "react-native";
import { useLocation } from "../context/Locationcontext";
import LocationMapView from "../map/MapView";

export function MapScreen() {
  const { coordinates } = useLocation();

  return (
    <View style={styles.container}>
      <LocationMapView coordinates={coordinates} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

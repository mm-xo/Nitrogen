import * as React from "react";
import { View, StyleSheet } from "react-native";
import LocationMapView from "../map/MapView";
import { COLORS } from "../themes/colors";
import { AuthBackground } from "../components/AuthBackground";

const coordinates = {"category":"Food", "latitude":123, "logitude":123};

export function MapScreen() {
  return (
    <View style={styles.container}>
      <AuthBackground />
      <LocationMapView coordinates={coordinates} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

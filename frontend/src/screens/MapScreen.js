import * as React from "react";
import { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import LocationMapView from "../map/MapView";
import { COLORS } from "../themes/colors";
import { AuthBackground } from "../components/AuthBackground";
import { useLocation } from "../context/Locationcontext";
import { CAMPUS_CENTER } from "../constants/campus";

export function MapScreen() {
  const { coordinates: locationCoords } = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger((t) => t + 1);
    }, [])
  );

  const coordinates = locationCoords
    ? { latitude: locationCoords.lat, longitude: locationCoords.lng }
    : { latitude: CAMPUS_CENTER.lat, longitude: CAMPUS_CENTER.lng };

  return (
    <View style={styles.container}>
      <AuthBackground />
      <LocationMapView coordinates={coordinates} refreshTrigger={refreshTrigger} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

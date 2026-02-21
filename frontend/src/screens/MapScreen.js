import * as React from "react";
import { View, StyleSheet } from "react-native";
import LocationMapView from "../map/MapView";
const coordinates = {"category":"Food", "latitude":123, "logitude":123};


export function MapScreen() {

  return (
    <View style={styles.container}>
      
        <LocationMapView coordinates={coordinates}/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

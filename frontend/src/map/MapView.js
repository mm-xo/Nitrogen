import React from 'react';
import MapView, { Marker, Circle} from 'react-native-maps';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

const DEFAULT_DELTA = 0.005;
const UNI_LAT = 49.806957;
const UNI_LONG = -97.139759;
export default function LocationMapView({ coordinates }) {

  const center = {
    latitude: UNI_LAT, 
    longitude: UNI_LONG,
  };

  if (!coordinates) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  const region = {
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    latitudeDelta: DEFAULT_DELTA,
    longitudeDelta: DEFAULT_DELTA,
  };

  return (
    <View style={styles.container}>
      <MapView
  provider="google"
  style={styles.map}
  initialRegion={{
          latitude: UNI_LAT, 
          longitude: UNI_LONG,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
>
  <Marker
          coordinate={{
            latitude: coordinates.lat,
            longitude: coordinates.lng,
          }}
          title="you are here."
        /> 

         <Circle
          center={center}
          radius={1000} // 500 meters
           strokeColor="blue"
          strokeWidth={3}
          fillColor="rgba(173, 216, 230, 0.5)" 
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
});

import React from 'react';
import MapView, { Marker, Circle} from 'react-native-maps';
import { StyleSheet, View, ActivityIndicator, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {getAlertCoordinates} from "./AlterPins";

const DEFAULT_DELTA = 0.005;
const UNI_LAT = 49.806957;
const UNI_LONG = -97.139759;
  const CATEGORY_COLORS = {
  safety: "#FF3B30",   // red
  food: "#FF9500",     // orange
  events: "#4834c7ff",   // green
};

export default function LocationMapView({ coordinates }) {
  
  
const [alerts, setAlerts] = React.useState([]);
  const [loadingAlerts, setLoadingAlerts] = React.useState(true);
  const [alertsError, setAlertsError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const rows = await getAlertCoordinates(); // ✅ await is valid here
        
        if (mounted) setAlerts(rows ?? []);
      } catch (e) {
        if (mounted) setAlertsError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoadingAlerts(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
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
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
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
  {alerts.map((a, index) => (
  <Marker
    key={index}
    coordinate={{
      latitude: a.latitude,
      longitude: a.longitude,
    }}
  >
    <View
      style={[
        styles.dot,
        { backgroundColor: CATEGORY_COLORS[a.category.toLowerCase()] ?? "#999" }
      ]}
    />
  </Marker>
))}

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
  iconContainer: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "white",
  alignItems: "center",
  justifyContent: "center",

  // optional shadow
  elevation: 5,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
},
dot: {
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: "white",
},
});

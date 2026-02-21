import React from 'react';
import MapView, { Marker, Circle } from 'react-native-maps';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { getAlertCoordinates } from "./AlterPins";
import { CATEGORY_COLORS } from "../constants/categories";
import { supabase } from "../../lib/supabase";

const DEFAULT_DELTA = 0.005;
const UNI_LAT = 49.806957;
const UNI_LONG = -97.139759;

function filterValidPins(rows) {
  return (rows ?? []).filter(
    (a) => a != null && typeof a.latitude === "number" && typeof a.longitude === "number"
  );
}

export default function LocationMapView({ coordinates, refreshTrigger = 0 }) {
  const [alerts, setAlerts] = React.useState([]);
  const [loadingAlerts, setLoadingAlerts] = React.useState(true);
  const [alertsError, setAlertsError] = React.useState(null);

  const fetchPins = React.useCallback(async () => {
    try {
      const rows = await getAlertCoordinates();
      setAlerts(filterValidPins(rows));
      setAlertsError(null);
    } catch (e) {
      setAlertsError(e?.message ?? String(e));
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  React.useEffect(() => {
    setLoadingAlerts(true);
    fetchPins();
  }, [fetchPins, refreshTrigger]);

  React.useEffect(() => {
    const channel = supabase
      .channel("alerts-map")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => {
          fetchPins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPins]);
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
        {alerts.map((a) => {
          return (
            <Marker
              key={a.id}
              coordinate={{
                latitude: a.latitude,
                longitude: a.longitude,
              }}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: CATEGORY_COLORS[(a.category || "").toLowerCase()] ?? "#999" }
                ]}
              />
            </Marker>
          );
        })}
        <Circle
          center={center}
          radius={1000}
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

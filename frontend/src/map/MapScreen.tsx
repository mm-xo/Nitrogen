import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { mapStyles } from './styles';
import { Coords, LocationData, MapScreenProps } from './types';

const EVENT_COORDS: Coords = { latitude: 49.8103, longitude: -97.1320 }; // Red pin

// FAKE LIVE LOCATION DATA - Exact teammate format
const FAKE_LOCATIONS: LocationData[] = [
  {
    coords: {
      latitude: 49.80884531855531,
      longitude: -97.13364534147541,
      altitude: null,
      accuracy: 78,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: 1771620881629,
  },
  {
    coords: {
      latitude: 49.8092,
      longitude: -97.1341,
      altitude: null,
      accuracy: 65,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  },
  {
    coords: {
      latitude: 49.8089,
      longitude: -97.1328,
      altitude: null,
      accuracy: 72,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now() + 1000,
  },
];

export default function MapScreen({ 
  locationData: propLocationData,
  eventCoords = EVENT_COORDS 
}: MapScreenProps) {
  
const [locationData, setLocationData] = useState(null);

  // AUTO-CYCLE fake locations for testing (stops when teammate data comes)
  useEffect(() => {
    if (propLocationData) {
      setLocationData(propLocationData);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      setLocationData(FAKE_LOCATIONS[index % FAKE_LOCATIONS.length]);
      index++;
    }, 3000); // Move every 3 seconds

    return () => clearInterval(interval);
  }, [propLocationData]);

  // Extract user coords
  const userCoords: Coords | null = locationData?.coords || null;

  const region = {
    latitude: userCoords?.latitude ?? eventCoords.latitude,
    longitude: userCoords?.longitude ?? eventCoords.longitude,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  return (
    <View style={mapStyles.container}>
      <MapView
        style={mapStyles.map}
        region={region}
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
      >
        {/* 🔴 RED PIN - Event (always visible) */}
        <Marker
          coordinate={eventCoords}
          title="🎓 University Event"
          description="Your destination"
          pinColor="red"
        />

        {/* 🔵 BLUE DOT - Live location (moves every 3s for testing) */}
        {userCoords && (
          <Marker coordinate={userCoords}>
            <View style={mapStyles.blueDotOuter}>
              <View style={mapStyles.blueDotInner} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Debug - Shows EXACT teammate format */}
      {locationData ? (
        <View style={mapStyles.debugInfo}>
          <Text style={mapStyles.debugText}>
            📍 You: {userCoords!.latitude.toFixed(6)}, {userCoords!.longitude.toFixed(6)}
          </Text>
          <Text style={mapStyles.debugSubText}>
            📏 Accuracy: {locationData.coords.accuracy}m
          </Text>
          <Text style={mapStyles.debugSubText}>
            🕐 {new Date(locationData.timestamp).toLocaleTimeString()}
          </Text>
          <Text style={mapStyles.debugSubText}>
            🎯 Event: {eventCoords.latitude.toFixed(4)}, {eventCoords.longitude.toFixed(4)}
          </Text>
          <Text style={[mapStyles.debugSubText, { fontSize: 10, color: propLocationData ? '#4ade80' : '#facc15' }]}>
            {propLocationData ? '✅ LIVE DATA' : '🧪 TESTING MODE'}
          </Text>
        </View>
      ) : (
        <View style={mapStyles.debugInfo}>
          <Text style={mapStyles.debugText}>Starting up...</Text>
        </View>
      )}
    </View>
  );
}

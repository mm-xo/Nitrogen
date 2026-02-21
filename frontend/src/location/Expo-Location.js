import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/Locationcontext';

export default function ExpoLocation() {
  const { setCoordinates } = useLocation();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let subscription = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,   // update at most every 2 seconds
          distanceInterval: 5,  // or when user moves 5 meters
        },
        ({ coords }) => {
          setCoordinates({
            lat: coords.latitude,
            lng: coords.longitude,
          });
        }
      );
    })();

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, [setCoordinates]);

  return null;
}
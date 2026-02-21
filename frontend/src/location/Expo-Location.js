import * as Location from 'expo-location';
import React, { useEffect } from 'react';
import { useLocation } from '../context/Locationcontext';

export default function ExpoLocation() {
  const { setCoordinates, setLocationError, retryTrigger } = useLocation();

  useEffect(() => {
    let subscription = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }
      setLocationError(null);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
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
  }, [setCoordinates, setLocationError, retryTrigger]);

  return null;
}
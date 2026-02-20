import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';

export default function ExpoLocation() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
    useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();  
        if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
        await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation(loc.coords);
        }
      );
    })();
  }, []);
    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }
    return text;
}
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { distanceFromCurrentTo } from '../location/Distance';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coordinates, setCoordinates] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [targetRegion, setTargetRegion] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const requestLocationRetry = useCallback(() => {
    setLocationError(null);
    setRetryTrigger((n) => n + 1);
  }, []);

  // Recalculate distance every time coordinates update (each Expo Location callback)
  const distanceToTarget = useMemo(
    () => distanceFromCurrentTo(coordinates, targetRegion ?? {}, 'm'),
    [coordinates, targetRegion]
  );

  const value = useMemo(
    () => ({
      coordinates,
      setCoordinates,
      locationError,
      setLocationError,
      requestLocationRetry,
      retryTrigger,
      targetRegion,
      setTargetRegion,
      distanceToTarget: targetRegion ? distanceToTarget : null,
    }),
    [coordinates, locationError, requestLocationRetry, retryTrigger, targetRegion, distanceToTarget]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}


export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used inside a <LocationProvider>');
  }
  return context;
}
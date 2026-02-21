import React, { createContext, useContext, useState, useMemo } from 'react';
import { distanceFromCurrentTo } from '../location/Distance';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coordinates, setCoordinates] = useState(null);
  const [targetRegion, setTargetRegion] = useState(null);

  // Recalculate distance every time coordinates update (each Expo Location callback)
  const distanceToTarget = useMemo(
    () => distanceFromCurrentTo(coordinates, targetRegion ?? {}, 'm'),
    [coordinates, targetRegion]
  );

  const value = useMemo(
    () => ({
      coordinates,
      setCoordinates,
      targetRegion,
      setTargetRegion,
      distanceToTarget: targetRegion ? distanceToTarget : null,
    }),
    [coordinates, targetRegion, distanceToTarget]
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
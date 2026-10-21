import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { distanceFromCurrentTo } from "../location/Distance";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coordinates, setCoordinates] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const requestLocationRetry = useCallback(() => {
    setLocationError(null);
    setRetryTrigger((n) => n + 1);
  }, []);

  // Metres from the user to anything with lat/lng or latitude/longitude, or null if unknown.
  const distanceTo = useCallback(
    (target) => distanceFromCurrentTo(coordinates, target, "m"),
    [coordinates]
  );

  const value = useMemo(
    () => ({
      coordinates,
      setCoordinates,
      locationError,
      setLocationError,
      requestLocationRetry,
      retryTrigger,
      distanceTo,
    }),
    [coordinates, locationError, requestLocationRetry, retryTrigger, distanceTo]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used inside a <LocationProvider>");
  }
  return context;
}

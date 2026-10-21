import * as Location from "expo-location";
import { useEffect } from "react";
import { useLocation } from "../context/LocationContext";

// Headless: keeps LocationContext.coordinates in sync with the device position.
export default function LocationWatcher() {
  const { setCoordinates, setLocationError, retryTrigger } = useLocation();

  useEffect(() => {
    let subscription = null;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          setLocationError("Location access is off");
          return;
        }
        setLocationError(null);

        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
          ({ coords }) => setCoordinates({ lat: coords.latitude, lng: coords.longitude })
        );
        if (cancelled) subscription?.remove?.();
      } catch (e) {
        if (!cancelled) setLocationError(e?.message || "Location unavailable");
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove?.();
    };
  }, [setCoordinates, setLocationError, retryTrigger]);

  return null;
}

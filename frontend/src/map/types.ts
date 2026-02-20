export type Coords = {
  latitude: number;
  longitude: number;
};

export type LocationData = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

export type MapScreenProps = {
  locationData?: LocationData | null;
  eventCoords: Coords;
};

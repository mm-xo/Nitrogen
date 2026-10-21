// Google Maps styles (Android) — muted base, no POI clutter, so category pins carry the colour.
export const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f4f4f6" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8b95" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f4f4f6" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#e4ede4" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e6e6ea" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#a0a0a8" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#ebebee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d9e2ec" }] },
];

export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#121215" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b6b76" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#121215" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#15201a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f1f24" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2a2a30" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5d5d67" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#17171b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c1520" }] },
];

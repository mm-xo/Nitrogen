import { useLocation } from '../context/Locationcontext';
import { CAMPUS_CENTER, CAMPUS_RADIUS_M } from '../constants/campus';

/**
 * Haversine formula: great-circle distance between two points on Earth.
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lng1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lng2 - Longitude of point 2 (degrees)
 * @param {'km'|'m'|'mi'} unit - 'm' (meters), 'km', or 'mi' (miles)
 * @returns {number} Distance in the requested unit
 */
export function haversineDistance(lat1, lng1, lat2, lng2, unit = 'm') {
  const R = unit === 'mi' ? 3959 : unit === 'km' ? 6371 : 6371000; // Earth radius in mi, km, or m
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Distance from current coordinates to a region (or any point).
 * Accepts region as { latitude, longitude } or { lat, lng }.
 * @param {{ lat: number, lng: number } | null} current - Current position from LocationContext
 * @param {{ latitude?: number, longitude?: number, lat?: number, lng?: number }} target - Region or point
 * @param {'km'|'m'|'mi'} unit - 'm' (meters), 'km', or 'mi'
 * @returns {number | null} Distance in the requested unit, or null if current position is unknown
 */
export function distanceFromCurrentTo(current, target, unit = 'm') {
  if (!current || current.lat == null || current.lng == null) return null;
  const lat2 = target.latitude ?? target.lat;
  const lng2 = target.longitude ?? target.lng;
  if (lat2 == null || lng2 == null) return null;
  return haversineDistance(current.lat, current.lng, lat2, lng2, unit);
}

/**
 * Hook: distance from current position (LocationContext) to a region/point.
 * @param {{ latitude?: number, longitude?: number, lat?: number, lng?: number }} target - Region or point
 * @param {'km'|'m'|'mi'} unit - 'm' (meters), 'km', or 'mi'
 * @returns {number | null} Distance in the requested unit, or null if position or target is missing
 */
export function useDistanceTo(target, unit = 'm') {
  const { coordinates } = useLocation();
  return distanceFromCurrentTo(coordinates, target, unit);
}

/**
 * Check if a point is within the campus circle (for create-alert validation).
 * @param {{ lat: number, lng: number } | null} current
 * @returns {{ within: boolean, distanceM: number | null }}
 */
export function isWithinCampus(current) {
  const distanceM = distanceFromCurrentTo(current, CAMPUS_CENTER, 'm');
  if (distanceM == null) return { within: false, distanceM: null };
  return { within: distanceM <= CAMPUS_RADIUS_M, distanceM };
}

export { CAMPUS_CENTER, CAMPUS_RADIUS_M };

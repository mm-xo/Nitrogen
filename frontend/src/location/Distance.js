import { useLocation } from '../context/Locationcontext';
import { CAMPUS_CENTER, CAMPUS_RADIUS_M } from '../constants/campus';

export function haversineDistance(lat1, lng1, lat2, lng2, unit = 'm') {
  const R = unit === 'mi' ? 3959 : unit === 'km' ? 6371 : 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function distanceFromCurrentTo(current, target, unit = 'm') {
  if (!current || current.lat == null || current.lng == null) return null;
  const lat2 = target.latitude ?? target.lat;
  const lng2 = target.longitude ?? target.lng;
  if (lat2 == null || lng2 == null) return null;
  return haversineDistance(current.lat, current.lng, lat2, lng2, unit);
}

export function useDistanceTo(target, unit = 'm') {
  const { coordinates } = useLocation();
  return distanceFromCurrentTo(coordinates, target, unit);
}

export function isWithinCampus(current) {
  const distanceM = distanceFromCurrentTo(current, CAMPUS_CENTER, 'm');
  if (distanceM == null) return { within: false, distanceM: null };
  return { within: distanceM <= CAMPUS_RADIUS_M, distanceM };
}

export { CAMPUS_CENTER, CAMPUS_RADIUS_M };

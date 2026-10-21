// How taps on the native map turn into pin selections (the MapLibre page applies the same radius).
export const TAP_RADIUS = 30; // points around a pin's centre that still select it
// On iOS a tap on a marker also reaches the map as a plain "press" ~300ms later (it waits out a
// possible double-tap); presses inside this window belong to the marker and must not deselect it.
export const MARKER_PRESS_WINDOW = 600;

// points: [{ id, x, y }] in the same coordinate space as position. Closest id within radius, or null.
export function nearestPinId(position, points, radius = TAP_RADIUS) {
  let best = null;
  let bestDist = radius;
  for (const p of points) {
    const d = Math.hypot(p.x - position.x, p.y - position.y);
    if (d <= bestDist) {
      best = p.id;
      bestDist = d;
    }
  }
  return best;
}

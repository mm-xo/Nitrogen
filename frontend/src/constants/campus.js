/**
 * University of Manitoba Fort Garry campus config.
 * DB constraints: lat 49.8–49.85, lng -97.15 to -97.10 (rectangle).
 * We use a circle for distance-based checks.
 */
export const CAMPUS_CENTER = { lat: 49.825, lng: -97.125 };
export const CAMPUS_RADIUS_M = 3200; // ~3.2km, covers the DB rectangle

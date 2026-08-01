export interface GeoFeedback {
  distanceKm: number;
  distanceMiles: number;
  bearingDeg: number;
  directionArrow: string;
  proximityPercent: number;
}

/**
 * Calculates Great-Circle distance using Haversine formula in KM
 */
export function getHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates compass bearing from point 1 to point 2 in degrees (0-360)
 */
export function getCompassBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(radLat2);
  const x =
    Math.cos(radLat1) * Math.sin(radLat2) -
    Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Maps bearing angle (0-360) to 8-point compass emoji arrow
 */
export function getDirectionArrow(bearing: number): string {
  if (bearing >= 337.5 || bearing < 22.5) return '⬆️'; // North
  if (bearing >= 22.5 && bearing < 67.5) return '↗️'; // North-East
  if (bearing >= 67.5 && bearing < 112.5) return '➡️'; // East
  if (bearing >= 112.5 && bearing < 157.5) return '↘️'; // South-East
  if (bearing >= 157.5 && bearing < 202.5) return '⬇️'; // South
  if (bearing >= 202.5 && bearing < 247.5) return '↙️'; // South-West
  if (bearing >= 247.5 && bearing < 292.5) return '⬅️'; // West
  if (bearing >= 292.5 && bearing < 337.5) return '↖️'; // North-West
  return '🎯';
}

/**
 * Calculates complete geographic feedback between guessed and target coordinates
 */
export function calculateGeoFeedback(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): GeoFeedback {
  const distanceKm = getHaversineDistance(lat1, lng1, lat2, lng2);
  const distanceMiles = Math.round(distanceKm * 0.621371);
  const bearingDeg = Math.round(getCompassBearing(lat1, lng1, lat2, lng2));
  const directionArrow = distanceKm === 0 ? '🎯' : getDirectionArrow(bearingDeg);

  // Earth max half circumference is ~20,015 km
  const maxEarthDist = 20015;
  const proximityPercent = Math.max(
    0,
    Math.min(100, Math.round(100 - (distanceKm / maxEarthDist) * 100))
  );

  return {
    distanceKm,
    distanceMiles,
    bearingDeg,
    directionArrow,
    proximityPercent,
  };
}

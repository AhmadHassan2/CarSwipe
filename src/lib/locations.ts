export type City = { name: string; province: string; lat: number; lng: number };

// Cities we geocode locally so radius search works without an external API.
export const CITIES: City[] = [
  { name: "Toronto", province: "ON", lat: 43.6532, lng: -79.3832 },
  { name: "Mississauga", province: "ON", lat: 43.589, lng: -79.6441 },
  { name: "Brampton", province: "ON", lat: 43.7315, lng: -79.7624 },
  { name: "Oakville", province: "ON", lat: 43.4675, lng: -79.6877 },
  { name: "Vaughan", province: "ON", lat: 43.8361, lng: -79.4983 },
  { name: "Hamilton", province: "ON", lat: 43.2557, lng: -79.8711 },
  { name: "Markham", province: "ON", lat: 43.8561, lng: -79.337 },
  { name: "Richmond Hill", province: "ON", lat: 43.8828, lng: -79.4403 },
  { name: "Burlington", province: "ON", lat: 43.3255, lng: -79.799 },
  { name: "Milton", province: "ON", lat: 43.5183, lng: -79.8774 },
  { name: "Pickering", province: "ON", lat: 43.8384, lng: -79.0868 },
  { name: "Oshawa", province: "ON", lat: 43.8971, lng: -78.8658 },
  { name: "Kitchener", province: "ON", lat: 43.4516, lng: -80.4925 },
  { name: "Guelph", province: "ON", lat: 43.5448, lng: -80.2482 },
  { name: "London", province: "ON", lat: 42.9849, lng: -81.2453 },
  { name: "Ottawa", province: "ON", lat: 45.4215, lng: -75.6972 },
];

export function cityLabel(city: City) {
  return `${city.name}, ${city.province}`;
}

export function findCity(label: string | null | undefined): City | undefined {
  if (!label) return undefined;
  const name = label.split(",")[0]?.trim().toLowerCase();
  return CITIES.find((c) => c.name.toLowerCase() === name);
}

const EARTH_RADIUS_KM = 6371;

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Lat/lng bounding box that fully contains a circle of `radiusKm`. */
export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const dLat = radiusKm / 111.32;
  const dLng = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return { minLat: lat - dLat, maxLat: lat + dLat, minLng: lng - dLng, maxLng: lng + dLng };
}

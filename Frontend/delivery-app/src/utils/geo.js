/**
 * Geo helpers for the delivery map.
 *
 * All network calls here hit free, key-less OpenStreetMap-ecosystem services:
 *   - routing:   router.project-osrm.org  (OSRM demo server)
 *   - geocoding: nominatim.openstreetmap.org
 * These are public demo endpoints with strict fair-use limits. Swap the base
 * URLs below for a self-hosted OSRM/Nominatim (or a paid provider) before
 * putting real traffic through them.
 */

export const OSRM_BASE = import.meta.env.VITE_OSRM_URL || 'https://router.project-osrm.org';
export const NOMINATIM_BASE =
  import.meta.env.VITE_NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

// Fallback centre used before the browser grants geolocation.
export const DEFAULT_CENTER = { lat: 23.1852, lng: 77.0180 }; // Kothri Kalan, Sehore, Bhopal, MP, India
export const DEFAULT_ZOOM = 12;

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres between two {lat,lng} points. */
export const haversineKm = (a, b) => {
  if (!a || !b) return 0;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
};

export const formatDistance = (km) => {
  if (km == null || Number.isNaN(km)) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
};

export const formatDuration = (minutes) => {
  if (minutes == null || Number.isNaN(minutes)) return '—';
  const mins = Math.max(1, Math.round(minutes));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
};

/** ETA clock time, e.g. "7:42 pm", from now + duration. */
export const etaClock = (minutes) => {
  if (minutes == null || Number.isNaN(minutes)) return '—';
  const at = new Date(Date.now() + Math.max(0, minutes) * 60_000);
  return at.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
};

/** Rough riding time when no route is available: ~22 km/h city average. */
export const estimateMinutes = (km, kmph = 22) => (km / kmph) * 60;

/**
 * Fetch a driving route through the given waypoints.
 * @param {Array<{lat:number,lng:number}>} points at least two
 * @returns {Promise<{coords: Array<[number,number]>, distanceKm: number, durationMin: number}>}
 */
export const fetchOsrmRoute = async (points, { signal } = {}) => {
  const valid = (points || []).filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length < 2) throw new Error('At least two waypoints are required');

  const path = valid.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `${OSRM_BASE}/route/v1/driving/${path}?overview=full&geometries=geojson&alternatives=false&steps=false`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Routing failed (${res.status})`);

  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(data.message || 'No route found');
  }

  const route = data.routes[0];
  return {
    // GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
    coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
  };
};

/** Free-text address search. Returns up to `limit` suggestions. */
export const searchPlaces = async (query, { limit = 5, signal } = {}) => {
  const q = (query || '').trim();
  if (q.length < 3) return [];

  const url = `${NOMINATIM_BASE}/search?format=jsonv2&limit=${limit}&countrycodes=in&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);

  const data = await res.json();
  return data.map((item) => ({
    id: `${item.osm_type}-${item.osm_id}`,
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));
};

/** Reverse geocode a coordinate into a human-readable address. */
export const reverseGeocode = async ({ lat, lng }, { signal } = {}) => {
  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Reverse geocode failed (${res.status})`);
  const data = await res.json();
  return data.display_name || null;
};

/** Bounding box covering every point, as Leaflet's [[lat,lng],[lat,lng]]. */
export const boundsOf = (points) => {
  const valid = (points || []).filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (!valid.length) return null;
  const lats = valid.map((p) => p.lat);
  const lngs = valid.map((p) => p.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
};

/**
 * Hand off to whatever navigation app the device has.
 * Google Maps' universal URL resolves to the native app on Android/iOS and to
 * the web app on desktop — no SDK or API key involved.
 */
export const buildNavUrl = (destination, origin) => {
  if (!destination) return '#';
  const dest = `${destination.lat},${destination.lng}`;
  const params = new URLSearchParams({ api: '1', destination: dest, travelmode: 'driving' });
  if (origin && Number.isFinite(origin.lat)) params.set('origin', `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

/** Nearest-neighbour ordering of stops from a starting point. */
export const orderByProximity = (start, stops) => {
  const remaining = [...(stops || [])];
  const ordered = [];
  let cursor = start;

  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((stop, index) => {
      const d = haversineKm(cursor, stop);
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = index;
      }
    });
    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    cursor = next;
  }

  return ordered;
};

import { useEffect, useRef, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { fetchOsrmRoute, haversineKm, estimateMinutes } from '../../utils/geo';

/**
 * Draws a road-following route through `waypoints` and reports its metrics.
 *
 * Falls back to a straight dashed line with a haversine estimate when the OSRM
 * demo server is unreachable or rate-limits us, so the map never goes blank.
 *
 * @param {Array<{lat:number,lng:number}>} waypoints
 * @param {(summary:{distanceKm:number,durationMin:number,isEstimate:boolean,error:string|null}) => void} onRoute
 * @param {boolean} fit  pan/zoom the map to the route once it resolves
 */
export default function RouteLayer({
  waypoints = [],
  color = '#2179F5',
  weight = 5,
  onRoute,
  fit = false,
}) {
  const map = useMap();
  const [coords, setCoords] = useState([]);
  const [isEstimate, setIsEstimate] = useState(false);
  const onRouteRef = useRef(onRoute);

  // Keep the latest callback without making it a fetch dependency.
  useEffect(() => {
    onRouteRef.current = onRoute;
  }, [onRoute]);

  // Round coordinates into the key so sub-metre GPS jitter doesn't re-fetch.
  const key = waypoints
    .filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`)
    .join('|');

  useEffect(() => {
    const points = key.split('|').filter(Boolean).map((pair) => {
      const [lat, lng] = pair.split(',').map(Number);
      return { lat, lng };
    });

    if (points.length < 2) {
      setCoords([]);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    const straightLineFallback = (message) => {
      if (cancelled) return;
      const line = points.map((p) => [p.lat, p.lng]);
      let km = 0;
      for (let i = 1; i < points.length; i += 1) km += haversineKm(points[i - 1], points[i]);
      setCoords(line);
      setIsEstimate(true);
      onRouteRef.current?.({
        distanceKm: km,
        durationMin: estimateMinutes(km),
        isEstimate: true,
        error: message,
        coords: line,
      });
    };

    fetchOsrmRoute(points, { signal: controller.signal })
      .then((route) => {
        if (cancelled) return;
        setCoords(route.coords);
        setIsEstimate(false);
        onRouteRef.current?.({ ...route, isEstimate: false, error: null });
      })
      .catch((err) => {
        if (err.name === 'AbortError' || cancelled) return;
        straightLineFallback(err.message || 'Live routing unavailable — showing a direct estimate.');
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [key]);

  useEffect(() => {
    if (!fit || coords.length < 2) return;
    map.fitBounds(coords, { padding: [48, 48], maxZoom: 16 });
  }, [fit, coords, map]);

  if (coords.length < 2) return null;

  return (
    <>
      {/* Casing underneath gives the route contrast over busy tiles. */}
      <Polyline positions={coords} pathOptions={{ color: '#ffffff', weight: weight + 4, opacity: 0.85 }} />
      <Polyline
        positions={coords}
        pathOptions={{
          color,
          weight,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: isEstimate ? '10 10' : undefined,
        }}
      />
    </>
  );
}

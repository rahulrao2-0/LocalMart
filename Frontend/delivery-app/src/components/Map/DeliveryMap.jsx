import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { Box, Fab, Tooltip, Typography, Stack, useTheme } from '@mui/material';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import ZoomOutMapRoundedIcon from '@mui/icons-material/ZoomOutMapRounded';
import { driverIcon, pinIcon, PIN_COLORS } from './mapIcons';
import RouteLayer from './RouteLayer';
import { DEFAULT_CENTER, DEFAULT_ZOOM, boundsOf } from '../../utils/geo';

const TILES = {
  light: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    subdomains: 'abc',
  },
  dark: {
    // CARTO's free basemap — no key, same OSM data, dark palette.
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd',
  },
};

/** Re-fits the viewport whenever the set of points to show changes. */
function FitBounds({ points, padding = 56, maxZoom = 16 }) {
  const map = useMap();
  const key = (points || [])
    .filter(Boolean)
    .map((p) => `${p.lat?.toFixed(4)},${p.lng?.toFixed(4)}`)
    .join('|');

  useEffect(() => {
    const bounds = boundsOf(points);
    if (!bounds) return;
    const [[minLat, minLng], [maxLat, maxLng]] = bounds;
    if (minLat === maxLat && minLng === maxLng) {
      map.setView([minLat, minLng], Math.min(maxZoom, 15));
      return;
    }
    map.fitBounds(bounds, { padding: [padding, padding], maxZoom });
    // `key` is the stable identity of `points`; comparing the array itself would
    // refit on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map, padding, maxZoom]);

  return null;
}

/** Keeps the driver marker centred while `follow` is on. */
function FollowDriver({ position, enabled }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || !position) return;
    map.panTo([position.lat, position.lng], { animate: true, duration: 0.6 });
  }, [enabled, position?.lat, position?.lng, map]);

  return null;
}

/**
 * Leaflet caches the container size, so a sidebar collapse or a tab switch
 * leaves grey gaps until we tell it to re-measure.
 */
function ResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const target = map.getContainer();
    const invalidate = () => map.invalidateSize({ animate: false });

    const observer = new ResizeObserver(invalidate);
    observer.observe(target);
    window.addEventListener('orientationchange', invalidate);

    // One deferred pass catches the initial mount inside collapsing panels.
    const timer = setTimeout(invalidate, 240);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', invalidate);
      clearTimeout(timer);
    };
  }, [map]);

  return null;
}

/**
 * Reusable Leaflet map for the delivery app.
 *
 * @param {{lat:number,lng:number}}           driver     live rider position
 * @param {Array}                             markers    [{ id, position, label, color, title, subtitle }]
 * @param {Array<{lat:number,lng:number}>}    route      waypoints to route through
 * @param {Array<[number,number]>}            trail      breadcrumb of past positions
 * @param {boolean}                           follow     keep the driver centred
 * @param {boolean}                           fitAll     fit driver + markers on change
 * @param {boolean}                           compact    hide overlay buttons (dashboard widget)
 */
export default function DeliveryMap({
  height = 360,
  center,
  zoom = DEFAULT_ZOOM,
  driver = null,
  accuracy = null,
  markers = [],
  route = null,
  trail = [],
  onRoute,
  follow = false,
  fitAll = true,
  compact = false,
  interactive = true,
  onMarkerClick,
  onReady,
  children,
  sx,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const tiles = isDark ? TILES.dark : TILES.light;
  const [map, setMap] = useState(null);
  const initialCenter = useRef(center || driver || markers[0]?.position || DEFAULT_CENTER);

  // Hand the Leaflet instance up so pages can fly to search results.
  const handleRef = (instance) => {
    setMap(instance);
    if (instance) onReady?.(instance);
  };

  const fitPoints = useMemo(() => {
    const points = markers.map((m) => m.position).filter(Boolean);
    if (driver) points.unshift(driver);
    return points;
  }, [markers, driver]);

  const recenter = () => {
    if (!map) return;
    const target = driver || initialCenter.current;
    map.setView([target.lat, target.lng], Math.max(map.getZoom(), 15), { animate: true });
  };

  const fitEverything = () => {
    const bounds = boundsOf(fitPoints);
    if (map && bounds) map.fitBounds(bounds, { padding: [56, 56], maxZoom: 16 });
  };

  return (
    <Box
      className={isDark ? 'lm-dark' : undefined}
      sx={{
        position: 'relative',
        height,
        width: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.subtle',
        '& .leaflet-container': { height: '100%', width: '100%' },
        ...sx,
      }}
    >
      <MapContainer
        ref={handleRef}
        center={[initialCenter.current.lat, initialCenter.current.lng]}
        zoom={zoom}
        zoomControl={!compact && interactive}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        keyboard={interactive}
        attributionControl
      >
        <TileLayer
          key={isDark ? 'dark' : 'light'}
          url={tiles.url}
          attribution={tiles.attribution}
          maxZoom={tiles.maxZoom}
          subdomains={tiles.subdomains}
          detectRetina
        />

        <ResizeHandler />
        {fitAll && fitPoints.length > 0 && <FitBounds points={fitPoints} />}
        <FollowDriver position={driver} enabled={follow} />

        {/* GPS accuracy halo */}
        {driver && accuracy > 0 && (
          <Circle
            center={[driver.lat, driver.lng]}
            radius={Math.min(accuracy, 400)}
            pathOptions={{ color: '#2179F5', fillColor: '#2179F5', fillOpacity: 0.1, weight: 1 }}
          />
        )}

        {trail.length > 1 && (
          <Polyline
            positions={trail}
            pathOptions={{ color: '#94A3B8', weight: 3, opacity: 0.7, dashArray: '4 8' }}
          />
        )}

        {route && route.length >= 2 && (
          <RouteLayer waypoints={route} onRoute={onRoute} color={isDark ? '#4D9CFF' : '#2179F5'} />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={pinIcon(marker.label ?? '', marker.color || PIN_COLORS.drop)}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(marker) } : undefined}
          >
            {(marker.title || marker.subtitle) && (
              <Popup>
                <Stack spacing={0.25}>
                  {marker.title && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {marker.title}
                    </Typography>
                  )}
                  {marker.subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {marker.subtitle}
                    </Typography>
                  )}
                  {marker.meta && (
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {marker.meta}
                    </Typography>
                  )}
                </Stack>
              </Popup>
            )}
          </Marker>
        ))}

        {driver && <Marker position={[driver.lat, driver.lng]} icon={driverIcon()} zIndexOffset={1000} />}
      </MapContainer>

      {!compact && (
        <Stack
          spacing={1}
          sx={{ position: 'absolute', right: 12, bottom: 28, zIndex: 500 }}
        >
          {fitPoints.length > 1 && (
            <Tooltip title="Fit all stops" placement="left">
              <Fab size="small" onClick={fitEverything} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
                <ZoomOutMapRoundedIcon fontSize="small" />
              </Fab>
            </Tooltip>
          )}
          <Tooltip title="Centre on me" placement="left">
            <Fab size="small" color="primary" onClick={recenter}>
              <MyLocationRoundedIcon fontSize="small" />
            </Fab>
          </Tooltip>
        </Stack>
      )}

      {children}
    </Box>
  );
}

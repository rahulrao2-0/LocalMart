import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_CENTER } from '../utils/geo';

const ERROR_MESSAGES = {
  1: 'Location permission denied. Enable it in your browser settings to track your route.',
  2: 'Location unavailable — check that GPS or location services are switched on.',
  3: 'Timed out while locating you. Retrying may help.',
};

/**
 * Watches the device position.
 *
 * No credentials required: this is the browser's built-in Geolocation API. It
 * does need a secure context — https, or http://localhost during development.
 *
 * @param {object}  options
 * @param {boolean} options.watch   keep tracking (default true)
 * @param {boolean} options.enabled set false to stop/skip tracking entirely
 */
export default function useGeolocation({ watch = true, enabled = true } = {}) {
  const [position, setPosition] = useState(null); // { lat, lng, accuracy, heading, speed, at }
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | locating | ready | error | unsupported
  const watchIdRef = useRef(null);
  const trailRef = useRef([]);
  const [trail, setTrail] = useState([]);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((pos) => {
    const next = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      at: pos.timestamp,
    };
    setPosition(next);
    setError(null);
    setStatus('ready');

    // Keep a short breadcrumb trail so the map can draw where the rider's been.
    const point = [next.lat, next.lng];
    const last = trailRef.current[trailRef.current.length - 1];
    if (!last || last[0] !== point[0] || last[1] !== point[1]) {
      trailRef.current = [...trailRef.current, point].slice(-120);
      setTrail(trailRef.current);
    }
  }, []);

  const handleError = useCallback((err) => {
    setError(ERROR_MESSAGES[err.code] || err.message || 'Could not determine your location.');
    setStatus('error');
  }, []);

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      setError('This browser does not support location tracking.');
      return;
    }

    clearWatch();
    setStatus('locating');

    const opts = { enableHighAccuracy: true, timeout: 12_000, maximumAge: 5_000 };

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, opts);
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, opts);
    }
  }, [clearWatch, handleError, handleSuccess, watch]);

  useEffect(() => {
    if (!enabled) {
      clearWatch();
      setStatus('idle');
      return undefined;
    }
    start();
    return clearWatch;
  }, [enabled, start, clearWatch]);

  const resetTrail = useCallback(() => {
    trailRef.current = [];
    setTrail([]);
  }, []);

  return {
    position,
    // Callers that just need somewhere to point the map get a sane default.
    coords: position || DEFAULT_CENTER,
    isFallback: !position,
    accuracy: position?.accuracy ?? null,
    trail,
    error,
    status,
    isLocating: status === 'locating',
    refresh: start,
    resetTrail,
  };
}

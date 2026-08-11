import L from 'leaflet';

/**
 * Marker factories built on Leaflet's divIcon.
 *
 * Deliberately avoiding Leaflet's default PNG markers: their URLs are resolved
 * relative to the CSS at runtime, which breaks under Vite's asset hashing.
 * divIcons are plain DOM, styled in src/index.css (.lm-driver-dot / .lm-pin).
 */

export const driverIcon = () =>
  L.divIcon({
    className: 'lm-marker',
    html: '<div class="lm-driver-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[char];
  });

/**
 * Teardrop pin with a label inside.
 * @param {string|number} label short text, e.g. a stop number or "P"
 * @param {string} color CSS colour
 */
export const pinIcon = (label = '', color = '#FF5C1A') =>
  L.divIcon({
    className: 'lm-marker',
    html: `<div class="lm-pin" style="background:${escapeHtml(color)}"><span>${escapeHtml(label)}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });

export const PIN_COLORS = {
  pickup: '#2179F5',
  drop: '#FF5C1A',
  done: '#12B76A',
  warning: '#F79009',
  neutral: '#64748B',
};

export const pickupIcon = (label = 'P') => pinIcon(label, PIN_COLORS.pickup);
export const dropIcon = (label = 'D') => pinIcon(label, PIN_COLORS.drop);

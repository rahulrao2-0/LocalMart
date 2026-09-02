import { apiRequest } from './api';

/**
 * Full-text product search with filters
 * @param {Object} params - Search parameters (q, category, minPrice, maxPrice, brand, sortBy, page, limit)
 */
export const searchProducts = async (params) => {
  // Clean up undefined or null params
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  const queryParams = new URLSearchParams(cleanParams).toString();
  return await apiRequest(`/search/products?${queryParams}`);
};

/**
 * Autocomplete / typeahead suggestions
 * @param {string} q - Search query
 * @param {number} limit - Maximum number of suggestions to return
 */
export const getAutocompleteSuggestions = async (q, limit = 7) => {
  const queryParams = new URLSearchParams({ q, limit }).toString();
  return await apiRequest(`/search/autocomplete?${queryParams}`);
};

/**
 * Search sellers nearby (geo search)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} radius - Search radius (e.g., '10km')
 * @param {string} q - Optional search query for seller name or category
 */
export const searchSellersNearby = async (lat, lng, radius, q) => {
  const params = { lat, lng, radius };
  if (q) params.q = q;
  
  const queryParams = new URLSearchParams(params).toString();
  return await apiRequest(`/search/sellers/nearby?${queryParams}`);
};

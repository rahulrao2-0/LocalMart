export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const getAccessToken = () => localStorage.getItem('delivery_access_token');
export const getRefreshToken = () => localStorage.getItem('delivery_refresh_token');

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('delivery_access_token', accessToken);
  if (refreshToken) localStorage.setItem('delivery_refresh_token', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('delivery_access_token');
  localStorage.removeItem('delivery_refresh_token');
  localStorage.removeItem('delivery_user');
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  let token = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    signal: options.signal || AbortSignal.timeout(3000),
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401 && token) {
    try {
      token = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
      fetchOptions.headers = headers;
      response = await fetch(url, fetchOptions);
    } catch (error) {
      console.error('Token refresh failed:', error);
      return Promise.reject(error);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || response.statusText || 'API Error');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

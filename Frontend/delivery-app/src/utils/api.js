export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const clearTokens = () => {
  localStorage.removeItem('delivery_user');
};

const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return data;
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // THIS is what allows HttpOnly cookies (tokens) to be sent securely!
    signal: options.signal || AbortSignal.timeout(3000),
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    try {
      await refreshAccessToken();
      // Retry the original request since cookies were just refreshed
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

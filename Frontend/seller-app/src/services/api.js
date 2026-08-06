const API_BASE_URL = 'http://localhost:3000/api/v1';

let isRefreshing = false;
let refreshPromise = null;

const refreshToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Token refresh failed');
  }
  return data;
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Prepare headers
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type to JSON if it's not a FormData object
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include' 
  };

  let response = await fetch(url, fetchOptions);

  // If 401 Unauthorized, attempt automatic token refresh before giving up
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    try {
      const refreshResult = await refreshPromise;
      if (refreshResult && refreshResult.success) {
        // Retry the original request with the newly issued access cookie
        response = await fetch(url, fetchOptions);
      }
    } catch (refreshError) {
      // Refresh token is also expired or invalid -> log out
      localStorage.removeItem('seller_user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw refreshError;
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || response.statusText);
    error.response = {
      status: response.status,
      data: data
    };
    throw error;
  }

  return {
    status: response.status,
    data: data
  };
};

export default apiFetch;

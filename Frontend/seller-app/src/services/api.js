const API_BASE_URL = 'http://localhost:3000/api/v1';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Prepare headers
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type to JSON if it's not a FormData object (browser sets correct boundary for FormData automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    ...options,
    headers,
    // CRITICAL: This ensures cookies (including HttpOnly access/refresh tokens) are always sent to the API Gateway!
    credentials: 'include' 
  };

  let response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    localStorage.removeItem('seller_user');
    
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  let data;
  try {
    // Try parsing JSON response
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    // Mimic Axios error structure for compatibility with existing slices
    const error = new Error(data?.message || response.statusText);
    error.response = {
      status: response.status,
      data: data
    };
    throw error;
  }

  // Mimic Axios response structure
  return {
    status: response.status,
    data: data
  };
};

export default apiFetch;

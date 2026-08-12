// src/services/api.js

const BASE_URL = "http://localhost:3000/api/v1";

let isRefreshing = false;
let refreshPromise = null;

export const apiRequest = async (
  endpoint,
  options = {},
  retry = true
) => {
  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // Access token expired
  if (response.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true;

      refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        isRefreshing = false;
      });
    }

    // Capture reference before it can be nulled by another caller
    const currentRefreshPromise = refreshPromise;
    const refreshResponse = await currentRefreshPromise;

    // Clear the shared promise after resolution
    if (refreshPromise === currentRefreshPromise) {
      refreshPromise = null;
    }

    if (refreshResponse && refreshResponse.ok) {
      // Retry original request with newly issued access token
      return apiRequest(endpoint, options, false);
    }

    // Refresh token also expired or invalid — only redirect if not already on login
    if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }


  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // Fallback to HTTP status text
      }
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};
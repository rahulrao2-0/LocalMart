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
        refreshPromise = null;
      });
    }

    const refreshResponse = await refreshPromise;

    if (refreshResponse && refreshResponse.ok) {
      // Retry original request with newly issued access token
      return apiRequest(endpoint, options, false);
    }

    // Refresh token also expired or invalid
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }


  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
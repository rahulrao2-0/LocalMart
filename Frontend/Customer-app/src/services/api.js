// src/services/api.js

const BASE_URL = "http://localhost:3000/api/v1";

let isRefreshing = false;

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
    // Prevent multiple refresh requests
    if (!isRefreshing) {
      isRefreshing = true;

      const refreshResponse = await fetch(
        `${BASE_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      isRefreshing = false;

      if (refreshResponse.ok) {
        // Retry original request
        return apiRequest(endpoint, options, false);
      }

      // Refresh token also expired
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    throw new Error("Refreshing token...");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
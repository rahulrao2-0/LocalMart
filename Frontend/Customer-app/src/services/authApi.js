export const loginUser = async (credentials) => {
  const response = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = data.message || data.error || "Login failed.";
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) errorMessage += ` (Try again in ${Math.ceil(retryAfter)}s)`;
    }
    throw new Error(errorMessage);
  }

  return data;
};

export const refreshTokenApi = async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = data.message || "Failed to refresh token.";
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) errorMessage += ` (Try again in ${Math.ceil(retryAfter)}s)`;
    }
    throw new Error(errorMessage);
  }

  return data;
};

export const resendOtpApi = async (email) => {
  const response = await fetch("http://localhost:3000/api/v1/auth/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = data.message || data.error || "Failed to resend OTP.";
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) errorMessage += ` (Try again in ${Math.ceil(retryAfter)}s)`;
    }
    throw new Error(errorMessage);
  }

  return data;
};

export const logoutUserApi = async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to logout.");
  }

  return data;
};

export const getCurrentUser = async () => {
  try {
    return await fetchWithAuth("http://localhost:3000/api/v1/auth/me");
  } catch (error) {
    // Return null when unauthenticated on initial boot
    return null;
  }
};

let isRefreshingAuth = false;
let refreshAuthPromise = null;

// Automatic 401 handling wrapper (Interposes token refresh seamlessly)
export const fetchWithAuth = async (url, options = {}) => {
  const fetchOptions = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  let response = await fetch(url, fetchOptions);

  // If 401 Unauthorized (Access token expired/invalid), attempt automatic refresh
  if (response.status === 401) {
    if (!isRefreshingAuth) {
      isRefreshingAuth = true;
      refreshAuthPromise = refreshTokenApi().finally(() => {
        isRefreshingAuth = false;
        refreshAuthPromise = null;
      });
    }

    try {
      const refreshData = await refreshAuthPromise;
      if (refreshData && refreshData.success) {
        // Retry original request with newly issued access cookie
        response = await fetch(url, fetchOptions);
      }
    } catch (refreshErr) {
      // If refresh token is revoked or expired (unauthorized), redirect to login
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = data.message || "Request failed.";
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) errorMessage += ` (Try again in ${Math.ceil(retryAfter)}s)`;
    }
    throw new Error(errorMessage);
  }

  return data;
};



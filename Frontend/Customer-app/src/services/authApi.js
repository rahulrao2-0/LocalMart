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
    throw new Error(data.message || data.error || "Login failed.");
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
    throw new Error(data.message || "Failed to refresh token.");
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
    throw new Error(data.message || data.error || "Failed to resend OTP.");
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
  return fetchWithAuth("http://localhost:3000/api/v1/auth/me");
};

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
    try {
      const refreshData = await refreshTokenApi();
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
    throw new Error(data.message || "Request failed.");
  }

  return data;
};



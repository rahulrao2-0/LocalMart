import { apiRequest } from "./api.js";

// Fetch user profile from user-service via API Gateway (/api/v1/users/profile)
export const getProfileApi = async () => {
  return await apiRequest("/users/profile", { method: "GET" });
};
export const updateProfileApi = async (profileData) => {
  return await apiRequest("/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

// Delete profile
export const deleteProfileApi = async () => {
  return await apiRequest("/users/profile", { method: "DELETE" });
};

// Upload profile avatar to Cloudinary via user-service
export const uploadAvatarApi = async (formData) => {
  const response = await fetch("http://127.0.0.1:3000/api/v1/users/profile/avatar", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to upload profile picture";
    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {}
    }
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

// Manage Addresses
export const addAddressApi = async (addressData) => {
  return await apiRequest("/users/address", {
    method: "POST",
    body: JSON.stringify(addressData),
  });
};

export const updateAddressApi = async (addressId, addressData) => {
  return await apiRequest(`/users/address/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(addressData),
  });
};

export const deleteAddressApi = async (addressId) => {
  return await apiRequest(`/users/address/${addressId}`, {
    method: "DELETE",
  });
};

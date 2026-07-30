import { apiRequest } from "./api.js";

// Fetch user profile from user-service via API Gateway (/api/v1/users/profile)
export const getProfileApi = async () => {
  return await apiRequest("/users/profile", { method: "GET" });
};

// Update personal profile information (fullName, phone, bio)
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
  const response = await fetch("http://localhost:3000/api/v1/users/profile/avatar", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload profile picture");
  }

  return response.json();
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

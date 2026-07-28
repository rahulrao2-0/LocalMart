const BASE_URL = "http://localhost:3000/api/v1/auth";

export const getCurrentUser = async () => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return await response.json();
};
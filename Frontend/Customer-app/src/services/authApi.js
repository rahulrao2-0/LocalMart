export const getCurrentUser = async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user session.");
  }

  return data;
};

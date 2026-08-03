// src/services/productApi.js
const API_BASE_URL = 'http://localhost:3000/api/v1'; // Adjusted port to 3000 (API Gateway)

export const fetchProducts = async (page = 1, category = "", keyword = "") => {
  try {
    let url = `${API_BASE_URL}/products?page=${page}`;
    if (category && category !== "All" && category !== "General") url += `&category=${category}`;
    if (keyword) url += `&keyword=${keyword}`;

    const response = await fetch(url, {
      method: "GET", // Changed from POST to GET
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    throw error;
  }
};

export const fetchProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchProductById:", error);
    throw error;
  }
};

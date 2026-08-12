import { apiRequest } from "./api.js";

// Fetch user cart from cart-service via API Gateway (/api/v1/cart)
export const getCartApi = async () => {
  return await apiRequest("/cart", { method: "GET" });
};

// Add item to cart
export const addItemToCartApi = async (productId, quantity = 1) => {
  return await apiRequest("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
};

// Update item quantity in cart
export const updateCartItemQuantityApi = async (productId, quantity) => {
  return await apiRequest(`/cart/items/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
};

// Remove item from cart
export const removeCartItemApi = async (productId) => {
  return await apiRequest(`/cart/items/${productId}`, {
    method: "DELETE",
  });
};

// Clear entire cart
export const clearCartApi = async () => {
  return await apiRequest("/cart", {
    method: "DELETE",
  });
};

// Checkout cart
export const checkoutCartApi = async () => {
  return await apiRequest("/cart/checkout", {
    method: "POST",
  });
};

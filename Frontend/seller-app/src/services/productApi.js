import apiFetch from './api';

export const fetchSellerProducts = async (sellerId) => {
  const url = sellerId ? `/products?sellerId=${sellerId}` : '/products';
  const response = await apiFetch(url);
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await apiFetch(`/products/${id}`);
  return response.data;
};

export const scanBarcode = async (barcode) => {
  const response = await apiFetch('/products/scan-barcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode })
  });
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await apiFetch('/products', {
    method: 'POST',
    body: productData
    // Note: We DO NOT set Content-Type header here manually.
    // fetch will automatically set it to 'multipart/form-data' with the correct boundary 
    // because productData is an instance of FormData.
  });
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: productData
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiFetch(`/products/${id}`, {
    method: 'DELETE'
  });
  return response.data;
};

import apiFetch from './api';

export const login = async (credentials) => {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return response.data;
};

export const register = async (userData) => {
  const response = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return response.data;
};

export const getMe = async () => {
  const response = await apiFetch('/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await apiFetch('/auth/logout', {
    method: 'POST'
  });
  return response.data;
};

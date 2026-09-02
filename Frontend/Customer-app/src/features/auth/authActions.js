import { getCurrentUser, loginUser, refreshTokenApi, logoutUserApi } from "../../services/authApi";
import { setUser, logout, setLoading, setError } from "./authSlice";

export const login = (credentials) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const data = await loginUser(credentials);
    if (data && data.user) {
      dispatch(setUser(data.user));
    }
    return data;
  } catch (error) {
    dispatch(setError(error.message || "Login failed"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const refreshAuth = () => async (dispatch) => {
  try {
    const data = await refreshTokenApi();
    if (data && data.user) {
      dispatch(setUser(data.user));
    }
    return data;
  } catch (error) {
    dispatch(logout());
    throw error;
  }
};

export const userLogout = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await logoutUserApi();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    dispatch(logout());
    dispatch(setLoading(false));
  }
};

export const checkAuth = () => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const data = await getCurrentUser();

    if (data && data.user) {
      dispatch(setUser(data.user));
    } else {
      dispatch(logout());
    }
  } catch (error) {
    dispatch(logout());
  } finally {
    dispatch(setLoading(false));
  }
};


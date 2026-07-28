import { getCurrentUser } from "../../services/authApi";
import { setUser, logout, setLoading } from "./authSlice";

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
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "../features/auth/authActions";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return null;
};

export default AuthInitializer;
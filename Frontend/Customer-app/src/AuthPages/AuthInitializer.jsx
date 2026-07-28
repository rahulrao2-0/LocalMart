import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "../features/auth/authActions";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return null;
}

import { useDispatch } from "react-redux";
import { register, login, getMe } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ email, username, password }) {
    try {
      dispatch(setLoading(true));

      const data = await register({
        email,
        username,
        password,
      });

      console.log("Register Success:", data);

      return data;
    } catch (err) {
      console.log("Register Error:", err.response?.data);

      dispatch(
        setError(err.response?.data?.message || "Registration failed")
      );

      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));

      const data = await login({
        email,
        password,
      });

      console.log("Login Success:", data);

      dispatch(setUser(data.user));

      return data;
    } catch (err) {
      console.log("Login Error:", err.response?.data);

      dispatch(
        setError(err.response?.data?.message || "Login failed")
      );

      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    try {
      dispatch(setLoading(true));

      const data = await getMe();

      dispatch(setUser(data.user));

      return data;
    } catch (err) {
      console.log("GetMe Error:", err.response?.data);

      dispatch(
        setError(err.response?.data?.message || "Failed to fetch user data")
      );

      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
  };
}
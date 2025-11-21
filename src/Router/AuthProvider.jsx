import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { endPoint } from "../Components/ForAPIs";
import LoadingScreen from "../Components/LoadingScreen";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("driverToken") || null);
  const [loading, setLoading] = useState(true);

  // 🔐 Attach token to every axios request automatically
  axios.interceptors.request.use((config) => {
    const savedToken = localStorage.getItem("driverToken");
    if (savedToken) {
      config.headers.Authorization = `Bearer ${savedToken}`;
    }
    return config;
  });

  // ✅ Load current user using token
  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem("driverToken");
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${endPoint}/user/me/driver`);
      setUser(data.user);
      setToken(savedToken); // 🔥 super important
    } catch (err) {
      console.error("Fetch user error:", err.response?.data || err.message);
      localStorage.removeItem("driverToken");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 🧾 Signup
  const signup = async (formData) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${endPoint}/user/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Login
  const login = async (formData) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${endPoint}/user/login`, formData);

      localStorage.setItem("driverToken", data.token);
      setToken(data.token);     // 🔥 store token in state
      setUser(data.user);       // 🔥 store user in state

      return data;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("driverToken");
    setUser(null);
    setToken(null);
  };

  if (loading) return <LoadingScreen />;

  const authInfo = {
    user,
    token,                 // 🔥 Now token is available in every component
    loading,
    signup,
    login,
    logout,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { endPoint } from "../Components/ForAPIs";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Attach token automatically to every request
  axios.interceptors.request.use((config) => {
    const driverToken = localStorage.getItem("driverToken");
    if (driverToken) {
      config.headers.Authorization = `Bearer ${driverToken}`;
    }
    return config;
  });

  // ✅ Fetch current user from backend using the token
  const fetchCurrentUser = async () => {
    const driverToken = localStorage.getItem("driverToken");
    if (!driverToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${endPoint}/user/me/driver`);
      setUser(data.user);
    } catch (err) {
      console.error("Fetch current user error:", err.response?.data || err.message);
      localStorage.removeItem("driverToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 🧾 Signup (no token saved)
  const signup = async (formData) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${endPoint}/user/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // ✅ Only create user, don’t auto-login
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
      setUser(data.user);
      return data;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const logout = async () => {
    localStorage.removeItem("driverToken");
    setUser(null);
  };

  const authInfo = { user, loading, signup, login, logout, fetchCurrentUser };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

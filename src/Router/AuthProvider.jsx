import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { endPoint } from "../Components/ForAPIs";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
 

  // ✅ Fetch current user from backend
const fetchCurrentUser = async () => {
    try {
      const { data } = await axios.get(`${endPoint}/user/me`, {
        withCredentials: true, // important!
      });
      setUser(data); // set the current user
    } catch (err) {
      setUser(null);
      console.error("Fetch current user error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Signup
  const signup = async (formData) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${endPoint}/user/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setUser(data.newUser);
      return data;
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (formData ) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${endPoint}/user/login`,
        formData ,
        { withCredentials: true }
      );
      setUser(data.user);
      return data;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(`${endPoint}/user/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const authInfo = { user, loading, signup, login, logout };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

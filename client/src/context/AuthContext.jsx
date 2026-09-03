import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      authAPI
        .getProfile()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
        });
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    const res = await authAPI.login(credentials);
    const { token, user: me } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(me));
    setUser(me);
    setLoading(false);
    return me;
  };

  const register = async (data) => {
    setLoading(true);
    const res = await authAPI.register(data);
    setLoading(false);
    return res.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

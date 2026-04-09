import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, accessToken: null });

  const login = async (payload) => {
    const { data } = await api.post("/api/auth/login", payload);
    setAuth({ user: data.user, accessToken: data.accessToken });
  };

  const signup = async (payload) => {
    await api.post("/api/auth/signup", payload);
  };

  const logout = async () => {
    if (auth.accessToken) {
      await api.post(
        "/api/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      );
    }
    setAuth({ user: null, accessToken: null });
  };

  const refresh = async () => {
    const { data } = await api.post("/api/auth/refresh");
    setAuth({ user: data.user, accessToken: data.accessToken });
  };

  const value = useMemo(() => ({ auth, login, logout, signup, refresh }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

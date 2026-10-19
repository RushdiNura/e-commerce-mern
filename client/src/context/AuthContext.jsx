import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authAPI } from "../services/api";
import {
  clearSession,
  getStoredUser,
  getToken,
  normalizeUser,
  saveSession,
  saveUser,
} from "../utils/session";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  // True while we verify a saved token with the server on first load.
  const [initializing, setInitializing] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) {
      setInitializing(false);
      return;
    }
    let cancelled = false;
    authAPI
      .getProfile()
      .then((res) => {
        if (cancelled) return;
        const me = normalizeUser(res.data.user);
        saveUser(me);
        setUser(me);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err.response?.status;
        // Token invalid / user deleted -> sign out. A network error keeps the cached user.
        if (status === 401 || status === 404) {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // api.js fires this when the server says the token is no longer valid.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const startSession = useCallback((data) => {
    const me = normalizeUser(data.user);
    saveSession(data.token, me);
    setUser(me);
    return me;
  }, []);

  const login = useCallback(
    async (credentials) => startSession((await authAPI.login(credentials)).data),
    [startSession]
  );

  const register = useCallback(
    async (details) => startSession((await authAPI.register(details)).data),
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      /* the token is cleared locally either way */
    }
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

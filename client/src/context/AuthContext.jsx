import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMyProfile } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cv_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMyProfile()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("cv_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      loginWithToken: async (token) => {
        localStorage.setItem("cv_token", token);
        const res = await getMyProfile();
        setUser(res.data.user);
      },
      logout: () => {
        localStorage.removeItem("cv_token");
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

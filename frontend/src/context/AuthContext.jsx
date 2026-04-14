import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../api/axiosClient";

// Création du contexte
const AuthContext = createContext();

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || localStorage.getItem("access_token") || null
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }, []);

  // Charger le profil si token existe
  useEffect(() => {
    async function fetchMe() {
      if (!token) return;

      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Erreur /auth/me", err);
        logout();
      }
    }

    fetchMe();
  }, [token, logout]);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });

    const receivedToken = res.data.token || res.data.access_token;
    const receivedUser = res.data.user || res.data.utilisateur;
    localStorage.setItem("token", receivedToken);
    localStorage.setItem("access_token", receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

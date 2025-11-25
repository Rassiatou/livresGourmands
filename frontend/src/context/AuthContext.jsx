import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosClient";

// Création du contexte
const AuthContext = createContext();

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("access_token") || null);

  // Charger le profil si token existe
  useEffect(() => {
    async function fetchMe() {
      if (!token) return;

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.utilisateur);
      } catch (err) {
        console.error("Erreur /auth/me", err);
        logout();
      }
    }

    fetchMe();
  }, [token]);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });

    const accessToken = res.data.access_token;
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
    setUser(res.data.utilisateur);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
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
export function useAuth() {
  return useContext(AuthContext);
}

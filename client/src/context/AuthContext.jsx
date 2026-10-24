// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";
import { translations } from "../data/translations.js";
import { sendStudentPresence } from "../services/socket.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("math_adventure_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("math_adventure_token") || "");
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(() => {
    return user?.settings?.language || localStorage.getItem("math_adventure_lang") || "en";
  });

  // Apply accessibility settings to DOM
  useEffect(() => {
    if (user?.settings?.highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    if (user?.settings?.fontScale) {
      document.documentElement.style.fontSize = `${16 * user.settings.fontScale}px`;
    } else {
      document.documentElement.style.fontSize = "16px";
    }

    if (user?.settings?.language) {
      setLanguage(user.settings.language);
      localStorage.setItem("math_adventure_lang", user.settings.language);
    }
  }, [user]);

  // Load fresh profile if token exists
  useEffect(() => {
    async function fetchMe() {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
          localStorage.setItem("math_adventure_user", JSON.stringify(res.data.user));
        } catch {
          // Token invalid or server sleeping
        }
      }
      setLoading(false);
    }
    fetchMe();
  }, [token]);

  // Periodic student presence broadcast to Admin Control Center
  useEffect(() => {
    if (!user || user.role === "admin" || user.role === "superadmin") return;

    sendStudentPresence(user);
    const interval = setInterval(() => {
      sendStudentPresence(user);
    }, 25000);

    return () => clearInterval(interval);
  }, [user]);

  const saveAuth = (tok, usr) => {
    setToken(tok);
    setUser(usr);
    localStorage.setItem("math_adventure_token", tok);
    localStorage.setItem("math_adventure_user", JSON.stringify(usr));
  };

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const guestLogin = async () => {
    const res = await api.post("/auth/guest");
    saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("math_adventure_token");
    localStorage.removeItem("math_adventure_user");
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      localStorage.setItem("math_adventure_user", JSON.stringify(res.data.user));
    } catch {}
  };

  const updateProfile = async (updates) => {
    const res = await api.patch("/auth/users/me", updates);
    setUser(res.data.user);
    localStorage.setItem("math_adventure_user", JSON.stringify(res.data.user));
    return res.data.user;
  };

  const toggleLanguage = (lang) => {
    const newLang = lang || (language === "en" ? "ta" : "en");
    setLanguage(newLang);
    localStorage.setItem("math_adventure_lang", newLang);
    if (user) {
      updateProfile({
        settings: {
          ...(user.settings || {}),
          language: newLang,
        },
      });
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        language,
        t,
        login,
        register,
        guestLogin,
        logout,
        refreshUser,
        updateProfile,
        toggleLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

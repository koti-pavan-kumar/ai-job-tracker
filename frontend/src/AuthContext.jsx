import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const API_BASE = "https://ai-job-tracker-backend-8urc.onrender.com"; // Centralized Source of Truth

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [username, setUsername] = useState("");

  // Sync token changes automatically with local storage context
  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  const logout = () => {
    setToken("");
    setUsername("");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, username, setUsername, logout, apiBase: API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components can pull auth variables cleanly
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be executed within an AuthProvider container wrap.");
  }
  return context;
}
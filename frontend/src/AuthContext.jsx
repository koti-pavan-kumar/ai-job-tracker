import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const API_BASE = "https://ai-job-tracker-backend-8urc.onrender.com"; 

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [username, setUsername] = useState(localStorage.getItem("authUsername") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  useEffect(() => {
    if (username) {
      localStorage.setItem("authUsername", username);
    } else {
      localStorage.removeItem("authUsername");
    }
  }, [username]);

  const logout = () => {
    setToken("");
    setUsername("");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUsername");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, username, setUsername, logout, apiBase: API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be executed within an AuthProvider container wrap.");
  }
  return context;
}
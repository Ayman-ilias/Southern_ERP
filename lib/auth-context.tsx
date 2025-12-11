"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  designation: string;
  is_active: boolean;
  is_superuser: boolean;
  department_access?: string[]; // Array of department IDs user can access
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for cookies
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for existing token on mount
    if (process.env.NODE_ENV === "development") {
      console.log("[AuthProvider] Initializing authentication...");
    }
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const cookieToken = getCookie("auth_token");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setCookie("auth_token", storedToken);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[AuthProvider] Error parsing stored user:", error);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        deleteCookie("auth_token");
      }
    } else if (cookieToken && !storedToken) {
      // Cookie exists but no localStorage - clear the stale cookie
      deleteCookie("auth_token");
    }
    setIsLoading(false);
  }, []);

  // Redirect to login if on protected route without user
  useEffect(() => {
    if (!isLoading && !user && pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/login")) {
      router.push("/dashboard/login");
    }
  }, [isLoading, user, pathname, router]);

  const login = async (username: string, password: string) => {
    try {
      // Login request
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const error = await response.json();
          errorMessage = typeof error.detail === 'string'
            ? error.detail
            : JSON.stringify(error.detail || error);
        } catch (e) {
          errorMessage = `Login failed with status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Get user info
      const userResponse = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: {
          "Authorization": `Bearer ${data.access_token}`,
        },
      });

      const userData = await userResponse.json();

      // Store in state
      setToken(data.access_token);
      setUser(userData);

      // Store in localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Store in cookie for middleware
      setCookie("auth_token", data.access_token);

      // Redirect to dashboard
      router.push("/dashboard/erp");
      router.refresh();
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", error);
      }
      throw error;
    }
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear cookie
    deleteCookie("auth_token");

    // Redirect to login
    router.push("/dashboard/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

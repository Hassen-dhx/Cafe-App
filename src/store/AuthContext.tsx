import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as api from "@/services/api";
import type { User, Role, RegisterData } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, motDePasse: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  role: Role | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await api.getToken();
      if (storedToken) {
        setToken(storedToken);
        api.setAuthToken(storedToken);
        try {
          const u = await api.getMe();
          setUser(u);
        } catch {
          await api.removeToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, motDePasse: string) => {
    const res = await api.login(email, motDePasse);
    setToken(res.token);
    setUser(res.user);
    api.setAuthToken(res.token);
    await api.saveToken(res.token);
    return res.user;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.register(data);
    setToken(res.token);
    setUser(res.user);
    api.setAuthToken(res.token);
    await api.saveToken(res.token);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await api.removeToken();
    api.setAuthToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        role: user?.role ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'FARMER' | 'ADVISOR' | 'ADMIN') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseUserFromToken(token: string | null): User | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: payload.name || payload.email?.split('@')[0] || 'Farmer',
      email: payload.email || '',
      role: (payload.role as any) || 'FARMER',
      preferred_language: (payload.lang as any) || 'en',
      location: payload.location || '',
      is_active: true,
      created_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('krishi_token'));

  // Immediately resolve user from localStorage or JWT payload
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('krishi_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.name || parsed.email)) return parsed;
      }
    } catch {
      // Fall through to token decoding
    }
    const storedToken = localStorage.getItem('krishi_token');
    return parseUserFromToken(storedToken);
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => !user && !!localStorage.getItem('krishi_token'));

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      const activeToken = token || localStorage.getItem('krishi_token');
      if (activeToken) {
        try {
          const me = await api.getMe(activeToken);
          if (isMounted) {
            setUser(me);
            localStorage.setItem('krishi_user', JSON.stringify(me));
          }
        } catch (err) {
          console.warn('Authentication token verification error:', err);
          // If token decoding succeeded, keep the decoded user unless 401
          if (isMounted && (!user || (err as any)?.message?.includes('401') || (err as any)?.message?.includes('unauthorized'))) {
            localStorage.removeItem('krishi_token');
            localStorage.removeItem('krishi_user');
            setToken(null);
            setUser(null);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem('krishi_user');
          setIsLoading(false);
        }
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('krishi_token', res.access_token);
      localStorage.setItem('krishi_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('krishi_token', res.access_token);
      localStorage.setItem('krishi_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('krishi_token');
    localStorage.removeItem('krishi_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const switchRole = (role: 'FARMER' | 'ADVISOR' | 'ADMIN') => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, role };
      localStorage.setItem('krishi_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

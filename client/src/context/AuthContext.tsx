import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api.js';
import { User, Role } from '../types/index.js';
import { getSocket } from '../lib/socket.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveAuthSession: (user: User, accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agriconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('agriconnect_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveAuthSession = (user: User, accessToken: string, refreshToken: string) => {
    setUser(user);
    setToken(accessToken);
    localStorage.setItem('agriconnect_user', JSON.stringify(user));
    localStorage.setItem('agriconnect_token', accessToken);
    localStorage.setItem('agriconnect_refresh_token', refreshToken);

    const socket = getSocket();
    socket.emit('join_user_room', user.id);
  };

  const clearAuthSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
    localStorage.removeItem('agriconnect_refresh_token');
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      const { user: loggedInUser, accessToken, refreshToken } = res.data.data;
      saveAuthSession(loggedInUser, accessToken, refreshToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      clearAuthSession();
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('agriconnect_user', JSON.stringify(res.data.data));
      }
    } catch {
      clearAuthSession();
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        refreshProfile,
        saveAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

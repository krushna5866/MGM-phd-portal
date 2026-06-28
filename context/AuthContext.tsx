import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  resetPassword: (email: string, new_password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user. Token might be expired.");
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // FastAPI requires form-encoded data for OAuth2 password login, so we use URLSearchParams
    const formData = new URLSearchParams();
    formData.append('username', email); // backend expects 'username' for OAuth2
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    // Store token
    localStorage.setItem('access_token', response.data.access_token);
    
    // Fetch profile
    await fetchUser();
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    await api.post('/auth/register', { name, email, password, role });
    // After registration automatically log in
    await login(email, password);
  };

  const resetPassword = async (email: string, new_password: string) => {
    await api.post('/auth/reset-password', { email, new_password });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, resetPassword, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

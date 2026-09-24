import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { translations, Language } from '../translations';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  login: (identifier: string, password: string, role_target?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (name: string, mobile: string, email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserInState: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('emitra_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('emitra_lang') as Language) || 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem('emitra_lang', lang);
  };

  const t = translations[language];

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('emitra_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUser(json.user);
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string, role_target?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role_target })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('emitra_token', data.token);
        return { success: true, message: data.message, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error occurred' };
    }
  };

  const register = async (name: string, mobile: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('emitra_token', data.token);
        return { success: true, message: data.message, user: data.user };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('emitra_token');
  };

  const updateUserInState = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: user?.role === 'admin',
        isLoading,
        language,
        setLanguage,
        t,
        login,
        register,
        logout,
        refreshUser,
        updateUserInState
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

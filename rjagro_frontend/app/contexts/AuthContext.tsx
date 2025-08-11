'use client'
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated by calling a protected endpoint
        // or checking localStorage for user data
        const savedUser = localStorage.getItem('user');
        
        if (savedUser) {
          const parsedUser: User = JSON.parse(savedUser);
          setUser(parsedUser);
          // Token is automatically handled by HTTP-only cookie
          setToken('authenticated'); // Just a flag since we can't access HTTP-only cookie
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User, authToken: string): void => {
    try {
      setUser(userData);
      setToken(authToken); // Store the token for reference, but cookie is handled by backend
      
      // Only save user data to localStorage (token is in HTTP-only cookie)
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint to clear HTTP-only cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important: include cookies in request
      });
      
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout API fails, clear local state
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
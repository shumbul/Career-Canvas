import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  department?: string;
  title?: string;
}

interface AuthProviderReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

export const useAuthProvider = (): AuthProviderReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      // For demo purposes, set a mock user
      setUser({
        id: 'demo-user-123',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        title: 'Software Engineer'
      });
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  const login = async (): Promise<void> => {
    setIsLoading(true);
    // Simulate Microsoft Graph login
    setTimeout(() => {
      setUser({
        id: 'demo-user-123',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        title: 'Software Engineer'
      });
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 2000);
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const getAccessToken = async (): Promise<string | null> => {
    // In a real implementation, this would return the Microsoft Graph access token
    return isAuthenticated ? 'mock-access-token' : null;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAccessToken
  };
};

export default useAuthProvider;
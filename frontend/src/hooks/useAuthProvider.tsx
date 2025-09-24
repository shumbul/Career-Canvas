import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuthProvider = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Mock access token for development (replace with actual MSAL implementation)
  const getAccessToken = useCallback(async (): Promise<string> => {
    try {
      // In a real implementation, you would use MSAL to get the token
      // For now, return a mock token or handle the authentication flow
      
      // Check if running in development mode
      if (process.env.NODE_ENV === 'development') {
        // Return a mock token for development
        return 'mock-token-for-development';
      }

      // For production, implement actual MSAL token acquisition
      // Example with MSAL:
      /*
      const msalInstance = new PublicClientApplication(msalConfig);
      const accounts = msalInstance.getAllAccounts();
      
      if (accounts.length > 0) {
        const tokenRequest = {
          scopes: ['https://graph.microsoft.com/User.Read', 'https://graph.microsoft.com/User.Read.All'],
          account: accounts[0]
        };
        
        const response = await msalInstance.acquireTokenSilent(tokenRequest);
        return response.accessToken;
      }
      */
      
      throw new Error('No authentication token available');
    } catch (error) {
      console.warn('Failed to get access token:', error);
      throw error;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        // In development, set a mock user
        if (process.env.NODE_ENV === 'development') {
          const mockUser: User = {
            id: 'dev-user-123',
            displayName: 'Development User',
            email: 'dev.user@company.com',
            jobTitle: 'Software Engineer',
            department: 'Engineering',
            officeLocation: 'Seattle, WA'
          };

          setAuthState({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          return;
        }

        // For production, implement actual authentication check
        // Example with MSAL:
        /*
        const msalInstance = new PublicClientApplication(msalConfig);
        await msalInstance.initialize();
        
        const accounts = msalInstance.getAllAccounts();
        
        if (accounts.length > 0) {
          // User is signed in, get their profile
          const token = await getAccessToken();
          const userProfile = await fetchUserProfile(token);
          
          setAuthState({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          // No user signed in
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
        */

        // For now, set as not authenticated in production
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });

      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        });
      }
    };

    initializeAuth();
  }, [getAccessToken]);

  const login = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Implement login logic
      // For development, just set mock user
      if (process.env.NODE_ENV === 'development') {
        const mockUser: User = {
          id: 'dev-user-123',
          displayName: 'Development User',
          email: 'dev.user@company.com',
          jobTitle: 'Software Engineer',
          department: 'Engineering',
          officeLocation: 'Seattle, WA'
        };

        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return;
      }

      // Production implementation would use MSAL
      throw new Error('Login not implemented for production');

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Implement logout logic
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
    }
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    getAccessToken,
    login,
    logout
  };
};

// Helper function to fetch user profile from Microsoft Graph
const fetchUserProfile = async (token: string): Promise<User> => {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  const profile = await response.json();

  return {
    id: profile.id,
    displayName: profile.displayName,
    email: profile.mail || profile.userPrincipalName,
    jobTitle: profile.jobTitle,
    department: profile.department,
    officeLocation: profile.officeLocation
  };
};
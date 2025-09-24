import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'microsoft';
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (provider: 'google' | 'microsoft') => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('career_canvas_token');
    const storedUser = localStorage.getItem('career_canvas_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      validateStoredToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateStoredToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch('http://localhost:7071/api/validateToken', {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(tokenToValidate);
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('career_canvas_token');
        localStorage.removeItem('career_canvas_user');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('career_canvas_token');
      localStorage.removeItem('career_canvas_user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (provider: 'google' | 'microsoft') => {
    const clientId = provider === 'google' 
      ? process.env.REACT_APP_GOOGLE_CLIENT_ID
      : process.env.REACT_APP_MICROSOFT_CLIENT_ID;
    
    // Check if OAuth is properly configured
    if (!clientId || clientId.includes('placeholder') || clientId.includes('your_')) {
      alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not configured yet. Please set up your OAuth credentials in the .env file. See OAUTH_SETUP.md for instructions.`);
      return;
    }
    
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    let authUrl: string;
    
    if (provider === 'google') {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `state=${provider}`;
    } else {
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid profile email&` +
        `state=${provider}`;
    }
    
    window.location.href = authUrl;
  };

  const logout = () => {
    localStorage.removeItem('career_canvas_token');
    localStorage.removeItem('career_canvas_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth callback handler for OAuth redirects
export const handleAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  if (!code || !state) {
    throw new Error('Missing authorization code or state');
  }

  const provider = state as 'google' | 'microsoft';
  const redirectUri = `${window.location.origin}/auth/callback`;
  
  const endpoint = provider === 'google' ? 'authGoogle' : 'authMicrosoft';
  
  try {
    const response = await fetch(`http://localhost:7071/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Backend returned empty response. Check if OAuth secrets are configured in backend/local.settings.json');
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Backend returned invalid JSON: ${text.substring(0, 100)}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Authentication failed');
    }

    // Store token and user data
    localStorage.setItem('career_canvas_token', data.token);
    localStorage.setItem('career_canvas_user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
};
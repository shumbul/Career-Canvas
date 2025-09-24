import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();

  const isOAuthConfigured = () => {
    const googleConfigured = process.env.REACT_APP_GOOGLE_CLIENT_ID && 
      !process.env.REACT_APP_GOOGLE_CLIENT_ID.includes('placeholder') && 
      !process.env.REACT_APP_GOOGLE_CLIENT_ID.includes('your_');
    const microsoftConfigured = process.env.REACT_APP_MICROSOFT_CLIENT_ID && 
      !process.env.REACT_APP_MICROSOFT_CLIENT_ID.includes('placeholder') && 
      !process.env.REACT_APP_MICROSOFT_CLIENT_ID.includes('your_');
    return googleConfigured || microsoftConfigured;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Logout
        </button>
      </div>
    );
  }

  if (!isOAuthConfigured()) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-center">
          <span className="text-sm text-gray-500">OAuth not configured</span>
          <div className="text-xs text-gray-400">See OAUTH_SETUP.md</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => login('google')}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Sign in with Google</span>
      </button>
      
      <button
        onClick={() => login('microsoft')}
        className="flex items-center space-x-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
        </svg>
        <span>Sign in with Microsoft</span>
      </button>
    </div>
  );
};

export default LoginButton;
import React, { useEffect, useState } from 'react';
import { handleAuthCallback } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleAuthCallback();
        setStatus('success');
        
        // Redirect to main app after successful auth
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        
      } catch (err) {
        setStatus('error');
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        console.error('Authentication error:', err);
        
        if (errorMessage.includes('empty response') || errorMessage.includes('CLIENT_SECRET')) {
          setError('OAuth backend configuration incomplete. Please check OAUTH_STATUS.md for setup instructions.');
        } else if (errorMessage.includes('Failed to get access token')) {
          setError('OAuth credentials not configured properly. Check backend/local.settings.json');
        } else {
          setError(errorMessage);
        }
      }
    };

    processCallback();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Completing authentication...</h2>
          <p className="text-gray-600 mt-2">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-gray-800">Authentication Successful!</h2>
        <p className="text-gray-600 mt-2">Redirecting you to the application...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
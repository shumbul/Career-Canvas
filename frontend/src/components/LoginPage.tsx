import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const isOAuthConfigured = () => {
    const googleConfigured = process.env.REACT_APP_GOOGLE_CLIENT_ID && 
      !process.env.REACT_APP_GOOGLE_CLIENT_ID.includes('placeholder') && 
      !process.env.REACT_APP_GOOGLE_CLIENT_ID.includes('your_');
    const microsoftConfigured = process.env.REACT_APP_MICROSOFT_CLIENT_ID && 
      !process.env.REACT_APP_MICROSOFT_CLIENT_ID.includes('placeholder') && 
      !process.env.REACT_APP_MICROSOFT_CLIENT_ID.includes('your_');
    return googleConfigured || microsoftConfigured;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* App Logo and Info */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Career Canvas</h1>
            <p className="text-xl text-gray-600 mb-4">AI-Powered Career Development Platform</p>
          </div>
          
          <div className="max-w-md mx-auto text-gray-600">
            <p className="mb-4">
              Empower your professional journey with personalized AI insights, smart networking, 
              and data-driven career recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">AI Career Coach</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Smart Mentoring</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Resume Optimizer</span>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-center mb-8">Sign in to continue your career journey</p>
            
            {isOAuthConfigured() ? (
              <div className="space-y-4">
                <button
                  onClick={() => login('google')}
                  className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 rounded-lg px-6 py-4 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                
                <button
                  onClick={() => login('microsoft')}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white rounded-lg px-6 py-4 font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                  </svg>
                  <span>Continue with Microsoft</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-yellow-600 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.002 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">OAuth Configuration Required</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Authentication providers need to be configured to enable sign-in functionality.
                </p>
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  See <code>OAUTH_SETUP.md</code> for configuration instructions
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Info */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Authentication</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Microsoft Powered</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StorytellingHub from './components/StorytellingHub';
import MentorDashboard from './components/MentorDashboard';
import MentorshipProfile from './components/MentorshipProfile';
import VideoMockInterview from './components/VideoMockInterview';
import LearningResources from './components/LearningResources';
import AuthCallback from './components/AuthCallback';
import LoginButton from './components/LoginButton';
import LoginPage from './components/LoginPage';
import MentorFilterBar from './components/MentorFilterBar';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'stories' | 'mentors' | 'profile' | 'interview' | 'learning'>('mentors');
  const { user, isLoading } = useAuth();
  
  // Mentor filter state
  const [mentorFilters, setMentorFilters] = useState({
    searchTerm: '',
    department: 'All Departments',
    skills: [] as string[],
    availability: [] as string[]
  });

  // Listen for event to switch to mentors tab
  React.useEffect(() => {
    const handleSwitchToMentorsTab = () => {
      setActiveTab('mentors');
    };

    window.addEventListener('switchToMentorsTab', handleSwitchToMentorsTab);
    
    return () => {
      window.removeEventListener('switchToMentorsTab', handleSwitchToMentorsTab);
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Career Canvas...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Career Canvas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('mentors')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'mentors'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Find Mentors
                </button>
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'interview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Video Interview
                </button>
                <button
                  onClick={() => setActiveTab('learning')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'learning'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Learning Resources
                </button>
                <button
                  onClick={() => setActiveTab('stories')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'stories'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Professional Stories
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  My Profile
                </button>
              </div>
              
              <LoginButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Mentor Filter Bar - only show when on mentors tab */}
      {activeTab === 'mentors' && (
        <MentorFilterBar 
          filters={mentorFilters}
          onFiltersChange={setMentorFilters}
        />
      )}

      {/* Content */}
      {activeTab === 'mentors' ? (
        <MentorDashboard filters={mentorFilters} />
      ) : activeTab === 'interview' ? (
        <VideoMockInterview 
          key="video-interview" 
          onNavigateHome={() => setActiveTab('mentors')}
        />
      ) : activeTab === 'learning' ? (
        <LearningResources />
      ) : activeTab === 'profile' ? (
        <MentorshipProfile />
      ) : (
        <StorytellingHub />
      )}

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

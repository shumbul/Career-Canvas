import React, { useEffect, useState } from 'react';
import './TeamsApp.css';
import MentorTab from './MentorTab';
import StoriesTab from './StoriesTab';
import ProgressTab from './ProgressTab';

interface TeamsAppProps {
  tabName?: string;
}

const TeamsApp: React.FC<TeamsAppProps> = ({ tabName }) => {
  const [currentTab, setCurrentTab] = useState<string>('mentors');
  const [isTeamsEnvironment, setIsTeamsEnvironment] = useState(false);

  useEffect(() => {
    // Initialize Microsoft Teams SDK
    if (window.microsoftTeams) {
      setIsTeamsEnvironment(true);
      window.microsoftTeams.initialize();
    }

    // Set tab based on URL or prop
    if (tabName) {
      setCurrentTab(tabName);
    } else {
      // Extract tab from URL path
      const path = window.location.pathname;
      if (path.includes('/stories')) {
        setCurrentTab('stories');
      } else if (path.includes('/progress')) {
        setCurrentTab('progress');
      } else {
        setCurrentTab('mentors');
      }
    }
  }, [tabName]);

  const renderTab = () => {
    switch (currentTab) {
      case 'stories':
        return <StoriesTab />;
      case 'progress':
        return <ProgressTab />;
      case 'mentors':
      default:
        return <MentorTab />;
    }
  };

  return (
    <div className="teams-app">
      {/* Teams Environment Indicator */}
      {isTeamsEnvironment && (
        <div className="teams-indicator">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Running in Microsoft Teams environment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Content */}
      {renderTab()}
    </div>
  );
};

export default TeamsApp;
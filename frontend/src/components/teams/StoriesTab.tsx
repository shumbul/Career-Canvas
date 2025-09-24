import React, { useEffect, useState } from 'react';
import StorytellingHub from '../StorytellingHub';

const StoriesTab: React.FC = () => {
  const [teamsContext, setTeamsContext] = useState<any>(null);
  const [isTeamsEnvironment, setIsTeamsEnvironment] = useState(false);

  useEffect(() => {
    // Initialize Microsoft Teams SDK
    if (window.microsoftTeams) {
      setIsTeamsEnvironment(true);
      window.microsoftTeams.initialize();
      
      // Get Teams context
      window.microsoftTeams.getContext((context) => {
        setTeamsContext(context);
      });
    }
  }, []);

  return (
    <div className="teams-tab-container">
      {/* Teams-specific header */}
      {isTeamsEnvironment && teamsContext && (
        <div className="bg-green-600 text-white p-4 mb-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold">Professional Stories</h2>
            <p className="text-green-100">
              Share your career journey and learn from colleagues at {teamsContext.teamName || 'your organization'}.
            </p>
          </div>
        </div>
      )}
      
      {/* Storytelling Hub Component */}
      <StorytellingHub />
    </div>
  );
};

export default StoriesTab;
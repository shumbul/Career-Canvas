import React, { useEffect, useState } from 'react';
import MentorDashboard from '../MentorDashboard';

interface Filters {
  department: string;
  skills: string[];
  availability: string[];
  searchTerm: string;
}

// Microsoft Teams SDK types (simplified)
declare global {
  interface Window {
    microsoftTeams?: {
      initialize: () => void;
      getContext: (callback: (context: any) => void) => void;
      settings: {
        setValidityState: (isValid: boolean) => void;
        registerOnSaveHandler: (handler: (saveEvent: any) => void) => void;
      };
    };
  }
}

const MentorTab: React.FC = () => {
  const [teamsContext, setTeamsContext] = useState<any>(null);
  const [isTeamsEnvironment, setIsTeamsEnvironment] = useState(false);
  
  // Local filters state for Teams tab (since it doesn't have the navbar filter bar)
  const [filters, setFilters] = useState<Filters>({
    department: 'All Departments',
    skills: [],
    availability: [],
    searchTerm: ''
  });

  useEffect(() => {
    // Initialize Microsoft Teams SDK
    if (window.microsoftTeams) {
      setIsTeamsEnvironment(true);
      window.microsoftTeams.initialize();
      
      // Get Teams context
      window.microsoftTeams.getContext((context) => {
        setTeamsContext(context);
        console.log('Teams Context:', context);
      });
    } else {
      // Fallback for non-Teams environment
      console.log('Running outside Teams environment');
    }
  }, []);

  return (
    <div className="teams-tab-container">
      {/* Teams-specific header */}
      {isTeamsEnvironment && teamsContext && (
        <div className="bg-blue-600 text-white p-4 mb-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold">Find Your Mentor</h2>
            <p className="text-blue-100">
              Welcome, {teamsContext.userDisplayName || 'Team Member'}! 
              Connect with mentors in your organization.
            </p>
          </div>
        </div>
      )}
      
      {/* Simple Filter Bar for Teams */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search mentors..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            {/* Department Filter */}
            <div className="min-w-48">
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="All Departments">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
            
            {/* Clear Filters */}
            {(filters.searchTerm || filters.department !== 'All Departments' || filters.skills.length > 0 || filters.availability.length > 0) && (
              <button
                onClick={() => setFilters({ department: 'All Departments', skills: [], availability: [], searchTerm: '' })}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mentor Dashboard Component */}
      <MentorDashboard filters={filters} />
    </div>
  );
};

export default MentorTab;
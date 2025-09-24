import React, { useState } from 'react';

interface MentorFilters {
  searchTerm: string;
  department: string;
  skills: string[];
  availability: string[];
}

interface MentorFilterBarProps {
  filters: MentorFilters;
  onFiltersChange: (filters: MentorFilters) => void;
}

const MentorFilterBar: React.FC<MentorFilterBarProps> = ({ filters, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const departments = [
    'All Departments',
    'Engineering',
    'Marketing',
    'Product',
    'Sales',
    'Design',
    'Data Science',
    'Operations',
    'HR',
    'Finance'
  ];

  const skills = [
    'Agile',
    'Analytics', 
    'Brand Strategy',
    'Cloud Architecture',
    'Data Analysis',
    'Leadership',
    'Project Management',
    'React',
    'TypeScript',
    'System Design',
    'User Research',
    'Digital Marketing'
  ];

  const availabilityOptions = [
    'Available',
    'Limited Availability', 
    'Currently Busy'
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchTerm: e.target.value });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, department: e.target.value });
  };

  const handleSkillToggle = (skill: string) => {
    const updatedSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    onFiltersChange({ ...filters, skills: updatedSkills });
  };

  const handleAvailabilityToggle = (availability: string) => {
    const updatedAvailability = filters.availability.includes(availability)
      ? filters.availability.filter(a => a !== availability)
      : [...filters.availability, availability];
    onFiltersChange({ ...filters, availability: updatedAvailability });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      department: 'All Departments',
      skills: [],
      availability: []
    });
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.department !== 'All Departments' || 
    filters.skills.length > 0 || 
    filters.availability.length > 0;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Filter Bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search mentors..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Department Dropdown */}
            <div className="min-w-0">
              <select
                value={filters.department}
                onChange={handleDepartmentChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Toggle and Clear */}
          <div className="flex items-center space-x-2 ml-4">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span>Filters</span>
              <svg 
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="pb-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Skills Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {skills.map((skill) => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-600">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <div className="space-y-2">
                  {availabilityOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes(option)}
                        onChange={() => handleAvailabilityToggle(option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-600">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 py-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.department !== 'All Departments' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.department}
                <button
                  onClick={() => handleDepartmentChange({ target: { value: 'All Departments' } } as any)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.skills.map((skill) => (
              <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {skill}
                <button
                  onClick={() => handleSkillToggle(skill)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.availability.map((avail) => (
              <span key={avail} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {avail}
                <button
                  onClick={() => handleAvailabilityToggle(avail)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorFilterBar;
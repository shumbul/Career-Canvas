import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface MentorProfile {
  _id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  skills: string[];
  bio: string;
  experience: number;
  availability: 'available' | 'busy' | 'limited';
  rating: number;
  menteeCount: number;
  interests: string[];
  profileImage?: string;
  lastActive: string;
  mentorshipHistory: {
    totalMentees: number;
    completedSessions: number;
    averageRating: number;
    specializations: string[];
  };
  organizationalContext?: {
    manager?: string;
    directReports?: number;
    teamSize?: number;
    location?: string;
    jobLevel?: string;
    hireDate?: string;
  };
}

interface FilterState {
  department: string[];
  skills: string[];
  availability: string[];
  experience: {min: number; max: number};
  rating: {min: number; max: number};
  searchTerm: string;
  sortBy: 'name' | 'rating' | 'experience' | 'lastActive';
  sortOrder: 'asc' | 'desc';
}

const DynamicMentorDashboard: React.FC = () => {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [filters, setFilters] = useState<FilterState>({
    department: [],
    skills: [],
    availability: [],
    experience: {min: 0, max: 20},
    rating: {min: 0, max: 5},
    searchTerm: '',
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  // Real-time update interval
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch mentor data with filters
  const fetchMentors = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        departments: filters.department.join(','),
        skills: filters.skills.join(','),
        availability: filters.availability.join(','),
        minExperience: filters.experience.min.toString(),
        maxExperience: filters.experience.max.toString(),
        minRating: filters.rating.min.toString(),
        maxRating: filters.rating.max.toString(),
        search: filters.searchTerm,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`/api/mentors?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mentors');
      }

      const data = await response.json();
      
      setMentors(data.mentors || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);



  // Initialize data fetching and real-time updates
  useEffect(() => {
    fetchMentors();

    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(() => {
      fetchMentors();
    }, 30000);

    setUpdateInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchMentors]);

  // Get unique filter options from current data
  const filterOptions = useMemo(() => {
    const departments = Array.from(new Set(mentors.map(m => m.department))).sort();
    const skills = Array.from(new Set(mentors.flatMap(m => m.skills))).sort();
    const availabilityOptions = ['available', 'limited', 'busy'];

    return { departments, skills, availabilityOptions };
  }, [mentors]);

  // Filter mentors based on current filter state
  const filteredMentors = useMemo(() => {
    let filtered = mentors.filter(mentor => {
      // Department filter
      if (filters.department.length > 0 && !filters.department.includes(mentor.department)) {
        return false;
      }

      // Skills filter
      if (filters.skills.length > 0 && !filters.skills.some(skill => mentor.skills.includes(skill))) {
        return false;
      }

      // Availability filter
      if (filters.availability.length > 0 && !filters.availability.includes(mentor.availability)) {
        return false;
      }

      // Experience filter
      if (mentor.experience < filters.experience.min || mentor.experience > filters.experience.max) {
        return false;
      }

      // Rating filter
      if (mentor.rating < filters.rating.min || mentor.rating > filters.rating.max) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          mentor.name.toLowerCase().includes(searchLower) ||
          mentor.title.toLowerCase().includes(searchLower) ||
          mentor.department.toLowerCase().includes(searchLower) ||
          mentor.bio.toLowerCase().includes(searchLower) ||
          mentor.skills.some(skill => skill.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'experience':
          comparison = a.experience - b.experience;
          break;
        case 'lastActive':
          comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [mentors, filters]);

  // Filter update handlers
  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: [],
      skills: [],
      availability: [],
      experience: {min: 0, max: 20},
      rating: {min: 0, max: 5},
      searchTerm: '',
      sortBy: 'rating',
      sortOrder: 'desc'
    });
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'limited': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'busy': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchMentors();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Dynamic Mentor Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Real-time mentor discovery with advanced filtering and organizational insights
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Smart Filters</h2>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-3 xl:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search mentors, skills, departments..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
              <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-300 rounded-lg p-2">
                {filterOptions.departments.map(dept => (
                  <label key={dept} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.department.includes(dept)}
                      onChange={(e) => {
                        const newDepts = e.target.checked
                          ? [...filters.department, dept]
                          : filters.department.filter(d => d !== dept);
                        handleFilterChange('department', newDepts);
                      }}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-300 rounded-lg p-2">
                {filterOptions.skills.slice(0, 10).map(skill => (
                  <label key={skill} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill)}
                      onChange={(e) => {
                        const newSkills = e.target.checked
                          ? [...filters.skills, skill]
                          : filters.skills.filter(s => s !== skill);
                        handleFilterChange('skills', newSkills);
                      }}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability & Sorting */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="space-y-1">
                  {filterOptions.availabilityOptions.map(availability => (
                    <label key={availability} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes(availability)}
                        onChange={(e) => {
                          const newAvailability = e.target.checked
                            ? [...filters.availability, availability]
                            : filters.availability.filter(a => a !== availability);
                          handleFilterChange('availability', newAvailability);
                        }}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{availability}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="rating-desc">Highest Rated</option>
                  <option value="rating-asc">Lowest Rated</option>
                  <option value="experience-desc">Most Experienced</option>
                  <option value="experience-asc">Least Experienced</option>
                  <option value="lastActive-desc">Recently Active</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} of {mentors.length} total
          </p>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Active filters: {
                filters.department.length + 
                filters.skills.length + 
                filters.availability.length + 
                (filters.searchTerm ? 1 : 0)
              }
            </div>
          </div>
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div key={mentor._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 overflow-hidden">
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {mentor.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-bold text-gray-900">{mentor.name}</h3>
                      <p className="text-sm text-gray-600">{mentor.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(mentor.availability)}`}>
                      {mentor.availability}
                    </span>
                    <div className="text-xs text-gray-500">
                      {formatLastActive(mentor.lastActive)}
                    </div>
                  </div>
                </div>

                {/* Department and Organizational Context */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    {mentor.department}
                  </span>
                  {mentor.organizationalContext?.location && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      📍 {mentor.organizationalContext.location}
                    </span>
                  )}
                  {mentor.organizationalContext?.directReports && mentor.organizationalContext.directReports > 0 && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">
                      👥 {mentor.organizationalContext.directReports} reports
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {mentor.rating.toFixed(1)}
                  </div>
                  <div>{mentor.experience}y exp</div>
                  <div>{mentor.menteeCount} mentees</div>
                  <div>{mentor.mentorshipHistory.completedSessions} sessions</div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {mentor.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {mentor.skills.length > 4 && (
                      <span className="text-gray-500 text-xs px-2 py-1">
                        +{mentor.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Organizational Context */}
                {mentor.organizationalContext && (
                  <div className="border-t pt-3 mb-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      {mentor.organizationalContext.manager && (
                        <div>Manager: {mentor.organizationalContext.manager}</div>
                      )}
                      {mentor.organizationalContext.hireDate && (
                        <div>Joined: {new Date(mentor.organizationalContext.hireDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                    Connect
                  </button>
                  <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200">
                    Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No mentors found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters to discover more mentors</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicMentorDashboard;

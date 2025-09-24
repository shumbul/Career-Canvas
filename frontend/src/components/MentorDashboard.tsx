import React, { useState, useMemo, useEffect } from 'react';
import MentorshipPreferencesForm from './MentorshipPreferencesForm';
import MentorshipPreferencesModal from './MentorshipPreferencesModal';
import MentorProfileModal from './MentorProfileModal';
import BecomeMentorModal from './BecomeMentorModal';
import MentorCalendar from './MentorCalendar';
import { useAuth } from '../contexts/AuthContext';

interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  skills: string[];
  bio: string;
  experience: number;
  availability: 'available' | 'busy' | 'limited';
  profileImage?: string;
  rating: number;
  menteeCount: number;
  interests: string[];
}

interface Filters {
  department: string;
  skills: string[];
  availability: string[];
  searchTerm: string;
}

interface MentorFilters {
  searchTerm: string;
  department: string;
  skills: string[];
  availability: string[];
}

interface MentorDashboardProps {
  filters: MentorFilters;
}

const MentorDashboard: React.FC<MentorDashboardProps> = ({ filters: externalFilters }) => {
  const { user, token } = useAuth();
  // Sample mentor data
  const [mentors] = useState<Mentor[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      skills: ['React', 'TypeScript', 'Leadership', 'System Design'],
      bio: 'Passionate about helping junior developers grow their careers. 8+ years in full-stack development.',
      experience: 8,
      availability: 'available',
      rating: 4.9,
      menteeCount: 15,
      interests: ['career-growth', 'technical-skills', 'leadership']
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Product Manager',
      department: 'Product',
      skills: ['Product Strategy', 'Data Analysis', 'Agile', 'User Research'],
      bio: 'Former engineer turned PM. Love helping people transition between technical and business roles.',
      experience: 6,
      availability: 'limited',
      rating: 4.7,
      menteeCount: 8,
      interests: ['career-transition', 'product-management', 'strategy']
    },
    {
      id: '3',
      name: 'Jessica Rodriguez',
      title: 'Marketing Director',
      department: 'Marketing',
      skills: ['Digital Marketing', 'Brand Strategy', 'Team Management', 'Analytics'],
      bio: 'Helping marketing professionals advance their careers and build strong personal brands.',
      experience: 10,
      availability: 'available',
      rating: 4.8,
      menteeCount: 12,
      interests: ['marketing', 'brand-building', 'career-advancement']
    },
    {
      id: '4',
      name: 'David Park',
      title: 'Principal Engineer',
      department: 'Engineering',
      skills: ['Cloud Architecture', 'Microservices', 'DevOps', 'Mentoring'],
      bio: 'Cloud architecture expert with a passion for building scalable systems and growing engineering talent.',
      experience: 12,
      availability: 'busy',
      rating: 4.9,
      menteeCount: 20,
      interests: ['technical-architecture', 'engineering-leadership', 'cloud-technologies']
    },
    {
      id: '5',
      name: 'Amanda Foster',
      title: 'UX Design Lead',
      department: 'Design',
      skills: ['User Experience', 'Design Systems', 'Research', 'Prototyping'],
      bio: 'Design leader focused on creating user-centered experiences and mentoring emerging designers.',
      experience: 9,
      availability: 'available',
      rating: 4.6,
      menteeCount: 10,
      interests: ['design', 'user-experience', 'creative-careers']
    },
    {
      id: '6',
      name: 'Robert Kim',
      title: 'Data Scientist',
      department: 'Analytics',
      skills: ['Machine Learning', 'Python', 'Statistics', 'Data Visualization'],
      bio: 'ML engineer passionate about democratizing data science and helping others break into the field.',
      experience: 7,
      availability: 'limited',
      rating: 4.8,
      menteeCount: 6,
      interests: ['data-science', 'machine-learning', 'career-transition']
    }
  ]);

  // Remove internal filters state since filtering is now handled externally

  const [userInterests, setUserInterests] = useState(['career-growth', 'technical-skills', 'leadership']);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [connectedMentors, setConnectedMentors] = useState<Set<string>>(new Set());
  const [isBecomeMentorModalOpen, setIsBecomeMentorModalOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMentor, setCalendarMentor] = useState<Mentor | null>(null);

  // Load user preferences on component mount
  const loadUserPreferences = async () => {
    if (!user || !token) {
      console.log('No user or token available for loading preferences');
      return;
    }

    try {
      console.log('Loading preferences for user:', user.id);
      const response = await fetch('http://localhost:7071/api/getMentorshipPreferences', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Load preferences response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded preferences data:', data);
        
        if (data.success && data.preferences) {
          // Extract interests from preferences - check multiple possible locations
          let interests = ['career-growth', 'technical-skills', 'leadership']; // Default
          
          if (data.preferences.interests) {
            interests = data.preferences.interests;
          } else if (data.preferences.preferences?.interests) {
            interests = data.preferences.preferences.interests;
          } else if (data.preferences.preferences?.goals) {
            interests = data.preferences.preferences.goals;
          }
          
          console.log('Setting user interests:', interests);
          setUserInterests(interests);
        }
      } else if (response.status === 404) {
        // User has no saved preferences yet, use defaults
        console.log('No saved preferences found, using defaults');
      } else {
        console.error('Failed to load preferences:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  // Load preferences when component mounts or user/token changes
  useEffect(() => {
    loadUserPreferences();
  }, [user, token]);

  // Get unique departments and skills for filter options
  const departments = useMemo(() => 
    Array.from(new Set(mentors.map(mentor => mentor.department))).sort()
  , [mentors]);

  const allSkills = useMemo(() => 
    Array.from(new Set(mentors.flatMap(mentor => mentor.skills))).sort()
  , [mentors]);

  // Filter mentors based on external filters and user interests
  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      // Department filter
      if (externalFilters.department && externalFilters.department !== 'All Departments' && mentor.department !== externalFilters.department) {
        return false;
      }

      // Skills filter
      if (externalFilters.skills.length > 0 && !externalFilters.skills.some((skill: string) => mentor.skills.includes(skill))) {
        return false;
      }

      // Availability filter
      if (externalFilters.availability.length > 0 && !externalFilters.availability.includes(mentor.availability)) {
        return false;
      }

      // Search term filter
      if (externalFilters.searchTerm) {
        const searchLower = externalFilters.searchTerm.toLowerCase();
        return (
          mentor.name.toLowerCase().includes(searchLower) ||
          mentor.title.toLowerCase().includes(searchLower) ||
          mentor.bio.toLowerCase().includes(searchLower) ||
          mentor.skills.some((skill: string) => skill.toLowerCase().includes(searchLower))
        );
      }

      return true;
    }).sort((a, b) => {
      // Sort by relevance to user interests
      const aRelevance = a.interests.filter(interest => userInterests.includes(interest)).length;
      const bRelevance = b.interests.filter(interest => userInterests.includes(interest)).length;
      
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance; // Higher relevance first
      }
      
      // Then sort by rating
      return b.rating - a.rating;
    });
  }, [mentors, externalFilters, userInterests]);

  // Filter handlers removed - filtering now handled externally by MentorFilterBar

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'busy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'limited': return 'Limited Availability';
      case 'busy': return 'Currently Busy';
      default: return availability;
    }
  };

  const handlePreferencesSave = async (preferences: any) => {
    if (!user || !token) {
      alert('Please log in to save your preferences.');
      return;
    }

    try {
      console.log('Saving preferences:', preferences);
      console.log('User token exists:', !!token);
      console.log('User ID:', user.id);
      
      const requestData = {
        userId: user.id,
        mentorshipType: preferences.mentorshipType || 'seeking-mentor',
        ...preferences
      };
      console.log('Request data being sent:', requestData);

      // Save preferences to backend
      const response = await fetch('http://localhost:7071/api/submitMentorshipPreferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        setUserInterests(preferences.interests);
        alert('Preferences saved successfully!');
      } else {
        // Handle non-200 responses
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          
          // Try different error message formats
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          // If response is not JSON, use status text
          console.log('Could not parse error response as JSON:', parseError);
        }
        console.error('Preferences save failed:', errorMessage);
        alert(`Error saving preferences: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      let errorMessage = 'Network error or server unavailable';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Error saving preferences: ${errorMessage}`);
    }
  };

  const handleConnect = async (mentorId: string) => {
    try {
      const response = await fetch('http://localhost:7071/api/submitConnectionRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorId: mentorId,
          userId: 'current-user', // In real app, get from auth
          message: 'I would like to connect with you for mentorship guidance.'
        }),
      });
      
      if (response.ok) {
        setConnectedMentors(prev => new Set(prev).add(mentorId));
        alert('Connection request sent successfully! The mentor will be notified.');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Error sending connection request. Please try again.');
    }
  };

  const handleViewProfile = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsProfileModalOpen(true);
  };

  const handleBookSchedule = (mentor: Mentor) => {
    setCalendarMentor(mentor);
    setShowCalendar(true);
  };

  const handleReturnFromCalendar = () => {
    setShowCalendar(false);
    setCalendarMentor(null);
  };

  const handleEditProfile = (mentor: Mentor) => {
    // TODO: Implement edit functionality - could open BecomeMentorModal with pre-filled data
    console.log('Edit profile for mentor:', mentor.id);
    alert('Edit functionality coming soon!');
  };

  const handleDeleteProfile = async (mentorId: string) => {
    if (!user || !token) {
      alert('You must be logged in to delete your profile.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete your mentor profile? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:7071/api/deleteMentorProfile/${mentorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Your mentor profile has been deleted successfully.');
        setIsProfileModalOpen(false);
        // Note: In real implementation, you would refresh the mentor list here
      } else {
        const errorData = await response.json();
        alert(`Error deleting profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting mentor profile:', error);
      alert('Error deleting profile. Please try again.');
    }
  };

  // Show calendar view if a mentor is selected for booking
  if (showCalendar && calendarMentor) {
    return (
      <MentorCalendar 
        mentor={calendarMentor}
        onViewProfile={handleViewProfile}
        onReturnToHome={handleReturnFromCalendar}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start">
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Find Your Mentor</h1>
            <p className="text-gray-600 text-lg mb-6">Connect with experienced professionals who can guide your career journey</p>
            <div className="mt-6 flex justify-center items-center flex-wrap gap-3">
              <span className="text-sm text-gray-600 font-medium">Your interests:</span>
              {userInterests.map(interest => (
                <span key={interest} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          
          {/* Become a Mentor Button */}
          {user && (
            <button
              onClick={() => setIsBecomeMentorModalOpen(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Become a Mentor
            </button>
          )}
        </div>
      </div>

      {/* Mentorship Preferences Button */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-12 border border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customize Your Mentorship Experience</h2>
          <p className="text-gray-600 mb-6 text-lg">
            {user ? 'Set your preferences to get better mentor recommendations' : 'Please log in to set your mentorship preferences'}
          </p>
          {user ? (
            <button
              onClick={() => setIsPreferencesModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Set Mentorship Preferences
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">You need to be logged in to access this feature</p>
              <div className="inline-block">
                {/* Login button will be handled by the LoginButton component in the nav */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter UI removed - now handled by MentorFilterBar in navbar */}

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
        </p>
        <div className="text-sm text-gray-500">
          Sorted by relevance to your interests
        </div>
      </div>

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => {
          const relevanceScore = mentor.interests.filter(interest => userInterests.includes(interest)).length;
          
          return (
            <div key={mentor.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              {/* Header with relevance indicator */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {mentor.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-gray-800">{mentor.name}</h3>
                    <p className="text-sm text-gray-600">{mentor.title}</p>
                  </div>
                </div>
                {relevanceScore > 0 && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {relevanceScore} match{relevanceScore !== 1 ? 'es' : ''}
                  </div>
                )}
              </div>

              {/* Department and Availability */}
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                  {mentor.department}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor.availability)}`}>
                  {getAvailabilityText(mentor.availability)}
                </span>
              </div>

              {/* Bio */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {mentor.rating}
                </div>
                <div>{mentor.experience}y exp</div>
                <div>{mentor.menteeCount} mentees</div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {mentor.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {mentor.skills.length > 3 && (
                    <span className="text-gray-500 text-xs px-2 py-1">
                      +{mentor.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleConnect(mentor.id)}
                    disabled={connectedMentors.has(mentor.id)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors duration-200 ${
                      connectedMentors.has(mentor.id)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {connectedMentors.has(mentor.id) ? '✓ Connected' : 'Connect'}
                  </button>
                  <button 
                    onClick={() => handleViewProfile(mentor)}
                    className="flex-1 py-2 px-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
                  >
                    View Profile
                  </button>
                </div>
                <button 
                  onClick={() => handleBookSchedule(mentor)}
                  className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Schedule
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No mentors found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters in the navigation bar to find more mentors</p>
        </div>
      )}

      {/* Dynamic Modals */}
      <MentorshipPreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        currentInterests={userInterests}
        onSave={handlePreferencesSave}
      />

      <MentorProfileModal
        mentor={selectedMentor}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onConnect={handleConnect}
        isConnected={selectedMentor ? connectedMentors.has(selectedMentor.id) : false}
        onEdit={handleEditProfile}
        onDelete={handleDeleteProfile}
      />

      <BecomeMentorModal
        isOpen={isBecomeMentorModalOpen}
        onClose={() => setIsBecomeMentorModalOpen(false)}
        onSuccess={() => {
          setIsBecomeMentorModalOpen(false);
          // Note: In real implementation, you would refresh the mentor list here
        }}
      />
    </div>
  );
};

export default MentorDashboard;
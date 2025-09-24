import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BecomeMentorModal from './BecomeMentorModal';

interface UserMentorProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  expertise: string[];
  availability: 'available' | 'busy' | 'limited';
  bio: string;
  experience: number;
  menteeCount: number;
  rating: number;
  skills: string[];
  profileImage?: string;
  joinDate?: string;
}

const MentorshipProfile: React.FC = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserMentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Try to fetch user's mentor profile from the mentors collection
        const response = await fetch(`http://localhost:7071/api/mentors?userEmail=${encodeURIComponent(user.email)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Find the user's profile in the mentors list
          const userProfile = data.mentors?.find((mentor: any) => mentor.email === user.email);
          
          if (userProfile) {
            setProfile({
              id: userProfile._id || userProfile.id,
              name: userProfile.name || user.name || 'Your Name',
              email: userProfile.email || user.email,
              title: userProfile.title || 'Your Title',
              department: userProfile.department || 'Your Department',
              expertise: userProfile.expertise || userProfile.interests || [],
              availability: userProfile.availability || 'available',
              bio: userProfile.bio || 'Add your professional summary here...',
              experience: userProfile.experience || 0,
              menteeCount: userProfile.menteeCount || 0,
              rating: userProfile.rating || 5.0,
              skills: userProfile.skills || [],
              profileImage: userProfile.profileImage,
              joinDate: userProfile.joinDate || userProfile.createdAt
            });
          } else {
            // No mentor profile found, create placeholder
            setProfile({
              id: 'temp-id',
              name: user.name || 'Your Name',
              email: user.email,
              title: 'Your Title',
              department: 'Your Department',
              expertise: [],
              availability: 'available',
              bio: 'Add your professional summary here...',
              experience: 0,
              menteeCount: 0,
              rating: 5.0,
              skills: [],
            });
          }
        } else {
          throw new Error('Failed to fetch profile data');
        }
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching user profile:', err);
        
        // Create placeholder profile on error
        if (user) {
          setProfile({
            id: 'temp-id',
            name: user.name || 'Your Name',
            email: user.email,
            title: 'Your Title',
            department: 'Your Department',
            expertise: [],
            availability: 'available',
            bio: 'Add your professional summary here...',
            experience: 0,
            menteeCount: 0,
            rating: 5.0,
            skills: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, token]);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    // Refresh profile data after successful edit
    setIsEditModalOpen(false);
    if (user && token) {
      setLoading(true);
      // Re-run the profile fetch logic
      try {
        const response = await fetch('http://localhost:7071/api/mentors', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const userProfile = data.mentors?.find((m: any) => m.email === user.email);
          
          if (userProfile) {
            setProfile({
              id: userProfile._id || userProfile.id,
              name: userProfile.name,
              email: userProfile.email,
              title: userProfile.title,
              department: userProfile.department,
              expertise: userProfile.interests || [],
              availability: userProfile.availability,
              bio: userProfile.bio,
              experience: userProfile.experience,
              menteeCount: userProfile.menteeCount,
              rating: userProfile.rating,
              skills: userProfile.skills,
            });
          }
        }
      } catch (err) {
        console.error('Error refreshing profile:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile || !token) {
      alert('No profile to delete or authentication required.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete your mentor profile? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:7071/api/deleteMentorProfile/${profile.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Your mentor profile has been deleted successfully.');
        // Set profile to placeholder state that will show "Create Mentor Profile" button
        setProfile({
          id: 'temp-id',  // Force temp-id to show create button
          name: user?.name || 'Your Name',
          email: user?.email || '',
          title: 'Your Title',
          department: 'Your Department',
          expertise: [],
          availability: 'available',
          bio: 'Add your professional summary here...',
          experience: 0,
          menteeCount: 0,
          rating: 5.0,
          skills: [],
        });
      } else {
        const errorData = await response.json();
        alert(`Error deleting profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting mentor profile:', error);
      alert('Error deleting profile. Please try again.');
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'limited': return 'text-yellow-600 bg-yellow-100';
      case 'busy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading your profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">Please log in to view your mentorship profile.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">No profile data available.</p>
        </div>
      </div>
    );
  }

  // Show "Create Profile" view if no real profile exists
  if (profile.id === 'temp-id') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              ?
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Mentor Profile</h1>
            <p className="text-xl opacity-90">Share your expertise and help others grow</p>
          </div>
          
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your mentor profile has not been created yet</h2>
                <p className="text-gray-600 mb-6">
                  Create your mentor profile to share your expertise, connect with mentees, and make a meaningful impact in their careers.
                </p>
              </div>
              
              <button
                onClick={handleEditProfile}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Become a Mentor
              </button>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Share Your Skills
                </div>
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Help Others Grow
                </div>
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Make Impact
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Edit Profile Modal */}
        <BecomeMentorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          initialData={undefined}
          isEditing={false}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 relative">
          {/* Edit/Delete buttons in top-right corner */}
          {profile && profile.id !== 'temp-id' && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleEditProfile}
                className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                title="Edit Profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDeleteProfile}
                className="text-white hover:text-red-200 p-2 rounded-lg hover:bg-red-500 hover:bg-opacity-30 transition-colors"
                title="Delete Profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              <p className="text-xl opacity-90 mb-2">{profile.title}</p>
              <p className="opacity-75">{profile.department}</p>
              <div className="mt-3 flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(profile.availability)}`}>
                  {profile.availability}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional Summary */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Professional Summary</h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>

              {/* Skills & Technologies */}
              {profile.skills.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas of Expertise */}
              {profile.expertise.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((area, index) => (
                      <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {area.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Experience & Stats */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Experience & Impact</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Years of Experience</p>
                    <p className="text-2xl font-bold text-blue-600">{profile.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mentees Guided</p>
                    <p className="text-2xl font-bold text-green-600">{profile.menteeCount}</p>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {profile.id !== 'temp-id' ? (
                  <>
                    <button 
                      onClick={handleEditProfile}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit My Profile
                    </button>
                    <button 
                      onClick={handleDeleteProfile}
                      className="w-full border border-red-300 hover:bg-red-50 text-red-600 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Profile
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">You haven't created a mentor profile yet.</p>
                    <button
                      onClick={() => {
                        // Switch to mentors tab where they can use "Become a Mentor"
                        const event = new CustomEvent('switchToMentorsTab');
                        window.dispatchEvent(event);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Mentor Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <BecomeMentorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        initialData={profile ? {
          expertise: profile.expertise,
          department: profile.department,
          availability: profile.availability,
          bio: profile.bio,
          experience: profile.experience,
          title: profile.title,
          skills: profile.skills,
          rating: profile.rating,
          menteeCount: profile.menteeCount
        } : undefined}
        isEditing={true}
      />
    </div>
  );
};

export default MentorshipProfile;
import React, { useState, useEffect } from 'react';
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
  email?: string;
  location?: string;
  timezone?: string;
  languages?: string[];
  certifications?: string[];
  projects?: string[];
  mentorshipAreas?: string[];
  successStories?: number;
  responseTime?: string;
}

interface MentorProfileModalProps {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (mentorId: string) => void;
  isConnected: boolean;
  onEdit?: (mentor: Mentor) => void;
  onDelete?: (mentorId: string) => void;
}

const MentorProfileModal: React.FC<MentorProfileModalProps> = ({
  mentor,
  isOpen,
  onClose,
  onConnect,
  isConnected,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    if (mentor && isOpen) {
      // Simulate Microsoft Graph API call to enrich profile
      setLoading(true);
      setTimeout(() => {
        setGraphData({
          department: mentor.department,
          office: 'Redmond, WA',
          manager: 'Alex Chen',
          directReports: 8,
          joinDate: '2019-03-15',
          recentProjects: [
            'Azure DevOps Migration',
            'Microservices Architecture',
            'Team Leadership Training'
          ]
        });
        setLoading(false);
      }, 1000);
    }
  }, [mentor, isOpen]);

  if (!isOpen || !mentor) return null;

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'limited': return 'text-yellow-600 bg-yellow-100';
      case 'busy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleConnect = () => {
    onConnect(mentor.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Edit/Delete options for current user */}
            {mentor && user && mentor.email === user.email && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(mentor)}
                    className="text-white hover:text-gray-200 p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                    title="Edit Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(mentor.id)}
                    className="text-white hover:text-red-200 p-1 rounded-lg hover:bg-red-500 hover:bg-opacity-30 transition-colors"
                    title="Delete Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl p-1"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
              {mentor.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{mentor.name}</h2>
              <p className="text-lg opacity-90">{mentor.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor.availability)}`}>
                  {mentor.availability}
                </span>
                <span className="text-sm opacity-75">• {mentor.experience} years experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading detailed profile...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map(skill => (
                      <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mentorship Areas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Mentorship Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.interests.map(area => (
                      <span key={area} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {area.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Microsoft Graph Data */}
                {graphData && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Organizational Context</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{graphData.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Office:</span>
                        <span className="font-medium">{graphData.office}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manager:</span>
                        <span className="font-medium">{graphData.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team Size:</span>
                        <span className="font-medium">{graphData.directReports} direct reports</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tenure:</span>
                        <span className="font-medium">
                          {Math.floor((new Date().getTime() - new Date(graphData.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Projects */}
                {graphData?.recentProjects && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Projects</h3>
                    <ul className="space-y-2">
                      {graphData.recentProjects.map((project: string, index: number) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                          {project}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Mentor Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Rating</span>
                      <div className="flex items-center">
                        <span className="font-bold text-yellow-600">{mentor.rating}</span>
                        <svg className="w-4 h-4 text-yellow-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Current Mentees</span>
                      <span className="font-bold text-blue-600">{mentor.menteeCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Success Stories</span>
                      <span className="font-bold text-green-600">{mentor.menteeCount * 2}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Response Time</span>
                      <span className="font-bold text-purple-600">~2 hours</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Contact Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{mentor.email || `${mentor.name.toLowerCase().replace(' ', '.')}@company.com`}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Timezone:</span>
                      <p className="font-medium">PST (UTC-8)</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Languages:</span>
                      <p className="font-medium">English, Spanish</p>
                    </div>
                  </div>
                </div>

                {/* Connect Button */}
                <div className="sticky bottom-0 bg-white pt-4 border-t">
                  <button
                    onClick={handleConnect}
                    disabled={isConnected}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isConnected
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isConnected ? '✓ Connected' : 'Send Connection Request'}
                  </button>
                  {isConnected && (
                    <p className="text-sm text-green-600 text-center mt-2">
                      You'll receive a response within 24 hours
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorProfileModal;
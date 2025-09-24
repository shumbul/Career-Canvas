import React, { useState } from 'react';

interface MentorshipPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInterests: string[];
  onSave: (preferences: any) => void;
}

const MentorshipPreferencesModal: React.FC<MentorshipPreferencesModalProps> = ({
  isOpen,
  onClose,
  currentInterests,
  onSave
}) => {
  const [preferences, setPreferences] = useState({
    mentorshipType: 'seeking-mentor',
    interests: currentInterests,
    preferredDepartments: [] as string[],
    availabilityType: 'flexible',
    sessionFrequency: 'bi-weekly',
    communicationStyle: 'mixed',
    goals: '',
    experience: ''
  });

  const interestOptions = [
    'career-growth', 'technical-skills', 'leadership', 'career-transition',
    'product-management', 'strategy', 'marketing', 'brand-building',
    'engineering-leadership', 'cloud-technologies', 'design',
    'user-experience', 'data-science', 'machine-learning'
  ];

  const departments = ['Engineering', 'Product', 'Marketing', 'Design', 'Analytics', 'Sales'];

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleDepartmentToggle = (dept: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredDepartments: prev.preferredDepartments.includes(dept)
        ? prev.preferredDepartments.filter(d => d !== dept)
        : [...prev.preferredDepartments, dept]
    }));
  };

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Set Mentorship Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Mentorship Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mentorship Type
            </label>
            <select
              value={preferences.mentorshipType}
              onChange={(e) => setPreferences(prev => ({ ...prev, mentorshipType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="seeking-mentor">Seeking a Mentor</option>
              <option value="offering-mentorship">Offering Mentorship</option>
              <option value="both">Both Seeking and Offering</option>
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    preferences.interests.includes(interest)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Departments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Mentor Departments
            </label>
            <div className="flex flex-wrap gap-2">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => handleDepartmentToggle(dept)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    preferences.preferredDepartments.includes(dept)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Availability
            </label>
            <select
              value={preferences.availabilityType}
              onChange={(e) => setPreferences(prev => ({...prev, availabilityType: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="flexible">Flexible - I can adjust my schedule</option>
              <option value="morning">Morning Person - Best before 12 PM</option>
              <option value="afternoon">Afternoon - Best 12 PM - 5 PM</option>
              <option value="evening">Evening - Best after 5 PM</option>
              <option value="weekends">Weekends Only</option>
            </select>
          </div>

          {/* Session Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Session Frequency
            </label>
            <select
              value={preferences.sessionFrequency}
              onChange={(e) => setPreferences(prev => ({...prev, sessionFrequency: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="as-needed">As needed</option>
            </select>
          </div>

          {/* Communication Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Style
            </label>
            <select
              value={preferences.communicationStyle}
              onChange={(e) => setPreferences(prev => ({...prev, communicationStyle: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mixed">Mixed - Video calls and messages</option>
              <option value="video">Video calls preferred</option>
              <option value="chat">Text/chat preferred</option>
              <option value="in-person">In-person when possible</option>
            </select>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Career Goals
            </label>
            <textarea
              value={preferences.goals}
              onChange={(e) => setPreferences(prev => ({...prev, goals: e.target.value}))}
              placeholder="What do you hope to achieve through mentorship?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Experience Level
            </label>
            <textarea
              value={preferences.experience}
              onChange={(e) => setPreferences(prev => ({...prev, experience: e.target.value}))}
              placeholder="Brief overview of your background and current role..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorshipPreferencesModal;
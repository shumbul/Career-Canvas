import React, { useState } from 'react';

interface MentorshipPreferencesFormData {
  mentorshipType: 'seeking-mentor' | 'offering-mentor' | 'both';
  industries: string[];
  skills: string[];
  careerLevels: string[];
  meetingFrequency: string;
  communicationStyle: string;
  goals: string;
  timeCommitment: string;
  remotePreference: string;
  timezone: string;
  preferredTimes: string[];
  bio: string;
  experience: string;
}

const MentorshipPreferencesForm: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<MentorshipPreferencesFormData>({
    mentorshipType: 'seeking-mentor',
    industries: [],
    skills: [],
    careerLevels: [],
    meetingFrequency: 'monthly',
    communicationStyle: 'casual',
    goals: '',
    timeCommitment: '1-2-hours',
    remotePreference: 'hybrid',
    timezone: 'PST',
    preferredTimes: [],
    bio: '',
    experience: ''
  });

  const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Operations'];
  const skillOptions = ['Leadership', 'Public Speaking', 'Technical Skills', 'Project Management', 'Strategy', 'Communication'];
  const careerLevelOptions = ['Entry Level', 'Mid-Level', 'Senior Level', 'Executive'];
  const timeSlotOptions = ['Monday Morning', 'Monday Evening', 'Tuesday Morning', 'Tuesday Evening', 'Wednesday Morning', 'Wednesday Evening', 'Thursday Morning', 'Thursday Evening', 'Friday Morning', 'Friday Evening'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare data for MongoDB
      const preferencesData = {
        userId: 'current-user@example.com', // Replace with actual user ID from auth
        mentorshipType: formData.mentorshipType,
        preferences: {
          industries: formData.industries,
          skills: formData.skills,
          careerLevels: formData.careerLevels,
          meetingFrequency: formData.meetingFrequency,
          communicationStyle: formData.communicationStyle,
          goals: formData.goals.split(',').map(g => g.trim()),
          timeCommitment: formData.timeCommitment,
          remotePreference: formData.remotePreference
        },
        availability: {
          timezone: formData.timezone,
          preferredTimes: formData.preferredTimes,
          startDate: new Date().toISOString(),
          endDate: null
        },
        bio: formData.bio,
        experience: formData.experience
      };

      // Submit to MongoDB via Azure Function
      const response = await fetch('http://localhost:7071/api/submitMentorshipPreferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesData)
      });

      const result = await response.json();

      if (result.success) {
        setIsFormOpen(false);
        alert('Mentorship preferences saved successfully!');
      } else {
        throw new Error(result.error?.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    }
  };

  const handleCheckboxChange = (field: keyof Pick<MentorshipPreferencesFormData, 'industries' | 'skills' | 'careerLevels' | 'preferredTimes'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md"
      >
        {isFormOpen ? 'Cancel' : 'Set Mentorship Preferences'}
      </button>

      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-4 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mentorship Preferences</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mentorship Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am looking to:
              </label>
              <div className="space-y-2">
                {[
                  { value: 'seeking-mentor', label: 'Find a mentor' },
                  { value: 'offering-mentor', label: 'Become a mentor' },
                  { value: 'both', label: 'Both mentor and be mentored' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="mentorshipType"
                      value={option.value}
                      checked={formData.mentorshipType === option.value}
                      onChange={(e) => setFormData({ ...formData, mentorshipType: e.target.value as any })}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industries of Interest:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {industryOptions.map(industry => (
                  <label key={industry} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.industries.includes(industry)}
                      onChange={() => handleCheckboxChange('industries', industry)}
                      className="mr-2"
                    />
                    {industry}
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Focus:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {skillOptions.map(skill => (
                  <label key={skill} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleCheckboxChange('skills', skill)}
                      className="mr-2"
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            {/* Career Levels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Mentor/Mentee Level:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {careerLevelOptions.map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.careerLevels.includes(level)}
                      onChange={() => handleCheckboxChange('careerLevels', level)}
                      className="mr-2"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Meeting Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Frequency:
              </label>
              <select
                value={formData.meetingFrequency}
                onChange={(e) => setFormData({ ...formData, meetingFrequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="as-needed">As needed</option>
              </select>
            </div>

            {/* Goals */}
            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">
                Career Goals (comma-separated):
              </label>
              <textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows={3}
                placeholder="e.g., Improve leadership skills, Learn new technologies, Prepare for promotion"
              />
            </div>

            {/* Preferred Times */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Meeting Times:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlotOptions.map(time => (
                  <label key={time} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferredTimes.includes(time)}
                      onChange={() => handleCheckboxChange('preferredTimes', time)}
                      className="mr-2"
                    />
                    {time}
                  </label>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio/Introduction:
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows={4}
                placeholder="Tell others about yourself, your experience, and what you're looking for..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MentorshipPreferencesForm;
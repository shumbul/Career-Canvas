import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface BecomeMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<MentorFormData>;
  isEditing?: boolean;
}

interface MentorFormData {
  expertise: string[];
  department: string;
  availability: 'available' | 'busy' | 'limited';
  bio: string;
  experience: number;
  title: string;
  skills: string[];
  rating?: number;
  menteeCount?: number;
  mentorshipHistory?: {
    totalMentees: number;
    completedSessions: number;
    averageRating: number;
    specializations: string[];
  };
}

const BecomeMentorModal: React.FC<BecomeMentorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditing = false
}) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MentorFormData>({
    expertise: [],
    department: '',
    availability: 'available',
    bio: '',
    experience: 0,
    title: '',
    skills: []
  });

  const departmentOptions = [
    'Engineering', 'Product', 'Marketing', 'Design', 'Analytics', 
    'Sales', 'Operations', 'Finance', 'HR', 'Legal'
  ];

  const skillOptions = [
    'React', 'TypeScript', 'Leadership', 'System Design', 'Python',
    'Product Strategy', 'Data Analysis', 'Agile', 'User Research',
    'Digital Marketing', 'Brand Strategy', 'Team Management',
    'Cloud Architecture', 'Microservices', 'DevOps', 'Mentoring',
    'User Experience', 'Design Systems', 'Prototyping', 'Figma',
    'Machine Learning', 'Statistics', 'Data Visualization', 'SQL',
    'Sales Strategy', 'Client Relations', 'Negotiation', 'CRM',
    'Financial Analysis', 'Budgeting', 'Risk Management'
  ];

  const expertiseOptions = [
    'career-growth', 'technical-skills', 'leadership', 'career-transition',
    'product-management', 'strategy', 'marketing', 'brand-building',
    'engineering-leadership', 'cloud-technologies', 'design',
    'user-experience', 'data-science', 'machine-learning', 'sales',
    'business-development', 'devops', 'automation', 'finance'
  ];

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData(prev => ({
        ...prev,
        expertise: initialData.expertise || prev.expertise,
        department: initialData.department || prev.department,
        availability: initialData.availability || prev.availability,
        bio: initialData.bio || prev.bio,
        experience: initialData.experience || prev.experience,
        title: initialData.title || prev.title,
        skills: initialData.skills || prev.skills
      }));
    }
  }, [initialData, isEditing]);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleExpertiseToggle = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    // Validate required fields
    if (!formData.department || !formData.bio || !formData.title || formData.skills.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const mentorData = {
        name: user.name,
        email: user.email,
        title: formData.title,
        department: formData.department,
        skills: formData.skills,
        bio: formData.bio,
        experience: formData.experience,
        availability: formData.availability,
        rating: isEditing && initialData ? initialData.rating : 5.0,
        menteeCount: isEditing && initialData ? initialData.menteeCount : 0,
        interests: formData.expertise,
        lastActive: new Date().toISOString(),
        mentorshipHistory: isEditing && initialData ? initialData.mentorshipHistory : {
          totalMentees: 0,
          completedSessions: 0,
          averageRating: 5.0,
          specializations: formData.expertise
        }
      };

      // Use the same endpoint but different HTTP methods
      const url = 'http://localhost:7071/api/createMentorProfile';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mentorData)
      });

      if (response.ok) {
        alert(isEditing ? 'Mentor profile updated successfully!' : 'Mentor profile created successfully!');
        onSuccess();
        onClose();
        // Reset form only if creating new profile
        if (!isEditing) {
          setFormData({
            expertise: [],
            department: '',
            availability: 'available',
            bio: '',
            experience: 0,
            title: '',
            skills: []
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`API Error:`, errorData);
        alert(`Error ${isEditing ? 'updating' : 'creating'} mentor profile: ${errorData.error || `HTTP ${response.status}`}`);
      }
    } catch (error) {
      console.error(`Network Error ${isEditing ? 'updating' : 'creating'} mentor profile:`, error);
      alert(`Network error ${isEditing ? 'updating' : 'creating'} mentor profile. Please check if the backend is running and try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Mentor Profile' : 'Become a Mentor'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Senior Software Engineer, Product Manager"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select Department</option>
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills * (Select at least one)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {skillOptions.map(skill => (
                <label key={skill} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="mr-2"
                  />
                  {skill}
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Selected: {formData.skills.length} skills
            </p>
          </div>

          {/* Expertise Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mentorship Expertise Areas
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {expertiseOptions.map(expertise => (
                <label key={expertise} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={formData.expertise.includes(expertise)}
                    onChange={() => handleExpertiseToggle(expertise)}
                    className="mr-2"
                  />
                  {expertise.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="available">Available - Actively taking new mentees</option>
              <option value="limited">Limited - Selective about new mentees</option>
              <option value="busy">Busy - Not taking new mentees currently</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio * (Tell potential mentees about yourself)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Share your professional journey, what you're passionate about, and how you can help mentees grow..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 outline-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.department || !formData.bio || !formData.title || formData.skills.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (isEditing ? 'Updating Profile...' : 'Creating Profile...') : (isEditing ? 'Update Profile' : 'Become a Mentor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeMentorModal;
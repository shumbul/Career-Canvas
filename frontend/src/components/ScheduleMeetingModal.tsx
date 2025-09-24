import React, { useState } from 'react';
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
}

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
  selectedSlot: {
    day: string;
    time: string;
    date: string;
  } | null;
  onScheduleSuccess: (bookedSlot: { date: string; time: string }) => void;
}

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  mentor,
  selectedSlot,
  onScheduleSuccess
}) => {
  const { user, token } = useAuth();
  const [isScheduling, setIsScheduling] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  if (!isOpen || !selectedSlot) return null;

  const formatDateTime = () => {
    const date = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleScheduleMeeting = async () => {
    if (!user || !token) {
      alert('Please log in to schedule a meeting.');
      return;
    }

    setIsScheduling(true);

    try {
      // Create the meeting date/time
      const startDateTime = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (meetingDuration * 60000));

      // Prepare the meeting data for Microsoft Graph API
      const meetingData = {
        subject: meetingTopic || `Mentorship Session with ${mentor.name}`,
        body: {
          contentType: 'HTML',
          content: `
            <p><strong>Mentorship Session</strong></p>
            <p><strong>Mentor:</strong> ${mentor.name} - ${mentor.title}</p>
            <p><strong>Department:</strong> ${mentor.department}</p>
            ${meetingNotes ? `<p><strong>Notes:</strong> ${meetingNotes}</p>` : ''}
            <p>This meeting was scheduled through Career Canvas.</p>
          `
        },
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'UTC'
        },
        attendees: [
          {
            emailAddress: {
              address: mentor.email || `${mentor.name.toLowerCase().replace(' ', '.')}@company.com`,
              name: mentor.name
            },
            type: 'required'
          }
        ],
        location: {
          displayName: 'Microsoft Teams Meeting'
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness'
      };

      console.log('Creating Teams meeting with data:', meetingData);

      // Call the backend API to create the Teams meeting
      const response = await fetch('http://localhost:7071/api/scheduleTeamsMeeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meetingData,
          mentorId: mentor.id,
          userId: user.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Meeting scheduled successfully:', result);
        
        // Show success message
        alert(`Meeting scheduled successfully! Teams invite sent to ${mentor.name}. You should receive a calendar invitation shortly.`);
        
        // Close modal and trigger success callback with booked slot info
        onScheduleSuccess({
          date: selectedSlot.date,
          time: selectedSlot.time
        });
      } else {
        const error = await response.json();
        console.error('Failed to schedule meeting:', error);
        throw new Error(error.message || 'Failed to schedule meeting');
      }

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert(`Failed to schedule meeting: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Schedule Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isScheduling}
          >
            ×
          </button>
        </div>

        {/* Meeting Details */}
        <div className="space-y-4">
          {/* Mentor Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{mentor.name}</h3>
                <p className="text-sm text-gray-600">{mentor.title}</p>
                <p className="text-xs text-gray-500">{mentor.department}</p>
              </div>
            </div>
          </div>

          {/* Selected Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Time
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 font-medium">{formatDateTime()}</p>
            </div>
          </div>

          {/* Meeting Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              value={meetingDuration}
              onChange={(e) => setMeetingDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isScheduling}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          {/* Meeting Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Topic
            </label>
            <input
              type="text"
              value={meetingTopic}
              onChange={(e) => setMeetingTopic(e.target.value)}
              placeholder="e.g., Career Development Discussion"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isScheduling}
            />
          </div>

          {/* Meeting Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              placeholder="Any specific topics you'd like to discuss..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              disabled={isScheduling}
            />
          </div>

          {/* Teams Meeting Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Microsoft Teams Meeting</p>
                <p className="text-blue-700">A Teams meeting link will be automatically generated and sent to both participants.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={isScheduling}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleScheduleMeeting}
            disabled={isScheduling}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isScheduling ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                </svg>
                Scheduling...
              </>
            ) : (
              'Connect & Schedule'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
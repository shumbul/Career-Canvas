import React, { useState, useEffect } from 'react';
import ScheduleMeetingModal from './ScheduleMeetingModal';

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number; // in minutes
}

interface CalendarDay {
  date: string;
  dayName: string;
  timeSlots: TimeSlot[];
}

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

interface MentorCalendarProps {
  mentor: Mentor;
  onViewProfile: (mentor: Mentor) => void;
  onReturnToHome?: () => void;
}

const MentorCalendar: React.FC<MentorCalendarProps> = ({ mentor, onViewProfile, onReturnToHome }) => {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = next week
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: string; time: string; date: string } | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Load booked slots from localStorage on component mount
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`bookedSlots_${mentor.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persist booked slots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`bookedSlots_${mentor.id}`, JSON.stringify(Array.from(bookedSlots)));
  }, [bookedSlots, mentor.id]);

  // Generate mock availability data for the mentor
  useEffect(() => {
    const generateCalendarDays = () => {
      const days = [];
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + (selectedWeek * 7));

      // Generate 7 days starting from the selected week
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Generate time slots (9 AM to 5 PM, 30-minute slots)
        const timeSlots: TimeSlot[] = [];
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Check if this slot is already booked
            const slotKey = `${dateStr}T${time}`;
            const isBooked = bookedSlots.has(slotKey);
            
            // Mock availability based on mentor's general availability and some randomness
            let available = true;
            if (isBooked) {
              available = false; // Booked slots are not available
            } else if (mentor.availability === 'busy') {
              available = Math.random() < 0.3; // 30% available if busy
            } else if (mentor.availability === 'limited') {
              available = Math.random() < 0.6; // 60% available if limited
            } else {
              available = Math.random() < 0.8; // 80% available if available
            }
            
            // Make weekends less available
            if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
              available = available && Math.random() < 0.4;
            }
            
            timeSlots.push({
              time,
              available,
              duration: 30
            });
          }
        }
        
        days.push({
          date: dateStr,
          dayName,
          timeSlots
        });
      }
      
      return days;
    };

    setCalendarDays(generateCalendarDays());
  }, [selectedWeek, mentor, bookedSlots]);

  const handleTimeSlotSelect = (day: CalendarDay, timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;
    
    setSelectedTimeSlot({
      day: day.dayName,
      time: timeSlot.time,
      date: day.date
    });
    setIsScheduleModalOpen(true);
  };

  const getWeekLabel = () => {
    if (selectedWeek === 0) return 'This Week';
    if (selectedWeek === 1) return 'Next Week';
    return `Week ${selectedWeek + 1}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-800">{mentor.name}</h2>
              <button
                onClick={() => onViewProfile(mentor)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                View Profile
              </button>
            </div>
            <p className="text-gray-600">{mentor.title}</p>
            <p className="text-sm text-gray-500">{mentor.department}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
            disabled={selectedWeek === 0}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-20 text-center">
            {getWeekLabel()}
          </span>
          <button
            onClick={() => setSelectedWeek(selectedWeek + 1)}
            disabled={selectedWeek >= 3} // Limit to 4 weeks ahead
            className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Availability Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Availability Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            mentor.availability === 'available' ? 'bg-green-100 text-green-800' :
            mentor.availability === 'limited' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {mentor.availability === 'available' ? 'Highly Available' :
             mentor.availability === 'limited' ? 'Limited Availability' :
             'Currently Busy'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 mb-4 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span className="text-gray-600">Busy</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-200 rounded"></div>
          <span className="text-gray-600">Selected</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {calendarDays.map((day, index) => (
          <div key={index} className="text-center">
            <div className="font-semibold text-gray-700 text-sm mb-2">
              {day.dayName}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              {formatDate(day.date)}
            </div>
            
            {/* Time Slots */}
            <div className="space-y-1">
              {day.timeSlots.map((slot, slotIndex) => (
                <button
                  key={slotIndex}
                  onClick={() => handleTimeSlotSelect(day, slot)}
                  disabled={!slot.available}
                  className={`w-full text-xs py-1 px-1 rounded transition-colors ${
                    slot.available
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  } ${
                    selectedTimeSlot?.date === day.date && selectedTimeSlot?.time === slot.time
                      ? 'bg-blue-200 text-blue-800'
                      : ''
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        mentor={mentor}
        selectedSlot={selectedTimeSlot}
        onScheduleSuccess={(bookedSlot: { date: string; time: string }) => {
          setIsScheduleModalOpen(false);
          setSelectedTimeSlot(null);
          
          // Add the booked slot to our set
          if (bookedSlot) {
            const slotKey = `${bookedSlot.date}T${bookedSlot.time}`;
            setBookedSlots(prev => {
              const newSet = new Set(prev);
              newSet.add(slotKey);
              console.log('Added booked slot:', slotKey, 'Total booked slots:', newSet.size);
              return newSet;
            });
          }
          
          // Show success message and return to homepage after a brief delay
          setTimeout(() => {
            if (onReturnToHome) {
              onReturnToHome();
            }
          }, 1500); // Give time to see the updated calendar before navigating away
        }}
      />
    </div>
  );
};

export default MentorCalendar;
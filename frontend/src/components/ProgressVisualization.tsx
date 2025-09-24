import React from 'react';

interface ProgressData {
  mentorshipGoals: {
    completed: number;
    total: number;
    goals: Array<{
      id: string;
      title: string;
      progress: number;
      status: 'completed' | 'in-progress' | 'not-started';
    }>;
  };
  storySubmissions: {
    thisMonth: number;
    target: number;
    total: number;
    recentStories: Array<{
      title: string;
      date: string;
      engagement: number;
    }>;
  };
  shortTermProjects: {
    completed: number;
    inProgress: number;
    total: number;
    projects: Array<{
      id: string;
      name: string;
      progress: number;
      dueDate: string;
      status: 'completed' | 'in-progress' | 'overdue';
    }>;
  };
}

// Mock data - replace with real data from your backend
const mockProgressData: ProgressData = {
  mentorshipGoals: {
    completed: 3,
    total: 5,
    goals: [
      { id: '1', title: 'Complete Leadership Training', progress: 100, status: 'completed' },
      { id: '2', title: 'Build Public Speaking Skills', progress: 75, status: 'in-progress' },
      { id: '3', title: 'Develop Technical Expertise', progress: 60, status: 'in-progress' },
      { id: '4', title: 'Network with Industry Leaders', progress: 40, status: 'in-progress' },
      { id: '5', title: 'Prepare for Promotion', progress: 0, status: 'not-started' },
    ]
  },
  storySubmissions: {
    thisMonth: 4,
    target: 6,
    total: 23,
    recentStories: [
      { title: 'My First Leadership Challenge', date: '2025-09-15', engagement: 85 },
      { title: 'Overcoming Technical Obstacles', date: '2025-09-10', engagement: 92 },
      { title: 'Building Team Collaboration', date: '2025-09-05', engagement: 78 },
      { title: 'Career Pivot Success Story', date: '2025-09-01', engagement: 88 },
    ]
  },
  shortTermProjects: {
    completed: 8,
    inProgress: 3,
    total: 11,
    projects: [
      { id: '1', name: 'Complete React Certification', progress: 90, dueDate: '2025-09-30', status: 'in-progress' },
      { id: '2', name: 'Mentor 2 Junior Developers', progress: 50, dueDate: '2025-10-15', status: 'in-progress' },
      { id: '3', name: 'Present at Tech Conference', progress: 25, dueDate: '2025-11-01', status: 'in-progress' },
    ]
  }
};

const ProgressVisualization: React.FC = () => {
  const data = mockProgressData;

  const CircularProgress = ({ 
    value, 
    max, 
    size = 120, 
    strokeWidth = 8, 
    color = '#2563EB' 
  }: {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const percentage = (value / max) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">of {max}</div>
          </div>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ 
    value, 
    max, 
    color = '#2563EB', 
    height = 'h-3' 
  }: {
    value: number;
    max: number;
    color?: string;
    height?: string;
  }) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-300 ease-in-out`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#2563EB';
      case 'overdue': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'overdue': 'bg-red-100 text-red-800',
      'not-started': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8 p-6 bg-white">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Progress Dashboard</h2>
        <p className="text-gray-600 mt-1">Track your career development journey</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mentorship Goals */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mentorship Goals</h3>
            <div className="text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <CircularProgress 
            value={data.mentorshipGoals.completed} 
            max={data.mentorshipGoals.total} 
            color="#2563EB"
          />
          <p className="text-sm text-gray-600 mt-4">
            {Math.round((data.mentorshipGoals.completed / data.mentorshipGoals.total) * 100)}% Complete
          </p>
        </div>

        {/* Story Submissions */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Story Submissions</h3>
            <div className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <CircularProgress 
            value={data.storySubmissions.thisMonth} 
            max={data.storySubmissions.target} 
            color="#10B981"
          />
          <p className="text-sm text-gray-600 mt-4">
            This month's goal • {data.storySubmissions.total} total stories
          </p>
        </div>

        {/* Projects */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <div className="text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <CircularProgress 
            value={data.shortTermProjects.completed} 
            max={data.shortTermProjects.total} 
            color="#7C3AED"
          />
          <p className="text-sm text-gray-600 mt-4">
            {data.shortTermProjects.inProgress} in progress
          </p>
        </div>
      </div>

      {/* Detailed Progress Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mentorship Goals Detail */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress</h4>
          <div className="space-y-4">
            {data.mentorshipGoals.goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{goal.progress}%</span>
                    {getStatusBadge(goal.status)}
                  </div>
                </div>
                <ProgressBar 
                  value={goal.progress} 
                  max={100} 
                  color={getStatusColor(goal.status)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h4>
          <div className="space-y-4">
            {data.shortTermProjects.projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{project.name}</span>
                    <p className="text-xs text-gray-500">Due: {new Date(project.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                    {getStatusBadge(project.status)}
                  </div>
                </div>
                <ProgressBar 
                  value={project.progress} 
                  max={100} 
                  color={getStatusColor(project.status)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Stories Engagement */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Story Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.storySubmissions.recentStories.map((story, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{story.title}</h5>
              <p className="text-xs text-gray-500 mb-2">{new Date(story.date).toLocaleDateString()}</p>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Engagement</span>
                  <span className="text-xs font-medium text-gray-900">{story.engagement}%</span>
                </div>
                <ProgressBar value={story.engagement} max={100} height="h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressVisualization;
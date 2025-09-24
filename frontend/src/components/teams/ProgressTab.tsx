import React, { useEffect, useState } from 'react';
import ProgressVisualization from '../ProgressVisualization';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  category: 'skill-development' | 'networking' | 'career-advancement' | 'leadership';
}

interface Activity {
  id: string;
  type: 'story-shared' | 'mentor-connected' | 'goal-created' | 'goal-completed';
  title: string;
  description: string;
  date: Date;
  points: number;
}

const ProgressTab: React.FC = () => {
  const [teamsContext, setTeamsContext] = useState<any>(null);
  const [isTeamsEnvironment, setIsTeamsEnvironment] = useState(false);
  
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Learn React Advanced Patterns',
      description: 'Master advanced React patterns including hooks, context, and performance optimization',
      targetDate: new Date('2025-12-31'),
      progress: 65,
      status: 'in-progress',
      category: 'skill-development'
    },
    {
      id: '2',
      title: 'Connect with 5 Senior Engineers',
      description: 'Build relationships with senior engineers in different teams',
      targetDate: new Date('2025-11-30'),
      progress: 40,
      status: 'in-progress',
      category: 'networking'
    },
    {
      id: '3',
      title: 'Complete Leadership Training',
      description: 'Finish the company leadership development program',
      targetDate: new Date('2025-10-15'),
      progress: 100,
      status: 'completed',
      category: 'leadership'
    }
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'story-shared',
      title: 'Shared Career Story',
      description: 'Posted "From Intern to Senior Developer" story',
      date: new Date('2025-09-15'),
      points: 50
    },
    {
      id: '2',
      type: 'mentor-connected',
      title: 'Connected with Sarah Johnson',
      description: 'Started mentorship with Senior Software Engineer',
      date: new Date('2025-09-12'),
      points: 100
    },
    {
      id: '3',
      type: 'goal-completed',
      title: 'Goal Completed',
      description: 'Finished Leadership Training program',
      date: new Date('2025-09-10'),
      points: 200
    }
  ]);

  useEffect(() => {
    if (window.microsoftTeams) {
      setIsTeamsEnvironment(true);
      window.microsoftTeams.initialize();
      
      window.microsoftTeams.getContext((context) => {
        setTeamsContext(context);
      });
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill-development':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
          </svg>
        );
      case 'networking':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      case 'leadership':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'story-shared':
        return '📖';
      case 'mentor-connected':
        return '🤝';
      case 'goal-created':
        return '🎯';
      case 'goal-completed':
        return '✅';
      default:
        return '📈';
    }
  };

  const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0);
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const activeGoals = goals.filter(goal => goal.status === 'in-progress').length;

  return (
    <div className="teams-tab-container">
      {/* Teams-specific header */}
      {isTeamsEnvironment && teamsContext && (
        <div className="bg-purple-600 text-white p-4 mb-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold">Career Progress</h2>
            <p className="text-purple-100">
              Track your career development journey and celebrate your achievements!
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen">
        {/* New Progress Visualization */}
        <ProgressVisualization />
        
        {/* Legacy Stats Overview - keeping for additional context */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalPoints}</div>
              <div className="text-gray-600">Career Points</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{completedGoals}</div>
              <div className="text-gray-600">Goals Completed</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{activeGoals}</div>
              <div className="text-gray-600">Active Goals</div>
            </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{activities.length}</div>
            <div className="text-gray-600">Recent Activities</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Career Goals */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Career Goals</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                Add Goal
              </button>
            </div>
            
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="text-blue-600 mr-3">
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Target: {goal.targetDate.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                      <span className="text-blue-600 font-medium">+{activity.points} pts</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.date.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
              View All Activities
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Set New Goal</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Update Progress</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              <span>Find Mentor</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'career' | 'ai-copilot' | 'soft-skills';
  format: 'video' | 'article' | 'course' | 'path';
  provider: 'Microsoft Learn' | 'LinkedIn Learning' | 'Viva Learning';
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  roles: string[];
  tags: string[];
  url: string;
  thumbnail?: string;
  rating: number;
}

const LearningResources: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'technical' | 'career' | 'ai-copilot' | 'soft-skills'>('technical');
  const [filters, setFilters] = useState({
    role: 'All Roles',
    level: 'All Levels',
    format: 'All Formats',
    provider: 'All Providers'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mock learning resources data
  const learningResources: LearningResource[] = [
    {
      id: '1',
      title: 'React Development Fundamentals',
      description: 'Master the fundamentals of React development with hands-on projects and real-world examples.',
      category: 'technical',
      format: 'course',
      provider: 'Microsoft Learn',
      duration: '8 hours',
      level: 'beginner',
      roles: ['Frontend Developer', 'Full Stack Developer'],
      tags: ['React', 'JavaScript', 'Web Development'],
      url: 'https://docs.microsoft.com/learn/paths/react/',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Career Growth Strategies',
      description: 'Learn effective strategies for advancing your career and building professional relationships.',
      category: 'career',
      format: 'video',
      provider: 'LinkedIn Learning',
      duration: '45 min',
      level: 'intermediate',
      roles: ['All Roles'],
      tags: ['Career Development', 'Leadership', 'Networking'],
      url: 'https://linkedin.com/learning',
      rating: 4.6
    },
    {
      id: '3',
      title: 'GitHub Copilot for Developers',
      description: 'Maximize your productivity with GitHub Copilot and AI-powered coding assistance.',
      category: 'ai-copilot',
      format: 'path',
      provider: 'Microsoft Learn',
      duration: '3 hours',
      level: 'intermediate',
      roles: ['Developer', 'Engineer'],
      tags: ['GitHub Copilot', 'AI', 'Productivity'],
      url: 'https://docs.microsoft.com/learn/paths/copilot/',
      rating: 4.9
    },
    {
      id: '4',
      title: 'Effective Communication Skills',
      description: 'Develop strong communication skills for better collaboration and leadership.',
      category: 'soft-skills',
      format: 'course',
      provider: 'Viva Learning',
      duration: '2 hours',
      level: 'beginner',
      roles: ['All Roles'],
      tags: ['Communication', 'Collaboration', 'Leadership'],
      url: 'https://viva.microsoft.com/learning',
      rating: 4.7
    },
    {
      id: '5',
      title: 'Azure Cloud Architecture',
      description: 'Design and implement scalable cloud solutions using Microsoft Azure services.',
      category: 'technical',
      format: 'path',
      provider: 'Microsoft Learn',
      duration: '12 hours',
      level: 'advanced',
      roles: ['Cloud Architect', 'DevOps Engineer'],
      tags: ['Azure', 'Cloud Computing', 'Architecture'],
      url: 'https://docs.microsoft.com/learn/paths/azure-architect/',
      rating: 4.8
    },
    {
      id: '6',
      title: 'Building Personal Brand',
      description: 'Create and maintain a strong professional brand across digital platforms.',
      category: 'career',
      format: 'article',
      provider: 'LinkedIn Learning',
      duration: '30 min',
      level: 'beginner',
      roles: ['All Roles'],
      tags: ['Personal Branding', 'Social Media', 'Networking'],
      url: 'https://linkedin.com/learning/personal-branding',
      rating: 4.5
    }
  ];

  const tabs = [
    { id: 'technical', name: 'Technical Skills', icon: '💻' },
    { id: 'career', name: 'Career Development', icon: '📈' },
    { id: 'ai-copilot', name: 'AI & Copilot', icon: '🤖' },
    { id: 'soft-skills', name: 'Soft Skills', icon: '🤝' }
  ];

  // Filter and search resources
  const filteredResources = useMemo(() => {
    return learningResources.filter(resource => {
      const matchesTab = resource.category === activeTab;
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLevel = filters.level === 'All Levels' || resource.level === filters.level.toLowerCase();
      const matchesFormat = filters.format === 'All Formats' || resource.format === filters.format.toLowerCase();
      const matchesProvider = filters.provider === 'All Providers' || resource.provider === filters.provider;
      const matchesRole = filters.role === 'All Roles' || resource.roles.includes(filters.role) || resource.roles.includes('All Roles');

      return matchesTab && matchesSearch && matchesLevel && matchesFormat && matchesProvider && matchesRole;
    });
  }, [activeTab, searchTerm, filters, learningResources]);

  // Get recommended resources (mock based on user profile)
  const recommendedResources = useMemo(() => {
    return learningResources.slice(0, 3).map(resource => ({
      ...resource,
      recommended: true
    }));
  }, [learningResources]);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'course': return '📚';
      case 'path': return '🛤️';
      default: return '📖';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Learning Resources</h1>
        <p className="text-xl text-gray-600">Curated learning paths and resources to advance your career</p>
      </div>

      {/* Recommended for You Section */}
      {user && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedResources.map((resource) => (
              <div key={`rec-${resource.id}`} className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-1">
                <div className="bg-white rounded-lg p-4 h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{getFormatIcon(resource.format)}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Recommended</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{resource.provider}</span>
                    <span>{resource.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search learning resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>All Roles</option>
              <option>Frontend Developer</option>
              <option>Full Stack Developer</option>
              <option>Cloud Architect</option>
              <option>DevOps Engineer</option>
              <option>Product Manager</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <select
              value={filters.format}
              onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>All Formats</option>
              <option>Video</option>
              <option>Article</option>
              <option>Course</option>
              <option>Path</option>
            </select>

            <select
              value={filters.provider}
              onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>All Providers</option>
              <option>Microsoft Learn</option>
              <option>LinkedIn Learning</option>
              <option>Viva Learning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Learning Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFormatIcon(resource.format)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(resource.level)}`}>
                    {resource.level}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-600">{resource.rating}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {resource.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{resource.provider}</span>
                <span>{resource.duration}</span>
              </div>

              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Start Learning
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No resources found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters to find more learning resources</p>
        </div>
      )}
    </div>
  );
};

export default LearningResources;
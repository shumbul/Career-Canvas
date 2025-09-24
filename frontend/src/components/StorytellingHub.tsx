import React, { useState, useEffect } from 'react';

interface Story {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: Date;
  media?: string;
  likes: number;
}

interface StoryFormData {
  title: string;
  content: string;
  tags: string;
  media?: string;
}

const StorytellingHub: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    tags: '',
    media: ''
  });
  
  // Current user ID - in a real app, this would come from authentication context
  const currentUserId = 'current-user@example.com';

  // Fetch stories from MongoDB
  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:7071/api/getStories');
      const result = await response.json();

      if (result.success) {
        // Convert createdAt strings back to Date objects
        const storiesWithDates = result.stories.map((story: any) => ({
          ...story,
          createdAt: new Date(story.createdAt)
        }));
        setStories(storiesWithDates);
      } else {
        console.error('Failed to fetch stories:', result.error);
        // Show user-friendly error or keep empty array
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      // Fallback to empty array - user will see "No stories yet" message
    } finally {
      setIsLoading(false);
    }
  };

  // Load stories when component mounts
  useEffect(() => {
    fetchStories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare data for MongoDB
      const storyData = {
        userId: currentUserId,
        title: formData.title,
        content: formData.content,
        category: 'career-growth', // You can make this dynamic with a dropdown
        tags: formData.tags.split(',').map(tag => tag.trim()),
        careerLevel: 'mid', // You can make this dynamic
        industry: 'technology', // You can make this dynamic
        mediaUrls: formData.media ? [formData.media] : [],
        isPublic: true
      };

      let response;
      let successMessage;

      if (editingStory) {
        // Update existing story
        response = await fetch(`http://localhost:7071/api/updateStory?id=${editingStory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(storyData)
        });
        successMessage = 'Story updated successfully!';
      } else {
        // Create new story
        response = await fetch('http://localhost:7071/api/submitStory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(storyData)
        });
        successMessage = 'Story submitted successfully!';
      }

      const result = await response.json();

      if (result.success) {
        // Reset form and close
        setFormData({ title: '', content: '', tags: '', media: '' });
        setIsFormOpen(false);
        setEditingStory(null);
        
        // Refresh stories list from database
        await fetchStories();
        
        // Show success message
        alert(successMessage);
      } else {
        throw new Error(result.error?.message || 'Failed to save story');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Error saving story. Please try again.');
    }
  };

  const handleLike = (storyId: string) => {
    setStories(stories.map(story => 
      story.id === storyId 
        ? { ...story, likes: story.likes + 1 }
        : story
    ));
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      tags: story.tags.join(', '),
      media: story.media || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (storyId: string) => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:7071/api/deleteStory?id=${storyId}&userId=${currentUserId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // Refresh stories list
        await fetchStories();
        alert('Story deleted successfully!');
      } else {
        throw new Error(result.error?.message || 'Failed to delete story');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Error deleting story. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingStory(null);
    setFormData({ title: '', content: '', tags: '', media: '' });
    setIsFormOpen(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Professional Stories</h1>
        <p className="text-gray-600 text-lg">Share your career journey and inspire others</p>
      </div>

      {/* Add Story Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            if (isFormOpen) {
              handleCancelEdit();
            } else {
              setIsFormOpen(true);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md"
        >
          {isFormOpen ? 'Cancel' : 'Share Your Story'}
        </button>
      </div>

      {/* Story Form */}
      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {editingStory ? 'Edit Your Story' : 'Share Your Professional Story'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Story Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., How I Landed My Dream Job During COVID"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Your Story *
              </label>
              <textarea
                id="content"
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-vertical"
                placeholder="Share your experience, challenges, lessons learned, and advice for others..."
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="career-change, leadership, remote-work (comma separated)"
              />
            </div>

            <div>
              <label htmlFor="media" className="block text-sm font-medium text-gray-700 mb-2">
                Media URL (optional)
              </label>
              <input
                type="url"
                id="media"
                value={formData.media}
                onChange={(e) => setFormData({ ...formData, media: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {editingStory ? 'Update Story' : 'Publish Story'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stories List */}
      <div className="space-y-6">
        {stories.map((story) => (
          <div key={story.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            {/* Story Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h2>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span className="font-medium text-gray-700">{story.author}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(story.createdAt)}</span>
              </div>
            </div>

            {/* Story Content */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{story.content}</p>
            </div>

            {/* Media */}
            {story.media && (
              <div className="mb-4">
                <img
                  src={story.media}
                  alt="Story media"
                  className="rounded-lg max-w-full h-auto shadow-md"
                />
              </div>
            )}

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => handleLike(story.id)}
                className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{story.likes}</span>
              </button>

              <div className="flex gap-4">
                <button className="text-gray-600 hover:text-blue-500 transition-colors duration-200 font-medium">
                  Comment
                </button>
                <button className="text-gray-600 hover:text-green-500 transition-colors duration-200 font-medium">
                  Share
                </button>
                {/* Only show edit/delete for current user's stories */}
                {story.author === currentUserId && (
                  <>
                    <button 
                      onClick={() => handleEdit(story)}
                      className="text-gray-600 hover:text-yellow-500 transition-colors duration-200 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(story.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors duration-200 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {stories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No stories yet</h3>
          <p className="text-gray-500">Be the first to share your professional journey!</p>
        </div>
      )}
    </div>
  );
};

export default StorytellingHub;
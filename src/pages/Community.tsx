import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, ThumbsUp, Share2, Clock, User, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, title, content, created_by, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Fetch profiles based on created_by user IDs
      const userIds = postsData.map(post => post.created_by);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge posts with profiles
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        profile: profilesData?.find(profile => profile.id === post.created_by) || {
          id: post.created_by,
          full_name: 'Anonymous',
          avatar_url: null
        }
      }));

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setError('Please sign in to create a post');
      return;
    }

    try {
      const { error } = await supabase.from('posts').insert([
        {
          title: newPost.title,
          content: newPost.content,
          created_by: user.id,
        },
      ]);

      if (error) throw error;

      setNewPost({ title: '', content: '' });
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleStartChat = async (userId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Check if a chat already exists between these users
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .contains('participant_ids', [user.id, userId])
        .single();

      if (chatError && chatError.code !== 'PGRST116') {
        throw chatError;
      }

      let chatId;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create a new chat
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            participant_ids: [user.id, userId],
            created_by: user.id,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        chatId = newChat.id;
      }

      // Navigate to the chat page
      navigate('/chat');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-6">Community Discussions</h1>

        <div className="bg-white p-6 mb-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Create a Post</h2>
          {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">{error}</div>}
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <input
              type="text"
              placeholder="Post title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
              required
            />
            <button 
              type="submit" 
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition" 
              disabled={!user}
            >
              {user ? 'Post' : 'Sign in to Post'}
            </button>
          </form>
        </div>

        <div>
          {posts.length === 0 ? (
            <p className="text-center">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-6 mb-4 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {post.profile.avatar_url ? (
                    <img src={post.profile.avatar_url} alt={post.profile.full_name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <User className="w-10 h-10 text-gray-500" />
                  )}
                  <div className="ml-3 flex items-center">
                    <p className="font-medium">{post.profile.full_name}</p>
                    {user && user.id !== post.profile.id && (
                      <button
                        onClick={() => handleStartChat(post.profile.id)}
                        className="ml-2 text-gray-500 hover:text-primary-600 transition"
                        title="Start a chat"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 ml-auto flex items-center">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;

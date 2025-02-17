import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, ThumbsUp, Share2, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Please sign in to post');

      const { error } = await supabase.from('posts').insert([
        {
          title: newPost.title,
          content: newPost.content,
          created_by: user.id,
        },
      ]);

      if (error) throw error;

      setNewPost({ title: '', content: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Discussions
          </h1>
          <p className="text-xl text-gray-600">
            Join the conversation and connect with other members
          </p>
        </div>

        {/* Create Post Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create a Post</h2>
          <form onSubmit={handleSubmitPost}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Post title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Post
            </button>
          </form>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">Loading posts...</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {post.profiles.avatar_url ? (
                      <img
                        src={post.profiles.avatar_url}
                        alt={post.profiles.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {post.profiles.full_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.content}</p>
                <div className="flex items-center space-x-4 text-gray-500">
                  <button className="flex items-center hover:text-primary-600">
                    <ThumbsUp className="w-5 h-5 mr-1" />
                    Like
                  </button>
                  <button className="flex items-center hover:text-primary-600">
                    <MessageSquare className="w-5 h-5 mr-1" />
                    Comment
                  </button>
                  <button className="flex items-center hover:text-primary-600">
                    <Share2 className="w-5 h-5 mr-1" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
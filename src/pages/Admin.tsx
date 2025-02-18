import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Trash2, Edit, Save, X, Plus, Calendar, Briefcase, GraduationCap, Users as UsersIcon } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  type: 'event' | 'job' | 'learn' | 'post';
  start_date?: string;
  end_date?: string;
  location?: string;
  category?: string;
}

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  event: {
    title: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  resume_url: string;
  cover_letter: string;
  status: string;
  created_at: string;
  job: {
    title: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'leads'>('users');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<User>>({});
  const [showNewContentForm, setShowNewContentForm] = useState(false);
  const [newContentType, setNewContentType] = useState<'event' | 'job' | 'learn'>('event');
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    category: '',
  });
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Partial<ContentItem>>({});

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    fetchContent();
    fetchLeads();
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const [events, jobs, learn, posts] = await Promise.all([
        supabase.from('events').select('*'),
        supabase.from('jobs').select('*'),
        supabase.from('learn').select('*'),
        supabase.from('posts').select('*')
      ]);

      const allContent = [
        ...(events.data || []).map(e => ({ ...e, type: 'event' as const })),
        ...(jobs.data || []).map(j => ({ ...j, type: 'job' as const })),
        ...(learn.data || []).map(l => ({ ...l, type: 'learn' as const })),
        ...(posts.data || []).map(p => ({ ...p, type: 'post' as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setContent(allContent);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const [registrationsData, applicationsData] = await Promise.all([
        supabase
          .from('event_registrations')
          .select(`
            *,
            event:events(title),
            profiles(full_name, email)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('job_applications')
          .select(`
            *,
            job:jobs(title),
            profiles(full_name, email)
          `)
          .order('created_at', { ascending: false })
      ]);

      if (registrationsData.error) {
        console.error('Error fetching registrations:', registrationsData.error);
        throw registrationsData.error;
      }
      if (applicationsData.error) {
        console.error('Error fetching applications:', applicationsData.error);
        throw applicationsData.error;
      }

      setRegistrations(registrationsData.data || []);
      setApplications(applicationsData.data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleEditUser = (userId: string, user: User) => {
    setEditingUser(userId);
    setEditedValues(user);
  };

  const handleSaveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editedValues)
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, ...editedValues } : u));
      setEditingUser(null);
      setEditedValues({});
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleEditContent = (contentId: string, item: ContentItem) => {
    setEditingContent(contentId);
    setEditedContent(item);
  };

  const handleSaveContent = async (contentId: string, type: string) => {
    try {
      const tableName = type === 'event' ? 'events' : type === 'job' ? 'jobs' : type === 'learn' ? 'learn' : 'posts';
      
      // Remove the 'type' field from editedContent before updating
      const { type: _, ...updateData } = editedContent;
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', contentId);

      if (error) throw error;
      
      setContent(content.map(c => c.id === contentId ? { ...c, ...editedContent } : c));
      setEditingContent(null);
      setEditedContent({});
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleDeleteContent = async (id: string, type: string) => {
    try {
      const tableName = type === 'event' ? 'events' 
                     : type === 'job' ? 'jobs' 
                     : type === 'learn' ? 'learn' 
                     : 'posts';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting content:', error);
        throw error;
      }
      
      // Update local state after successful deletion
      setContent(content.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting content:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const tableName = newContentType === 'event' ? 'events' : newContentType === 'job' ? 'jobs' : 'learn';
      
      let contentData = {
        title: newContent.title,
        description: newContent.description,
        created_by: user.id,
      };

      if (newContentType === 'event' || newContentType === 'learn') {
        contentData = {
          ...contentData,
          start_date: newContent.start_date,
          end_date: newContent.end_date,
          location: newContent.location,
          category: newContent.category,
        };
      }

      const { error, data } = await supabase
        .from(tableName)
        .insert([contentData])
        .select()
        .single();

      if (error) throw error;

      setContent([{ ...data, type: newContentType }, ...content]);
      setShowNewContentForm(false);
      setNewContent({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        category: '',
      });
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const updateLeadStatus = async (id: string, status: string, type: 'registration' | 'application') => {
    try {
      const table = type === 'registration' ? 'event_registrations' : 'job_applications';
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      if (type === 'registration') {
        setRegistrations(registrations.map(r => 
          r.id === id ? { ...r, status } : r
        ));
      } else {
        setApplications(applications.map(a => 
          a.id === id ? { ...a, status } : a
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'leads'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leads
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'users' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <input
                              type="text"
                              value={editedValues.full_name || ''}
                              onChange={(e) =>
                                setEditedValues({ ...editedValues, full_name: e.target.value })
                              }
                              className="border rounded px-2 py-1"
                            />
                          ) : (
                            user.full_name
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <input
                              type="checkbox"
                              checked={editedValues.is_admin || false}
                              onChange={(e) =>
                                setEditedValues({ ...editedValues, is_admin: e.target.checked })
                              }
                              className="rounded text-primary-600"
                            />
                          ) : (
                            <span className={user.is_admin ? 'text-green-600' : 'text-red-600'}>
                              {user.is_admin ? 'Yes' : 'No'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveUser(user.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Save className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditUser(user.id, user)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'content' ? (
              <div>
                {/* New Content Form */}
                {showNewContentForm ? (
                  <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Create New Content</h3>
                      <button
                        onClick={() => setShowNewContentForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <form onSubmit={handleCreateContent} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content Type
                        </label>
                        <select
                          value={newContentType}
                          onChange={(e) => setNewContentType(e.target.value as 'event' | 'job' | 'learn')}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="event">Event</option>
                          <option value="job">Job</option>
                          <option value="learn">Learning Resource</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newContent.title}
                          onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newContent.description}
                          onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          rows={3}
                          required
                        />
                      </div>
                      {(newContentType === 'event' || newContentType === 'learn') && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                              </label>
                              <input
                                type="datetime-local"
                                value={newContent.start_date}
                                onChange={(e) => setNewContent({ ...newContent, start_date: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <input
                                type="datetime-local"
                                value={newContent.end_date}
                                onChange={(e) => setNewContent({ ...newContent, end_date: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={newContent.location}
                              onChange={(e) => setNewContent({ ...newContent, location: e.target.value })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <select
                              value={newContent.category}
                              onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              required
                            >
                              <option value="">Select a category</option>
                              {newContentType === 'event' ? (
                                <>
                                  <option value="hackathon">Hackathon</option>
                                  <option value="workshop">Workshop</option>
                                  <option value="conference">Conference</option>
                                  <option value="meetup">Meetup</option>
                                </>
                              ) : (
                                <>
                                  <option value="course">Course</option>
                                  <option value="workshop">Workshop</option>
                                  <option value="tutorial">Tutorial</option>
                                  <option value="article">Article</option>
                                </>
                              )}
                            </select>
                          </div>
                        </>
                      )}
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowNewContentForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="mb-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setNewContentType('event');
                        setShowNewContentForm(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      New Event
                    </button>
                    <button
                      onClick={() => {
                        setNewContentType('job');
                        setShowNewContentForm(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Briefcase className="h-5 w-5 mr-2" />
                      New Job
                    </button>
                    <button
                      onClick={() => {
                        setNewContentType('learn');
                        setShowNewContentForm(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <GraduationCap className="h-5 w-5 mr-2" />
                      New Learning Resource
                    </button>
                  </div>
                )}

                {/* Content List */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {content.map((item) => (
                        <tr key={`${item.type}-${item.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingContent === item.id ? (
                              <input
                                type="text"
                                value={editedContent.title || item.title}
                                onChange={(e) =>
                                  setEditedContent({ ...editedContent, title: e.target.value })
                                }
                                className="border rounded px-2 py-1 w-full"
                              />
                            ) : (
                              item.title
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap capitalize">{item.type}</td>
                          <td className="px-6 py-4">
                            {editingContent === item.id ? (
                              <textarea
                                value={editedContent.description || item.description}
                                onChange={(e) =>
                                  setEditedContent({ ...editedContent, description: e.target.value })
                                }
                                className="border rounded px-2 py-1 w-full"
                                rows={3}
                              />
                            ) : (
                              <div className="max-w-xs truncate">{item.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              {editingContent === item.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveContent(item.id, item.type)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Save className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingContent(null);
                                      setEditedContent({});
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditContent(item.id, item)}
                                    className="text-primary-600 hover:text-primary-900"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteContent(item.id, item.type)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-6">Event Registrations</h3>
                <div className="overflow-x-auto mb-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrations.map((registration) => (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {registration.event?.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium">{registration.profiles?.full_name}</div>
                              <div className="text-sm text-gray-500">{registration.profiles?.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              registration.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : registration.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {registration.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={registration.status}
                              onChange={(e) => updateLeadStatus(registration.id, e.target.value, 'registration')}
                              className="rounded-md border-gray-300 text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                 Continuing directly from where we left off in the Admin.tsx file:

                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-6">Job Applications</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{application.job?.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium">{application.profiles?.full_name}</div>
                              <div className="text-sm text-gray-500">{application.profiles?.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              application.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : application.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <select
                                value={application.status}
                                onChange={(e) => updateLeadStatus(application.id, e.target.value, 'application')}
                                className="rounded-md border-gray-300 text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              {application.resume_url && (
                                <a
                                  href={application.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  View Resume
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

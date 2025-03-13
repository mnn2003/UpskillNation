import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, Clock, Filter, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  created_at: string;
  image_url?: string;
}

const Learn = () => {
  const [learn, setLearn] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    timeframe: 'all',
  });

  useEffect(() => {
    fetchLearn();
  }, []);

  const fetchLearn = async () => {
    try {
      const { data, error } = await supabase
        .from('learn')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setLearn(data || []);
    } catch (error) {
      console.error('Error fetching learn:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLearn = learn.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filters.category === 'all' || event.category === filters.category;

    const eventDate = new Date(event.start_date);
    const now = new Date();
    const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inOneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let matchesTimeframe = true;
    if (filters.timeframe === 'week') {
      matchesTimeframe = eventDate <= inOneWeek;
    } else if (filters.timeframe === 'month') {
      matchesTimeframe = eventDate <= inOneMonth;
    }

    return matchesSearch && matchesCategory && matchesTimeframe;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Learning Resources
          </h1>
          <p className="text-xl text-gray-600">
            Discover and access educational content
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="course">Courses</option>
                <option value="workshop">Workshops</option>
                <option value="tutorial">Tutorials</option>
                <option value="article">Articles</option>
              </select>
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                className="rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Learn Grid */}
        {loading ? (
          <div className="text-center py-12">Loading resources...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLearn.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-primary-600 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white opacity-25" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                    <div className="flex items-center text-white/80">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDistanceToNow(new Date(event.start_date), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="w-5 h-5 mr-2" />
                      <span>Open for enrollment</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition">
                      Start Learning
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredLearn.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No resources found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;

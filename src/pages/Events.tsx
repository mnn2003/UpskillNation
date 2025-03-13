import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, Clock, Filter, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../lib/store';

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

interface Registration {
  event_id: string;
  status: string;
}

const Events = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    timeframe: 'all',
  });

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id, status')
        .eq('user_id', user!.id);

      if (error) throw error;

      const registrationsMap = data.reduce((acc, reg) => ({
        ...acc,
        [reg.event_id]: reg
      }), {});

      setRegistrations(registrationsMap);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([
          {
            event_id: eventId,
            user_id: user.id,
          }
        ]);

      if (error) throw error;

      setRegistrations({
        ...registrations,
        [eventId]: { event_id: eventId, status: 'pending' }
      });
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const getRegistrationStatus = (eventId: string) => {
    return registrations[eventId]?.status || null;
  };

  const getStatusButton = (status: string | null) => {
    switch (status) {
      case 'pending':
        return (
          <button disabled className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg opacity-75 cursor-not-allowed">
            Registration Pending
          </button>
        );
      case 'approved':
        return (
          <button disabled className="w-full bg-green-500 text-white py-2 px-4 rounded-lg opacity-75 cursor-not-allowed">
            Registration Approved
          </button>
        );
      case 'rejected':
        return (
          <button disabled className="w-full bg-red-500 text-white py-2 px-4 rounded-lg opacity-75 cursor-not-allowed">
            Registration Rejected
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleRegister(event.id)}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
          >
            Register Now
          </button>
        );
    }
  };

  const filteredEvents = events.filter((event) => {
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
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-600">
            Discover and participate in exciting events
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
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
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
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

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
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
                      <span>Open for registration</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    {getStatusButton(getRegistrationStatus(event.id))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;

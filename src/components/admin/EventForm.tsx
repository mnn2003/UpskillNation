import React from 'react';
import { X } from 'lucide-react';

interface EventFormProps {
  newContent: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    category: string;
  };
  setNewContent: (content: any) => void;
  handleCreateContent: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const EventForm = ({ newContent, setNewContent, handleCreateContent, onCancel }: EventFormProps) => {
  return (
    <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Create New Event</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
          <X className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleCreateContent} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={newContent.title}
            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <textarea
            value={newContent.description}
            onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            rows={4}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={newContent.start_date}
              onChange={(e) => setNewContent({ ...newContent, start_date: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
            <input
              type="datetime-local"
              value={newContent.end_date}
              onChange={(e) => setNewContent({ ...newContent, end_date: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
          <input
            type="text"
            value={newContent.location}
            onChange={(e) => setNewContent({ ...newContent, location: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
          <select
            value={newContent.category}
            onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          >
            <option value="">Select a category</option>
            <option value="hackathon">Hackathon</option>
            <option value="workshop">Workshop</option>
            <option value="conference">Conference</option>
            <option value="meetup">Meetup</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg shadow-sm bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;

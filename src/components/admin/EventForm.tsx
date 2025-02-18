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
    <div className="mb-8 bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Create New Event</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleCreateContent} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={newContent.title}
            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={newContent.description}
            onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            rows={3}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={newContent.start_date}
              onChange={(e) => setNewContent({ ...newContent, start_date: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={newContent.location}
            onChange={(e) => setNewContent({ ...newContent, location: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={newContent.category}
            onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            <option value="">Select a category</option>
            <option value="hackathon">Hackathon</option>
            <option value="workshop">Workshop</option>
            <option value="conference">Conference</option>
            <option value="meetup">Meetup</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;

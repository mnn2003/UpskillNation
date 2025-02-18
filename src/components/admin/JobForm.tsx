import React from 'react';
import { X } from 'lucide-react';

interface JobFormProps {
  newContent: {
    title: string;
    description: string;
    company: string;
    location: string;
    type: string;
    salary_range: string;
  };
  setNewContent: (content: any) => void;
  handleCreateContent: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const JobForm = ({ newContent, setNewContent, handleCreateContent, onCancel }: JobFormProps) => {
  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Create New Job</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
          <X className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleCreateContent} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Job Title</label>
          <input
            type="text"
            value={newContent.title}
            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
          <input
            type="text"
            value={newContent.company}
            onChange={(e) => setNewContent({ ...newContent, company: e.target.value })}
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
          <label className="block text-sm font-medium text-gray-600 mb-1">Job Type</label>
          <select
            value={newContent.type}
            onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          >
            <option value="">Select job type</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Salary Range</label>
          <input
            type="text"
            value={newContent.salary_range}
            onChange={(e) => setNewContent({ ...newContent, salary_range: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="e.g., $50,000 - $70,000"
            required
          />
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Create Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;

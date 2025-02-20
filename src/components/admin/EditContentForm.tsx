import React from 'react';
import { X } from 'lucide-react';

interface EditContentFormProps {
  content: {
    id: string;
    title: string;
    description: string;
    type: 'event' | 'job' | 'learn' | 'post';
    start_date?: string;
    end_date?: string;
    location?: string;
    category?: string;
    company?: string;
    type_job?: string;
    salary_range?: string;
  };
  onSave: (contentId: string, type: string) => void;
  onCancel: () => void;
  editedContent: any;
  setEditedContent: (content: any) => void;
}

const EditContentForm: React.FC<EditContentFormProps> = ({
  content,
  onSave,
  onCancel,
  editedContent,
  setEditedContent,
}) => {
  const renderEventFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={editedContent.start_date || content.start_date}
            onChange={(e) => setEditedContent({ ...editedContent, start_date: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="datetime-local"
            value={editedContent.end_date || content.end_date}
            onChange={(e) => setEditedContent({ ...editedContent, end_date: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={editedContent.category || content.category}
          onChange={(e) => setEditedContent({ ...editedContent, category: e.target.value })}
          className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          <option value="hackathon">Hackathon</option>
          <option value="workshop">Workshop</option>
          <option value="conference">Conference</option>
          <option value="meetup">Meetup</option>
        </select>
      </div>
    </>
  );

  const renderJobFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <input
          type="text"
          value={editedContent.company || content.company}
          onChange={(e) => setEditedContent({ ...editedContent, company: e.target.value })}
          className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
        <select
          value={editedContent.type_job || content.type_job}
          onChange={(e) => setEditedContent({ ...editedContent, type_job: e.target.value })}
          className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select job type</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
        <input
          type="text"
          value={editedContent.salary_range || content.salary_range}
          onChange={(e) => setEditedContent({ ...editedContent, salary_range: e.target.value })}
          className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., $50,000 - $70,000"
        />
      </div>
    </>
  );

  const renderLearnFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={editedContent.start_date || content.start_date}
            onChange={(e) => setEditedContent({ ...editedContent, start_date: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="datetime-local"
            value={editedContent.end_date || content.end_date}
            onChange={(e) => setEditedContent({ ...editedContent, end_date: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={editedContent.category || content.category}
          onChange={(e) => setEditedContent({ ...editedContent, category: e.target.value })}
          className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          <option value="course">Course</option>
          <option value="workshop">Workshop</option>
          <option value="tutorial">Tutorial</option>
          <option value="article">Article</option>
        </select>
      </div>
    </>
  );

  const renderFields = () => {
    switch (content.type) {
      case 'event':
        return renderEventFields();
      case 'job':
        return renderJobFields();
      case 'learn':
        return renderLearnFields();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Edit {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editedContent.title || content.title}
              onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editedContent.description || content.description}
              onChange={(e) => setEditedContent({ ...editedContent, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={editedContent.location || content.location}
              onChange={(e) => setEditedContent({ ...editedContent, location: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {renderFields()}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg shadow-sm bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(content.id, content.type)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContentForm;

import React from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
    image_url?: string;
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
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // First, delete the existing image if there is one
      if (editedContent.image_url || content.image_url) {
        const existingUrl = editedContent.image_url || content.image_url;
        const pathMatch = existingUrl.match(/images\/(.*)/);
        if (pathMatch) {
          const existingPath = pathMatch[1];
          await supabase.storage
            .from('images')
            .remove([existingPath]);
        }
      }

      // Upload new image
      const fileExt = file.name.split('.').pop();
      const fileName = `${content.type}-images/${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setEditedContent({ ...editedContent, image_url: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const imageUrl = editedContent.image_url || content.image_url;
      if (imageUrl) {
        const pathMatch = imageUrl.match(/images\/(.*)/);
        if (pathMatch) {
          const imagePath = pathMatch[1];
          await supabase.storage
            .from('images')
            .remove([imagePath]);
        }
      }
      setEditedContent({ ...editedContent, image_url: null });
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
        <div className="mt-1 flex items-center">
          {(editedContent.image_url || content.image_url) ? (
            <div className="relative">
              <img
                src={editedContent.image_url || content.image_url}
                alt="Event preview"
                className="h-32 w-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer">
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Upload className="h-8 w-8 text-gray-400" />
            </label>
          )}
        </div>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Resource Image</label>
        <div className="mt-1 flex items-center">
          {(editedContent.image_url || content.image_url) ? (
            <div className="relative">
              <img
                src={editedContent.image_url || content.image_url}
                alt="Resource preview"
                className="h-32 w-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer">
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Upload className="h-8 w-8 text-gray-400" />
            </label>
          )}
        </div>
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

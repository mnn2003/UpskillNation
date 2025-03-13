import React, { useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LearnFormProps {
  newContent: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    category: string;
    image_url?: string;
  };
  setNewContent: (content: any) => void;
  handleCreateContent: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const LearnForm = ({ newContent, setNewContent, handleCreateContent, onCancel }: LearnFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `learn-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setNewContent({ ...newContent, image_url: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Create New Learning Resource</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleCreateContent} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={newContent.title}
            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={newContent.description}
            onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            rows={4}
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
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="datetime-local"
              value={newContent.end_date}
              onChange={(e) => setNewContent({ ...newContent, end_date: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
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
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={newContent.category}
            onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            required
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
            {newContent.image_url ? (
              <div className="relative">
                <img
                  src={newContent.image_url}
                  alt="Resource preview"
                  className="h-32 w-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setNewContent({ ...newContent, image_url: '' })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-8 w-8 text-gray-400" />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Create Resource
          </button>
        </div>
      </form>
    </div>
  );
};

export default LearnForm;

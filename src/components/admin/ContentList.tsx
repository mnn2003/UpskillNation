import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import EditContentForm from './EditContentForm';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'job' | 'learn' | 'post';
  created_at: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  category?: string;
  company?: string;
  type_job?: string;
  salary_range?: string;
}

interface ContentListProps {
  content: ContentItem[];
  editingContent: string | null;
  editedContent: Partial<ContentItem>;
  setEditedContent: (content: Partial<ContentItem>) => void;
  handleEditContent: (contentId: string, item: ContentItem) => void;
  handleSaveContent: (contentId: string, type: string) => void;
  handleDeleteContent: (id: string, type: string) => void;
  setEditingContent: (id: string | null) => void;
}

const ContentList = ({
  content,
  editingContent,
  editedContent,
  setEditedContent,
  handleEditContent,
  handleSaveContent,
  handleDeleteContent,
  setEditingContent,
}: ContentListProps) => {
  return (
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
              <td className="px-6 py-4 whitespace-nowrap">{item.title}</td>
              <td className="px-6 py-4 whitespace-nowrap capitalize">{item.type}</td>
              <td className="px-6 py-4">
                <div className="max-w-xs truncate">{item.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingContent && (
        <EditContentForm
          content={content.find(item => item.id === editingContent)!}
          onSave={handleSaveContent}
          onCancel={() => {
            setEditingContent(null);
            setEditedContent({});
          }}
          editedContent={editedContent}
          setEditedContent={setEditedContent}
        />
      )}
    </div>
  );
};

export default ContentList;

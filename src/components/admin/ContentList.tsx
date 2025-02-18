import React from 'react';
import { Edit, Trash2, Save, X } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'job' | 'learn' | 'post';
  created_at: string;
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
            <tr key={${item.type}-${item.id}}>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingContent === item.id ? (
                  <input
                    type="text"
                    value={editedContent.title || item.title}
                    onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
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
                    onChange={(e) => setEditedContent({ ...editedContent, description: e.target.value })}
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
  );
};

export default ContentList;

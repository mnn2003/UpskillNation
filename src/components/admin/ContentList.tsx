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
        <thead className="bg-gray-50">
          <tr>
            {['Title', 'Type', 'Description', 'Created At', 'Actions'].map((heading) => (
              <th
                key={heading}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {content.map((item) => {
            const isEditing = editingContent === item.id;
            return (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedContent.title ?? item.title}
                      onChange={(e) =>
                        setEditedContent((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="font-medium">{item.title}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{item.type}</td>
                <td className="px-6 py-4">
                  {isEditing ? (
                    <textarea
                      value={editedContent.description ?? item.description}
                      onChange={(e) =>
                        setEditedContent((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="border rounded px-2 py-1 w-full"
                      rows={3}
                    />
                  ) : (
                    <div className="max-w-xs truncate" title={item.description}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {isEditing ? (
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
                          onClick={() => {
                            setEditingContent(item.id);
                            setEditedContent({
                              title: item.title, // Load the current item's data into editedContent
                              description: item.description,
                            });
                          }}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ContentList;

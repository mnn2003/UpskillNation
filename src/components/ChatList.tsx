import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';

interface ChatSession {
  id: string;
  participant_ids: string[];
  last_message: string;
  last_message_at: string;
  participant_name?: string;
  participant_avatar?: string | null;
}

interface ChatListProps {
  chatSessions: ChatSession[];
  currentChat: string | null;
  setCurrentChat: (id: string) => void;
  startNewChat: () => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chatSessions,
  currentChat,
  setCurrentChat,
  startNewChat
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold">Chats</h2>
        <button 
          onClick={startNewChat}
          className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
        >
          New Chat
        </button>
      </div>
      <div className="overflow-y-auto flex-grow">
        {chatSessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          chatSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setCurrentChat(session.id)}
              className={`w-full p-3 text-left hover:bg-gray-50 transition flex items-center ${
                currentChat === session.id ? 'bg-gray-100' : ''
              }`}
            >
              {session.participant_avatar ? (
                <img
                  src={session.participant_avatar}
                  alt={session.participant_name}
                  className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-gray-500 text-lg">
                    {session.participant_name?.[0] || '?'}
                  </span>
                </div>
              )}
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="font-medium truncate">{session.participant_name}</p>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatDistanceToNow(new Date(session.last_message_at), { addSuffix: false })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{session.last_message || 'New conversation'}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;

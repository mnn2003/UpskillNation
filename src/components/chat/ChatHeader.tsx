import React from 'react';
import { MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  participant: {
    name: string;
    avatar?: string | null;
    isOnline?: boolean;
  } | null;
  onBackClick?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ participant, onBackClick }) => {
  if (!participant) return null;
  
  return (
    <div className="p-3 border-b border-gray-200 flex items-center bg-gray-50">
      {onBackClick && (
        <button 
          onClick={onBackClick}
          className="mr-2 p-1 rounded-full text-gray-500 hover:bg-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="flex items-center flex-grow">
        {participant.avatar ? (
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
            <span className="text-gray-500 text-lg">
              {participant.name?.[0] || '?'}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-medium">{participant.name}</h3>
          <p className="text-xs text-gray-500">
            {participant.isOnline ? 'Online' : 'Last seen recently'}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hidden sm:block">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

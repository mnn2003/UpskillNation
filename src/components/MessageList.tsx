import React, { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, ImageIcon } from 'lucide-react';

interface Attachment {
  id: string;
  file_url: string;
  file_type: string;
  file_name: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  attachments?: Attachment[];
  sender_name?: string;
  sender_avatar?: string | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex mb-4 ${
            message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 ${
              message.sender_id === currentUserId
                ? 'bg-primary-600 text-white rounded-tr-none'
                : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
            }`}
          >
            {message.sender_id !== currentUserId && (
              <div className="font-medium text-sm mb-1">{message.sender_name}</div>
            )}
            {message.content && <p className="break-words">{message.content}</p>}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  attachment.file_type.startsWith('image/') ? (
                    <div key={attachment.id} className="mt-2">
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={attachment.file_url} 
                          alt={attachment.file_name}
                          className="max-w-full rounded-md max-h-48 object-contain bg-black/5"
                        />
                        <span className={`text-xs mt-1 block ${
                          message.sender_id === currentUserId ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {attachment.file_name}
                        </span>
                      </a>
                    </div>
                  ) : (
                    <a
                      key={attachment.id}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center text-sm p-2 rounded ${
                        message.sender_id === currentUserId
                          ? 'bg-primary-700 text-white/90 hover:text-white'
                          : 'bg-gray-100 text-primary-600 hover:underline'
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{attachment.file_name}</span>
                    </a>
                  )
                ))}
              </div>
            )}
            <div className={`text-xs mt-1 text-right ${
              message.sender_id === currentUserId ? 'text-white/70' : 'text-gray-500'
            }`}>
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: false })}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

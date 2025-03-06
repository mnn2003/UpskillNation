import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

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

interface ChatWindowProps {
  currentChat: string | null;
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  handleSendMessage: () => void;
  loading: boolean;
  currentUserId: string | undefined;
  participant: {
    name: string;
    avatar?: string | null;
    isOnline?: boolean;
  } | null;
  onBackClick?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  currentChat,
  messages,
  newMessage,
  setNewMessage,
  files,
  setFiles,
  handleSendMessage,
  loading,
  currentUserId,
  participant,
  onBackClick
}) => {
  if (!currentChat) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <p className="text-gray-500 mb-2">Select a chat to start messaging</p>
          <p className="text-gray-400 text-sm">Or create a new conversation</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ChatHeader participant={participant} onBackClick={onBackClick} />
      <div className="flex-grow flex flex-col h-full">
        <MessageList messages={messages} currentUserId={currentUserId} />
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          files={files}
          setFiles={setFiles}
          handleSendMessage={handleSendMessage}
          loading={loading}
        />
      </div>
    </>
  );
};

export default ChatWindow;

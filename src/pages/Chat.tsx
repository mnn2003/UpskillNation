import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { Send, Paperclip, Image as ImageIcon, FileText, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  attachments: {
    id: string;
    file_url: string;
    file_type: string;
    file_name: string;
  }[];
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ChatSession {
  id: string;
  participant_ids: string[];
  last_message: string;
  last_message_at: string;
  participants: {
    full_name: string;
    avatar_url: string | null;
  }[];
}

const Chat = () => {
  const { user } = useAuthStore();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchChatSessions();
      subscribeToChats();
    }
  }, [user]);

  useEffect(() => {
    if (currentChat) {
      fetchMessages(currentChat);
      subscribeToMessages(currentChat);
    }
  }, [currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          participant_ids,
          last_message,
          last_message_at,
          participants:profiles(full_name, avatar_url)
        `)
        .contains('participant_ids', [user?.id])
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setChatSessions(data || []);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          attachments(id, file_url, file_type, file_name),
          profiles(full_name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToChats = () => {
    const subscription = supabase
      .channel('chat_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `participant_ids=cs.{${user?.id}}`,
      }, () => {
        fetchChatSessions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const subscribeToMessages = (chatId: string) => {
    const subscription = supabase
      .channel('message_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async () => {
    if (!currentChat || (!newMessage.trim() && files.length === 0)) return;

    setLoading(true);
    try {
      // First, upload any files
      const attachments = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat_attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat_attachments')
          .getPublicUrl(filePath);

        attachments.push({
          file_url: publicUrl,
          file_type: file.type,
          file_name: file.name,
        });
      }

      // Then send the message
      const { error } = await supabase.from('messages').insert([{
        chat_id: currentChat,
        content: newMessage.trim(),
        sender_id: user?.id,
        attachments: attachments,
      }]);

      if (error) throw error;

      setNewMessage('');
      setFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-12 min-h-[600px]">
            {/* Chat List */}
            <div className="col-span-4 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Chats</h2>
              </div>
              <div className="overflow-y-auto h-[calc(600px-4rem)]">
                {chatSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setCurrentChat(session.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                      currentChat === session.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {session.participants[0].avatar_url ? (
                        <img
                          src={session.participants[0].avatar_url}
                          alt={session.participants[0].full_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">
                            {session.participants[0].full_name[0]}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-medium">{session.participants[0].full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{session.last_message}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="col-span-8 flex flex-col">
              {currentChat ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex mb-4 ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            message.sender_id === user?.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          } rounded-lg p-3`}
                        >
                          <div className="flex items-center mb-1">
                            <span className="font-medium">{message.profiles.full_name}</span>
                            <span className="text-xs ml-2">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {message.content && <p>{message.content}</p>}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sm hover:underline"
                                >
                                  {attachment.file_type.startsWith('image/') ? (
                                    <ImageIcon className="w-4 h-4 mr-1" />
                                  ) : (
                                    <FileText className="w-4 h-4 mr-1" />
                                  )}
                                  {attachment.file_name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                          >
                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || (!newMessage.trim() && files.length === 0)}
                        className="p-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Select a chat to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

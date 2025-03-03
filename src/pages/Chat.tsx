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
  attachments?: {
    id: string;
    file_url: string;
    file_type: string;
    file_name: string;
  }[];
  sender_name?: string;
  sender_avatar?: string | null;
}

interface ChatSession {
  id: string;
  participant_ids: string[];
  last_message: string;
  last_message_at: string;
  participant_name?: string;
  participant_avatar?: string | null;
}

const Chat = () => {
  const { user } = useAuthStore();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string; avatar_url: string | null }>>({});
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

  const fetchProfiles = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (error) throw error;

      const profileMap = (data || []).reduce((acc, profile) => ({
        ...acc,
        [profile.id]: profile
      }), {});

      setProfiles(prev => ({ ...prev, ...profileMap }));
      return profileMap;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return {};
    }
  };

  const fetchChatSessions = async () => {
    if (!user) return;
    
    try {
      // First get the chats
      const { data: chats, error } = await supabase
        .from('chats')
        .select('id, participant_ids, last_message, last_message_at')
        .contains('participant_ids', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      if (!chats || chats.length === 0) {
        setChatSessions([]);
        return;
      }

      // Get all unique participant IDs except the current user
      const participantIds = new Set<string>();
      chats.forEach(chat => {
        chat.participant_ids.forEach(id => {
          if (id !== user.id) {
            participantIds.add(id);
          }
        });
      });

      // Fetch profiles for all participants
      const profileMap = await fetchProfiles(Array.from(participantIds));

      // Enhance chat sessions with participant info
      const enhancedSessions = chats.map(chat => {
        // Find the other participant (assuming 1-on-1 chats)
        const otherParticipantId = chat.participant_ids.find(id => id !== user.id);
        const otherParticipant = otherParticipantId ? profileMap[otherParticipantId] : null;

        return {
          ...chat,
          participant_name: otherParticipant?.full_name || 'Unknown User',
          participant_avatar: otherParticipant?.avatar_url
        };
      });

      setChatSessions(enhancedSessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Get all unique sender IDs
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      
      // Fetch profiles for all senders if not already in state
      const missingIds = senderIds.filter(id => !profiles[id]);
      if (missingIds.length > 0) {
        await fetchProfiles(missingIds);
      }

      // Fetch attachments for all messages
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('message_attachments')
        .select('id, message_id, file_url, file_type, file_name')
        .in('message_id', messagesData.map(msg => msg.id));

      if (attachmentsError) throw attachmentsError;

      // Group attachments by message_id
      const attachmentsByMessage = (attachmentsData || []).reduce((acc, attachment) => {
        if (!acc[attachment.message_id]) {
          acc[attachment.message_id] = [];
        }
        acc[attachment.message_id].push({
          id: attachment.id,
          file_url: attachment.file_url,
          file_type: attachment.file_type,
          file_name: attachment.file_name
        });
        return acc;
      }, {} as Record<string, any[]>);

      // Enhance messages with sender info and attachments
      const enhancedMessages = messagesData.map(message => ({
        ...message,
        sender_name: profiles[message.sender_id]?.full_name || 'Unknown User',
        sender_avatar: profiles[message.sender_id]?.avatar_url,
        attachments: attachmentsByMessage[message.id] || []
      }));

      setMessages(enhancedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToChats = () => {
    if (!user) return;
    
    const subscription = supabase
      .channel('chat_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `participant_ids=cs.{${user.id}}`
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
      .channel(`messages_${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, async (payload) => {
        const newMessage = payload.new as ChatMessage;
        
        // Fetch sender info if not already in state
        if (!profiles[newMessage.sender_id]) {
          await fetchProfiles([newMessage.sender_id]);
        }
        
        // Fetch attachments if any
        const { data: attachments } = await supabase
          .from('message_attachments')
          .select('id, file_url, file_type, file_name')
          .eq('message_id', newMessage.id);
        
        setMessages(prev => [...prev, {
          ...newMessage,
          sender_name: profiles[newMessage.sender_id]?.full_name || 'Unknown User',
          sender_avatar: profiles[newMessage.sender_id]?.avatar_url,
          attachments: attachments || []
        }]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async () => {
    if (!currentChat || (!newMessage.trim() && files.length === 0) || !user) return;

    setLoading(true);
    try {
      // First, insert the message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChat,
          content: newMessage.trim(),
          sender_id: user.id
        })
        .select('id')
        .single();

      if (messageError) throw messageError;

      // Update the chat's last message and timestamp
      await supabase
        .from('chats')
        .update({
          last_message: newMessage.trim() || 'Sent an attachment',
          last_message_at: new Date().toISOString()
        })
        .eq('id', currentChat);

      // Then, upload any files and create attachments
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat_attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat_attachments')
          .getPublicUrl(filePath);

        // Create attachment record
        await supabase
          .from('message_attachments')
          .insert({
            message_id: messageData.id,
            file_url: publicUrl,
            file_type: file.type,
            file_name: file.name
          });
      }

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

  const startNewChat = async () => {
    if (!user) return;
    
    try {
      // For demo purposes, we'll create a chat with a sample user
      // In a real app, you'd have a user selection UI
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id)
        .limit(1);
      
      if (!profiles || profiles.length === 0) {
        alert('No other users found to chat with');
        return;
      }
      
      const otherUserId = profiles[0].id;
      
      // Check if a chat already exists
      const { data: existingChats } = await supabase
        .from('chats')
        .select('id')
        .contains('participant_ids', [user.id, otherUserId]);
      
      if (existingChats && existingChats.length > 0) {
        setCurrentChat(existingChats[0].id);
        return;
      }
      
      // Create a new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          participant_ids: [user.id, otherUserId],
          created_by: user.id,
          last_message: '',
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      await fetchChatSessions();
      setCurrentChat(newChat.id);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access chat</p>
          <a href="/auth" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-12 min-h-[600px]">
            {/* Chat List */}
            <div className="col-span-4 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Chats</h2>
                <button 
                  onClick={startNewChat}
                  className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
                >
                  New Chat
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(600px-4rem)]">
                {chatSessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No chats yet. Start a new conversation!
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setCurrentChat(session.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                        currentChat === session.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {session.participant_avatar ? (
                          <img
                            src={session.participant_avatar}
                            alt={session.participant_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg">
                              {session.participant_name?.[0] || '?'}
                            </span>
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="font-medium">{session.participant_name}</p>
                          <p className="text-sm text-gray-500 truncate">{session.last_message || 'New conversation'}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="col-span-8 flex flex-col">
              {currentChat ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
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
                              <span className="font-medium">{message.sender_name}</span>
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
                      ))
                    )}
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

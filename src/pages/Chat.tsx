import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string; avatar_url: string | null }>>({});
  const [currentParticipant, setCurrentParticipant] = useState<{
    name: string;
    avatar?: string | null;
    isOnline?: boolean;
  } | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setShowChatList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileView && currentChat) {
      setShowChatList(false);
    }
  }, [currentChat, isMobileView]);

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
      
      // Set current participant
      const session = chatSessions.find(s => s.id === currentChat);
      if (session) {
        setCurrentParticipant({
          name: session.participant_name || 'Unknown User',
          avatar: session.participant_avatar,
          isOnline: false
        });
      }
    }
  }, [currentChat, chatSessions]);

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

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    if (isMobileView) {
      setShowChatList(false);
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col md:flex-row">
            {(showChatList || !isMobileView) && (
              <div className={`${isMobileView ? 'w-full' : 'w-1/3'} border-r border-gray-200`}>
                <ChatList 
                  chatSessions={chatSessions}
                  currentChat={currentChat}
                  setCurrentChat={handleChatSelect}
                  startNewChat={startNewChat}
                />
              </div>
            )}
            
            {(!showChatList || !isMobileView) && (
              <div className={`${isMobileView ? 'w-full' : 'w-2/3'} flex flex-col`}>
                <ChatWindow
                  currentChat={currentChat}
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  files={files}
                  setFiles={setFiles}
                  handleSendMessage={handleSendMessage}
                  loading={loading}
                  currentUserId={user?.id}
                  participant={currentParticipant}
                  onBackClick={isMobileView ? handleBackToList : undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

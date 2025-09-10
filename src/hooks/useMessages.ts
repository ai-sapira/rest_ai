import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface TransactionMessage {
  id: string;
  transaction_id?: string;
  offer_id?: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'system';
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateMessageData {
  transaction_id?: string;
  offer_id?: string;
  message: string;
  message_type?: 'text' | 'image' | 'system';
  attachment_url?: string;
}

export function useMessages(transactionId?: string, offerId?: string) {
  const [messages, setMessages] = useState<TransactionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch messages for a transaction or offer
  const fetchMessages = async () => {
    if (!transactionId && !offerId) return;

    try {
      setLoading(true);
      let query = supabase
        .from('transaction_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (transactionId) {
        query = query.eq('transaction_id', transactionId);
      } else if (offerId) {
        query = query.eq('offer_id', offerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (messageData: CreateMessageData): Promise<boolean> => {
    if (!user) {
      setError('User must be logged in');
      return false;
    }

    try {
      const { error } = await supabase
        .from('transaction_messages')
        .insert([{
          ...messageData,
          sender_id: user.id
        }]);

      if (error) throw error;

      await fetchMessages();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message');
      return false;
    }
  };

  // Mark messages as read
  const markAsRead = async (messageIds: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transaction_messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .neq('sender_id', user?.id); // Only mark messages from others as read

      if (error) throw error;

      await fetchMessages();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking messages as read');
      return false;
    }
  };

  // Get unread message count
  const getUnreadCount = (): number => {
    return messages.filter(m => !m.is_read && m.sender_id !== user?.id).length;
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!transactionId && !offerId) return;

    const channel = supabase
      .channel('transaction_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_messages',
          filter: transactionId 
            ? `transaction_id=eq.${transactionId}`
            : `offer_id=eq.${offerId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, offerId]);

  useEffect(() => {
    fetchMessages();
  }, [transactionId, offerId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    getUnreadCount,
    refreshMessages: fetchMessages
  };
}

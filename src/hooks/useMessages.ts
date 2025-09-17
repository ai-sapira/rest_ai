import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface TransactionMessage {
  id: string;
  transaction_id?: string;
  offer_id?: string;
  anuncio_id?: string;
  sender_id: string;
  receiver_id?: string;
  message: string;
  message_type: 'text' | 'image' | 'system';
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateMessageData {
  transaction_id?: string;
  offer_id?: string;
  anuncio_id?: string;
  receiver_id?: string;
  message: string;
  message_type?: 'text' | 'image' | 'system';
  attachment_url?: string;
}

export function useMessages(transactionId?: string, offerId?: string, anuncioId?: string) {
  const [messages, setMessages] = useState<TransactionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch messages for a transaction, offer, or anuncio contact
  const fetchMessages = async () => {
    if (!transactionId && !offerId && !anuncioId) return;

    try {
      setLoading(true);
      let messages: TransactionMessage[] = [];

      if (anuncioId) {
        // Fetch contact messages
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .eq('anuncio_id', anuncioId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        messages = data || [];
      } else {
        // Fetch transaction/offer messages
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
        messages = data || [];
      }

      setMessages(messages);
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
      const tableName = messageData.anuncio_id ? 'contact_messages' : 'transaction_messages';
      const { error } = await supabase
        .from(tableName)
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
      const tableName = anuncioId ? 'contact_messages' : 'transaction_messages';
      const { error } = await supabase
        .from(tableName)
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
    if (!transactionId && !offerId && !anuncioId) return;

    const tableName = anuncioId ? 'contact_messages' : 'transaction_messages';
    let filter = '';
    
    if (anuncioId) {
      filter = `anuncio_id=eq.${anuncioId}`;
    } else if (transactionId) {
      filter = `transaction_id=eq.${transactionId}`;
    } else if (offerId) {
      filter = `offer_id=eq.${offerId}`;
    }

    const channel = supabase
      .channel(`${tableName}_${anuncioId || transactionId || offerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, offerId, anuncioId]);

  useEffect(() => {
    fetchMessages();
  }, [transactionId, offerId, anuncioId]);

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


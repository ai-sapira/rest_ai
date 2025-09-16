/**
 * SIMPLE Transactions Hook - React Query Direct Approach
 * Replaces complex useTransactions with clean, maintainable code
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Types from original hook
export interface Transaction {
  id: string;
  anuncio_id: string;
  buyer_id: string;
  seller_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  total_amount: number;
  protection_fee: number;
  shipping_cost: number;
  delivery_method: string;
  delivery_address?: string;
  payment_method: string;
  status: 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  tracking_number?: string;
  buyer_rating?: number;
  seller_rating?: number;
  buyer_review?: string;
  seller_review?: string;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  anuncio_id: string;
  buyer_id: string;
  seller_id: string;
  offered_price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionData {
  anuncio_id: string;
  seller_id: string;
  total_amount: number;
  protection_fee: number;
  shipping_cost: number;
  delivery_method: string;
  delivery_address?: string;
  payment_method: string;
}

export interface CreateOfferData {
  anuncio_id: string;
  seller_id: string;
  offered_price: number;
  message?: string;
}

// ============================================================================
// MAIN HOOK - SEPARATE OPTIMIZED QUERIES
// ============================================================================

export function useTransactionsSimple() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ✅ QUERY 1: User transactions (as buyer OR seller)
  const {
    data: transactions = [],
    isLoading: loadingTransactions,
    error: errorTransactions,
  } = useQuery({
    queryKey: ['transactions', 'user', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Transaction[];
    },
    enabled: !!user, // Only run when user is logged in
    staleTime: 1 * 60 * 1000, // 1 minute cache - financial data should be fresh
  });

  // ✅ QUERY 2: User offers (as buyer OR seller)
  const {
    data: offers = [],
    isLoading: loadingOffers,
    error: errorOffers,
  } = useQuery({
    queryKey: ['offers', 'user', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Offer[];
    },
    enabled: !!user, // Only run when user is logged in
    staleTime: 1 * 60 * 1000, // 1 minute cache - financial data should be fresh
  });

  // Combine loading states intelligently
  const loading = loadingTransactions || loadingOffers;
  const error = errorTransactions?.message || errorOffers?.message || null;

  // ============================================================================
  // UTILITY FUNCTIONS - PURE FUNCTIONS (NO SIDE EFFECTS)
  // ============================================================================

  const calculateCosts = (productPrice: number, deliveryMethod: string) => {
    const protectionFeeRate = 0.035; // 3.5%
    const protectionFee = Math.round(productPrice * protectionFeeRate * 100) / 100;
    
    let shippingCost = 0;
    switch (deliveryMethod) {
      case 'envio_estandar':
        shippingCost = productPrice > 50 ? 0 : 5.99;
        break;
      case 'envio_urgente':
        shippingCost = 9.99;
        break;
      case 'punto_recogida':
        shippingCost = 3.89;
        break;
      case 'recogida_persona':
        shippingCost = 0;
        break;
      default:
        shippingCost = 0;
    }
    
    const total = productPrice + protectionFee + shippingCost;
    
    return {
      productPrice,
      protectionFee,
      shippingCost,
      total: Math.round(total * 100) / 100
    };
  };

  // ============================================================================
  // MUTATIONS - SIMPLE AND DIRECT
  // ============================================================================

  const createTransaction = useMutation({
    mutationFn: async (transactionData: CreateTransactionData) => {
      if (!user) throw new Error('Must be logged in to create transaction');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          buyer_id: user.id,
          status: 'pending_payment' as const,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      // ✅ Smart invalidation - refresh user's transactions
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user', user?.id] });
    },
  });

  const createOffer = useMutation({
    mutationFn: async (offerData: CreateOfferData) => {
      if (!user) throw new Error('Must be logged in to create offer');
      
      const { data, error } = await supabase
        .from('offers')
        .insert([{
          ...offerData,
          buyer_id: user.id,
          status: 'pending' as const,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Offer;
    },
    onSuccess: () => {
      // ✅ Smart invalidation - refresh user's offers
      queryClient.invalidateQueries({ queryKey: ['offers', 'user', user?.id] });
    },
  });

  const updateTransactionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Transaction['status'] }) => {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user', user?.id] });
    },
  });

  const updateOfferStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Offer['status'] }) => {
      const updateData: any = { status };
      
      if (status !== 'pending') {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'user', user?.id] });
    },
  });

  const addRating = useMutation({
    mutationFn: async ({ 
      transactionId, 
      rating, 
      review, 
      isFromBuyer = true 
    }: { 
      transactionId: string; 
      rating: number; 
      review?: string; 
      isFromBuyer?: boolean; 
    }) => {
      const updateData = isFromBuyer 
        ? { buyer_rating: rating, buyer_review: review }
        : { seller_rating: rating, seller_review: review };

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;
      return { transactionId, rating, review, isFromBuyer };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user', user?.id] });
    },
  });

  // ============================================================================
  // RETURN - CLEAN API, SAME AS BEFORE
  // ============================================================================

  return {
    // Data
    transactions,
    offers,
    loading,
    error,
    
    // Utility functions
    calculateCosts,
    
    // Actions - simplified API
    createTransaction: async (data: CreateTransactionData) => {
      try {
        const transaction = await createTransaction.mutateAsync(data);
        return transaction;
      } catch (err) {
        console.error('Error creating transaction:', err);
        return null;
      }
    },
    
    createOffer: async (data: CreateOfferData) => {
      try {
        const offer = await createOffer.mutateAsync(data);
        return offer;
      } catch (err) {
        console.error('Error creating offer:', err);
        return null;
      }
    },
    
    updateTransactionStatus: async (id: string, status: Transaction['status']) => {
      try {
        await updateTransactionStatus.mutateAsync({ id, status });
        return true;
      } catch (err) {
        console.error('Error updating transaction status:', err);
        return false;
      }
    },
    
    updateOfferStatus: async (id: string, status: Offer['status']) => {
      try {
        await updateOfferStatus.mutateAsync({ id, status });
        return true;
      } catch (err) {
        console.error('Error updating offer status:', err);
        return false;
      }
    },
    
    addRating: async (transactionId: string, rating: number, review?: string, isFromBuyer: boolean = true) => {
      try {
        await addRating.mutateAsync({ transactionId, rating, review, isFromBuyer });
        return true;
      } catch (err) {
        console.error('Error adding rating:', err);
        return false;
      }
    },
    
    // Loading states for UI feedback
    isCreatingTransaction: createTransaction.isPending,
    isCreatingOffer: createOffer.isPending,
    isUpdatingTransactionStatus: updateTransactionStatus.isPending,
    isUpdatingOfferStatus: updateOfferStatus.isPending,
    isAddingRating: addRating.isPending,
    
    // Individual loading states (bonus)
    loadingTransactions,
    loadingOffers,
    
    // Refresh functions (for compatibility - though not needed with React Query)
    refreshTransactions: () => queryClient.invalidateQueries({ queryKey: ['transactions', 'user', user?.id] }),
    refreshOffers: () => queryClient.invalidateQueries({ queryKey: ['offers', 'user', user?.id] }),
  };
}

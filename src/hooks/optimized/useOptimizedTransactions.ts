/**
 * Optimized transactions hook using React Query
 * Replaces useTransactions.ts with cached, efficient queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionQueries, queryKeys } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface CreateTransactionData {
  anuncio_id: string;
  seller_id: string;
  delivery_method: string;
  delivery_address?: string;
  payment_method: string;
  total_amount: number;
  protection_fee: number;
  shipping_cost: number;
}

interface CreateOfferData {
  anuncio_id: string;
  seller_id: string;
  offered_price: number;
  message?: string;
}

export function useOptimizedTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's transactions
  const {
    data: transactions = [],
    isLoading: loadingTransactions,
    error: errorTransactions,
  } = useQuery({
    queryKey: queryKeys.transactionsByUser(user?.id!),
    queryFn: () => transactionQueries.byUser(user?.id!),
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute (financial data should be fresh)
  });

  // Get user's offers
  const {
    data: offers = [],
    isLoading: loadingOffers,
    error: errorOffers,
  } = useQuery({
    queryKey: queryKeys.offersByUser(user?.id!),
    queryFn: () => transactionQueries.offersByUser(user?.id!),
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
  });

  // Calculate costs helper function
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
    }
    
    const total = productPrice + protectionFee + shippingCost;
    
    return {
      productPrice,
      protectionFee,
      shippingCost,
      total: Math.round(total * 100) / 100
    };
  };

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: CreateTransactionData) => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          buyer_id: user.id,
          status: 'pending_payment',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsByUser(user?.id!) });
    },
  });

  // Create offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async (offerData: CreateOfferData) => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('offers')
        .insert([{
          ...offerData,
          buyer_id: user.id,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offersByUser(user?.id!) });
    },
  });

  // Update transaction status mutation
  const updateTransactionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsByUser(user?.id!) });
    },
  });

  // Update offer status mutation
  const updateOfferStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('offers')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offersByUser(user?.id!) });
    },
  });

  // Accept offer mutation (creates transaction)
  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const offer = offers.find(o => o.id === offerId);
      if (!offer) throw new Error('Offer not found');

      // Create transaction from offer
      const costs = calculateCosts(offer.offered_price, 'recogida_persona'); // Default delivery method
      
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          anuncio_id: offer.anuncio_id,
          buyer_id: offer.buyer_id,
          seller_id: offer.seller_id,
          total_amount: costs.total,
          protection_fee: costs.protectionFee,
          shipping_cost: costs.shippingCost,
          delivery_method: 'recogida_persona',
          payment_method: 'pending',
          status: 'pending_payment',
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update offer status to accepted
      const { error: offerError } = await supabase
        .from('offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (offerError) throw offerError;

      return { transaction, offer };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsByUser(user?.id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.offersByUser(user?.id!) });
    },
  });

  return {
    // Data
    transactions,
    offers,
    loading: loadingTransactions || loadingOffers,
    error: errorTransactions?.message || errorOffers?.message || null,
    
    // Utility functions
    calculateCosts,
    
    // Actions
    createTransaction: async (transactionData: CreateTransactionData) => {
      try {
        const transaction = await createTransactionMutation.mutateAsync(transactionData);
        return transaction;
      } catch (err) {
        console.error('Error creating transaction:', err);
        return null;
      }
    },
    
    createOffer: async (offerData: CreateOfferData) => {
      try {
        const offer = await createOfferMutation.mutateAsync(offerData);
        return offer;
      } catch (err) {
        console.error('Error creating offer:', err);
        return null;
      }
    },
    
    updateTransactionStatus: async (id: string, status: string) => {
      try {
        await updateTransactionStatusMutation.mutateAsync({ id, status });
        return true;
      } catch (err) {
        console.error('Error updating transaction status:', err);
        return false;
      }
    },
    
    updateOfferStatus: async (id: string, status: string) => {
      try {
        await updateOfferStatusMutation.mutateAsync({ id, status });
        return true;
      } catch (err) {
        console.error('Error updating offer status:', err);
        return false;
      }
    },
    
    acceptOffer: async (offerId: string) => {
      try {
        const result = await acceptOfferMutation.mutateAsync(offerId);
        return result;
      } catch (err) {
        console.error('Error accepting offer:', err);
        return null;
      }
    },
    
    // Loading states
    isCreatingTransaction: createTransactionMutation.isPending,
    isCreatingOffer: createOfferMutation.isPending,
    isUpdatingTransactionStatus: updateTransactionStatusMutation.isPending,
    isUpdatingOfferStatus: updateOfferStatusMutation.isPending,
    isAcceptingOffer: acceptOfferMutation.isPending,
    
    // Refresh functions (for compatibility)
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsByUser(user?.id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.offersByUser(user?.id!) });
    },
  };
}

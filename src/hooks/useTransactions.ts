import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  anuncio_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  delivery_method: 'envio_estandar' | 'envio_urgente' | 'punto_recogida' | 'recogida_persona';
  delivery_address?: {
    street: string;
    city: string;
    postal_code: string;
    province: string;
    region: string;
    phone: string;
    instructions?: string;
  };
  pickup_location?: {
    name: string;
    address: string;
    cost: number;
  };
  product_total: number;
  protection_fee: number;
  shipping_cost: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  payment_method?: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  buyer_rating?: number;
  seller_rating?: number;
  buyer_review?: string;
  seller_review?: string;
}

export interface Offer {
  id: string;
  buyer_id: string;
  seller_id: string;
  anuncio_id: string;
  offered_price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
}

export interface CreateTransactionData {
  anuncio_id: string;
  seller_id: string;
  product_title: string;
  product_price: number;
  quantity?: number;
  delivery_method: 'envio_estandar' | 'envio_urgente' | 'punto_recogida' | 'recogida_persona';
  delivery_address?: Transaction['delivery_address'];
  pickup_location?: Transaction['pickup_location'];
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
}

export interface CreateOfferData {
  anuncio_id: string;
  seller_id: string;
  offered_price: number;
  message?: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Calculate costs
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

  // Fetch user's transactions
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's offers
  const fetchOffers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching offers');
    }
  };

  // Create transaction
  const createTransaction = async (data: CreateTransactionData): Promise<Transaction | null> => {
    if (!user) {
      setError('User must be logged in');
      return null;
    }

    try {
      const costs = calculateCosts(data.product_price, data.delivery_method);
      
      const transactionData = {
        buyer_id: user.id,
        seller_id: data.seller_id,
        anuncio_id: data.anuncio_id,
        product_title: data.product_title,
        product_price: data.product_price,
        quantity: data.quantity || 1,
        delivery_method: data.delivery_method,
        delivery_address: data.delivery_address,
        pickup_location: data.pickup_location,
        product_total: costs.productPrice,
        protection_fee: costs.protectionFee,
        shipping_cost: costs.shippingCost,
        total_amount: costs.total,
        payment_method: data.payment_method,
        status: 'pending' as const,
        payment_status: 'pending' as const
      };

      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;

      await fetchTransactions();
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating transaction');
      return null;
    }
  };

  // Create offer
  const createOffer = async (data: CreateOfferData): Promise<Offer | null> => {
    if (!user) {
      setError('User must be logged in');
      return null;
    }

    try {
      const offerData = {
        buyer_id: user.id,
        seller_id: data.seller_id,
        anuncio_id: data.anuncio_id,
        offered_price: data.offered_price,
        message: data.message,
        status: 'pending' as const
      };

      const { data: offer, error } = await supabase
        .from('offers')
        .insert([offerData])
        .select()
        .single();

      if (error) throw error;

      await fetchOffers();
      return offer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating offer');
      return null;
    }
  };

  // Update transaction status
  const updateTransactionStatus = async (id: string, status: Transaction['status']): Promise<boolean> => {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchTransactions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating transaction');
      return false;
    }
  };

  // Update offer status
  const updateOfferStatus = async (id: string, status: Offer['status']): Promise<boolean> => {
    try {
      const updateData: any = { status };
      
      if (status !== 'pending') {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchOffers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating offer');
      return false;
    }
  };

  // Add rating and review
  const addRating = async (
    transactionId: string, 
    rating: number, 
    review?: string, 
    isFromBuyer: boolean = true
  ): Promise<boolean> => {
    try {
      const updateData = isFromBuyer 
        ? { buyer_rating: rating, buyer_review: review }
        : { seller_rating: rating, seller_review: review };

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;

      await fetchTransactions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding rating');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchOffers();
    }
  }, [user]);

  return {
    transactions,
    offers,
    loading,
    error,
    calculateCosts,
    createTransaction,
    createOffer,
    updateTransactionStatus,
    updateOfferStatus,
    addRating,
    refreshTransactions: fetchTransactions,
    refreshOffers: fetchOffers
  };
}


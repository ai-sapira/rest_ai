/**
 * Optimized hooks index
 * Export all optimized hooks for easy importing
 */

export { useOptimizedProfile } from './useOptimizedProfile';
export { useOptimizedCommunities, useOptimizedCommunity } from './useOptimizedCommunities';
export { useOptimizedAnuncios, useOptimizedAnuncio, useOptimizedAnunciosByCategory } from './useOptimizedAnuncios';
export { useOptimizedTransactions } from './useOptimizedTransactions';

// Re-export the centralized API service
export { userQueries, communityQueries, postQueries, anuncioQueries, transactionQueries, messageQueries, queryKeys } from '../../services/api';

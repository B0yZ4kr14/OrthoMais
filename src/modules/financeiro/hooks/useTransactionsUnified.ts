/**
 * useTransactionsUnified Hook
 * Hook unificado que alterna entre Supabase e REST API automaticamente
 */

import { useDataSource } from '@/lib/providers/DataSourceProvider';
import { useTransactionsAPI } from './useTransactionsAPI';
import { useState } from 'react';

// Implementação placeholder para Supabase (manter compatibilidade)
function useTransactionsSupabase() {
  const [transactions] = useState([]);
  const [loading] = useState(false);
  
  return {
    transactions,
    loading,
    createTransaction: async () => {},
    updateTransaction: async () => {},
    deleteTransaction: async () => {},
    reloadTransactions: async () => {},
  };
}

export function useTransactionsUnified() {
  const { useRESTAPI } = useDataSource();
  
  const supabaseHook = useTransactionsSupabase();
  const apiHook = useTransactionsAPI();
  
  return useRESTAPI ? apiHook : supabaseHook;
}

export { useTransactionsUnified as useTransactions };

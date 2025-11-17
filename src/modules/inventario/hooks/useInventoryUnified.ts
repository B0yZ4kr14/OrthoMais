/**
 * useInventoryUnified Hook
 * Hook unificado que alterna entre Supabase e REST API automaticamente
 */

import { useDataSource } from '@/lib/providers/DataSourceProvider';
import { useInventoryAPI } from './useInventoryAPI';
import { useState } from 'react';

// Implementação placeholder para Supabase (manter compatibilidade)
function useInventorySupabase() {
  const [products] = useState([]);
  const [loading] = useState(false);
  
  return {
    products,
    loading,
    addProduct: async () => {},
    updateProduct: async () => {},
    adjustStock: async () => {},
    deleteProduct: async () => {},
    reloadProducts: async () => {},
  };
}

export function useInventoryUnified() {
  const { useRESTAPI } = useDataSource();
  
  const supabaseHook = useInventorySupabase();
  const apiHook = useInventoryAPI();
  
  return useRESTAPI ? apiHook : supabaseHook;
}

export { useInventoryUnified as useInventory };

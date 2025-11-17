/**
 * usePatientsUnified Hook
 * Hook unificado que alterna entre Supabase e REST API automaticamente
 * Mantém compatibilidade total com código existente
 */

import { useDataSource } from '@/lib/providers/DataSourceProvider';
import { usePatientsSupabase } from './usePatientsSupabase';
import { usePatientsAPI } from './usePatientsAPI';

export function usePatientsUnified() {
  const { useRESTAPI } = useDataSource();
  
  // Alternar entre implementações de forma transparente
  const supabaseHook = usePatientsSupabase();
  const apiHook = usePatientsAPI();
  
  // Retornar implementação baseada na configuração
  return useRESTAPI ? apiHook : supabaseHook;
}

// Export como default para facilitar migração
export { usePatientsUnified as usePatients };

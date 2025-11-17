/**
 * Data Source Provider
 * Permite alternar entre Supabase (legacy) e REST API de forma transparente
 * Facilita migração gradual sem quebrar funcionalidade existente
 */

import { createContext, useContext, ReactNode } from 'react';

type DataSource = 'supabase' | 'rest-api';

interface DataSourceContextType {
  source: DataSource;
  useRESTAPI: boolean;
}

const DataSourceContext = createContext<DataSourceContextType>({
  source: 'supabase', // Default: mantém compatibilidade com código existente
  useRESTAPI: false,
});

export const useDataSource = () => useContext(DataSourceContext);

interface DataSourceProviderProps {
  children: ReactNode;
  source?: DataSource;
}

export function DataSourceProvider({ 
  children, 
  source = 'supabase' // Migração gradual: começa com Supabase
}: DataSourceProviderProps) {
  return (
    <DataSourceContext.Provider 
      value={{ 
        source,
        useRESTAPI: source === 'rest-api'
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
}

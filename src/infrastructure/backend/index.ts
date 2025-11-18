/**
 * Backend Service Factory
 * Allows switching between Supabase and PostgreSQL implementations
 */

import { SupabaseBackendService } from './SupabaseBackendService';
import type { IBackendService } from './IBackendService';

// Environment variable to control backend type
const BACKEND_TYPE = import.meta.env.VITE_BACKEND_TYPE || 'supabase';

/**
 * Get the active backend service
 * Can be extended to support PostgreSQL implementation
 */
export function getBackendService(): IBackendService {
  if (BACKEND_TYPE === 'postgresql') {
    // TODO: Implement PostgreSQLBackendService when self-hosted is ready
    throw new Error('PostgreSQL backend not implemented yet');
  }

  // Default to Supabase
  return new SupabaseBackendService();
}

// Singleton instance
export const backend = getBackendService();

// Export types
export type { IBackendService, IAuthService, IDataService, IStorageService, IFunctionsService } from './IBackendService';

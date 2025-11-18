/**
 * Backend Service Abstraction Layer
 * Allows switching between Supabase Cloud and Self-Hosted PostgreSQL
 */

import { User, Session } from '@supabase/supabase-js';
import { 
  DatabaseRecord, 
  QueryFilters, 
  PaginatedResponse, 
  FileUploadResult,
  StorageConfig 
} from '@/types/common';

// ==================== Authentication Service ====================

export interface IAuthService {
  /**
   * Sign up a new user
   */
  signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
  }>;

  /**
   * Sign in an existing user
   */
  signIn(email: string, password: string): Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
  }>;

  /**
   * Sign out current user
   */
  signOut(): Promise<{ error: Error | null }>;

  /**
   * Get current session
   */
  getSession(): Promise<{ session: Session | null; error: Error | null }>;

  /**
   * Get current user
   */
  getUser(): Promise<{ user: User | null; error: Error | null }>;

  /**
   * Reset password
   */
  resetPassword(email: string): Promise<{ error: Error | null }>;

  /**
   * Update password
   */
  updatePassword(newPassword: string): Promise<{ error: Error | null }>;

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void): () => void;
}

// ==================== Data Service ====================

export interface QueryOptions {
  filters?: QueryFilters;
  sort?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

export interface IDataService {
  /**
   * Query records from a table
   */
  query<T extends DatabaseRecord>(
    table: string,
    options?: QueryOptions
  ): Promise<{ data: T[]; error: Error | null }>;

  /**
   * Query records with pagination
   */
  queryPaginated<T extends DatabaseRecord>(
    table: string,
    options?: QueryOptions
  ): Promise<{ data: PaginatedResponse<T>; error: Error | null }>;

  /**
   * Get a single record by ID
   */
  getById<T extends DatabaseRecord>(
    table: string,
    id: string
  ): Promise<{ data: T | null; error: Error | null }>;

  /**
   * Create a new record
   */
  create<T extends DatabaseRecord>(
    table: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: Error | null }>;

  /**
   * Update an existing record
   */
  update<T extends DatabaseRecord>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: Error | null }>;

  /**
   * Delete a record
   */
  delete(
    table: string,
    id: string
  ): Promise<{ error: Error | null }>;

  /**
   * Execute a custom query (for complex operations)
   */
  executeQuery<T = unknown>(
    query: string,
    params?: unknown[]
  ): Promise<{ data: T | null; error: Error | null }>;

  /**
   * Subscribe to real-time changes
   */
  subscribe<T extends DatabaseRecord>(
    table: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: T;
      old: T;
    }) => void
  ): () => void;
}

// ==================== Storage Service ====================

export interface IStorageService {
  /**
   * Upload a file
   */
  upload(
    file: File,
    config: StorageConfig
  ): Promise<{ data: FileUploadResult | null; error: Error | null }>;

  /**
   * Download a file
   */
  download(
    bucket: string,
    path: string
  ): Promise<{ data: Blob | null; error: Error | null }>;

  /**
   * Delete a file
   */
  delete(
    bucket: string,
    path: string
  ): Promise<{ error: Error | null }>;

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string;

  /**
   * Get signed URL for a private file
   */
  getSignedUrl(
    bucket: string,
    path: string,
    expiresIn?: number
  ): Promise<{ data: { signedUrl: string } | null; error: Error | null }>;

  /**
   * List files in a bucket
   */
  list(
    bucket: string,
    path?: string
  ): Promise<{ data: Array<{ name: string; size: number }> | null; error: Error | null }>;
}

// ==================== Edge Functions Service ====================

export interface IFunctionsService {
  /**
   * Invoke an edge function
   */
  invoke<TRequest = unknown, TResponse = unknown>(
    functionName: string,
    options?: {
      body?: TRequest;
      headers?: Record<string, string>;
    }
  ): Promise<{ data: TResponse | null; error: Error | null }>;
}

// ==================== Complete Backend Service ====================

export interface IBackendService {
  auth: IAuthService;
  data: IDataService;
  storage: IStorageService;
  functions: IFunctionsService;

  /**
   * Get the backend type (for conditional logic if needed)
   */
  getBackendType(): 'supabase' | 'postgresql';

  /**
   * Check if backend is ready
   */
  isReady(): Promise<boolean>;
}

/**
 * Supabase Implementation of Backend Service
 */

import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import type {
  IBackendService,
  IAuthService,
  IDataService,
  IStorageService,
  IFunctionsService,
  QueryOptions,
} from './IBackendService';
import type {
  DatabaseRecord,
  PaginatedResponse,
  FileUploadResult,
  StorageConfig,
} from '@/types/common';

// ==================== Supabase Auth Service ====================

class SupabaseAuthService implements IAuthService {
  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      return {
        user: data.user,
        session: data.session,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error('Sign up failed', error);
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data.user,
        session: data.session,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error('Sign in failed', error);
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Sign out failed', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Get session failed', error);
      return { session: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { user: data.user, error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Get user failed', error);
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Reset password failed', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('Update password failed', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => subscription.unsubscribe();
  }
}

// ==================== Supabase Data Service ====================

class SupabaseDataService implements IDataService {
  async query<T extends DatabaseRecord>(table: string, options?: QueryOptions) {
    try {
      let query = supabase.from(table).select('*');

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      if (options?.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      return {
        data: (data || []) as T[],
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error(`Query failed for table ${table}`, error);
      return {
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async queryPaginated<T extends DatabaseRecord>(table: string, options?: QueryOptions) {
    try {
      const page = Math.floor((options?.offset || 0) / (options?.limit || 10)) + 1;
      const limit = options?.limit || 10;

      // Get total count
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (countError) throw new Error(countError.message);

      // Get data
      const { data, error } = await this.query<T>(table, options);

      if (error) throw error;

      const total = count || 0;
      const hasMore = (options?.offset || 0) + limit < total;

      return {
        data: {
          data: data || [],
          total,
          page,
          limit,
          hasMore,
        },
        error: null,
      };
    } catch (error) {
      logger.error(`Paginated query failed for table ${table}`, error);
      return {
        data: { data: [], total: 0, page: 1, limit: 10, hasMore: false },
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async getById<T extends DatabaseRecord>(table: string, id: string) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      return {
        data: data as T | null,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error(`Get by ID failed for table ${table}`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async create<T extends DatabaseRecord>(table: string, data: Partial<T>) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      return {
        data: result as T | null,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error(`Create failed for table ${table}`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async update<T extends DatabaseRecord>(table: string, id: string, data: Partial<T>) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      return {
        data: result as T | null,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error(`Update failed for table ${table}`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async delete(table: string, id: string) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error(`Delete failed for table ${table}`, error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  async executeQuery<T = unknown>(query: string, params?: unknown[]) {
    logger.warn('executeQuery not fully implemented for Supabase');
    return {
      data: null as T | null,
      error: new Error('Custom queries not supported in Supabase implementation'),
    };
  }

  subscribe<T extends DatabaseRecord>(
    table: string,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: T; old: T }) => void
  ) {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// ==================== Supabase Storage Service ====================

class SupabaseStorageService implements IStorageService {
  async upload(file: File, config: StorageConfig) {
    try {
      const filePath = `${config.path}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw new Error(error.message);

      const publicUrl = this.getPublicUrl(config.bucket, data.path);

      return {
        data: {
          url: publicUrl,
          path: data.path,
          filename: file.name,
          size: file.size,
          mime_type: file.type,
        },
        error: null,
      };
    } catch (error) {
      logger.error('File upload failed', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async download(bucket: string, path: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      return {
        data: data || null,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error('File download failed', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async delete(bucket: string, path: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      logger.error('File delete failed', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      return {
        data: data ? { signedUrl: data.signedUrl } : null,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error('Get signed URL failed', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async list(bucket: string, path?: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      return {
        data: data ? data.map(file => ({ name: file.name, size: file.metadata?.size || 0 })) : null,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error('List files failed', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}

// ==================== Supabase Functions Service ====================

class SupabaseFunctionsService implements IFunctionsService {
  async invoke<TRequest = unknown, TResponse = unknown>(
    functionName: string,
    options?: { body?: TRequest; headers?: Record<string, string> }
  ) {
    try {
      const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
        body: options?.body,
        headers: options?.headers,
      });

      return {
        data: data || null,
        error: error ? new Error(error.message) : null,
      };
    } catch (error) {
      logger.error(`Function invocation failed: ${functionName}`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}

// ==================== Complete Supabase Backend Service ====================

export class SupabaseBackendService implements IBackendService {
  public auth: IAuthService;
  public data: IDataService;
  public storage: IStorageService;
  public functions: IFunctionsService;

  constructor() {
    this.auth = new SupabaseAuthService();
    this.data = new SupabaseDataService();
    this.storage = new SupabaseStorageService();
    this.functions = new SupabaseFunctionsService();
  }

  getBackendType(): 'supabase' | 'postgresql' {
    return 'supabase';
  }

  async isReady(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('clinics').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const supabaseBackend = new SupabaseBackendService();

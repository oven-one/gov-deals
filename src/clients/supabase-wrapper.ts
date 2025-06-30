/**
 * Wrapper to make SamApi work with Supabase Edge Functions
 * Converts query parameter authentication to header authentication
 */

import { OpportunitiesEndpoint } from './sam/endpoints/opportunities';
import axios, { AxiosInstance } from 'axios';
import { ApiError, AuthenticationError } from '../core/errors';

/**
 * Custom client that sends API key in headers instead of query params
 */
class SupabaseClient {
  private readonly axios: AxiosInstance;

  constructor(apiKey: string, baseUrl: string) {
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    // Intercept requests to remove api_key from query params
    this.axios.interceptors.request.use((config) => {
      if (config.params?.api_key) {
        delete config.params.api_key;
      }
      return config;
    });
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.axios.get<T>(path, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async post<T>(path: string, data?: unknown, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.axios.post<T>(path, data, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.response?.data?.message || error.message;

      if (status === 401 || status === 403) {
        throw new AuthenticationError(`Authentication failed: ${message}`);
      }

      throw new ApiError(
        `API error: ${message}`,
        status,
        error.response?.data
      );
    }

    throw error;
  }
}

/**
 * Supabase-compatible API wrapper
 * Use this instead of SamApi when connecting to Supabase Edge Functions
 */
export class SupabaseApi {
  private readonly client: SupabaseClient;
  public readonly opportunities: OpportunitiesEndpoint;

  constructor(options: { apiKey: string; baseUrl: string }) {
    this.client = new SupabaseClient(options.apiKey, options.baseUrl);
    this.opportunities = new OpportunitiesEndpoint(this.client as any);
  }
}

/**
 * Helper function to create Supabase-compatible API instance
 */
export function createSupabaseApi(supabaseUrl: string, supabaseAnonKey: string) {
  // Ensure the URL includes /functions/v1/api
  const baseUrl = supabaseUrl.includes('/functions/v1') 
    ? supabaseUrl 
    : `${supabaseUrl}/functions/v1/api`;

  return new SupabaseApi({
    apiKey: supabaseAnonKey,
    baseUrl: baseUrl,
  });
}
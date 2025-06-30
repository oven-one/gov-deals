/**
 * SAM.gov API Client
 */

import axios, { AxiosInstance } from 'axios';
import { ApiError, AuthenticationError } from '../../core/errors';

export interface SamClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

/**
 * Simple SAM.gov API client
 */
export class SamClient {
  private readonly axios: AxiosInstance;
  private readonly apiKey: string;

  constructor(options: SamClientOptions) {
    if (!options.apiKey) {
      throw new Error('SAM.gov API key is required');
    }

    this.apiKey = options.apiKey;
    this.axios = axios.create({
      baseURL: options.baseUrl || 'https://api.sam.gov/prod',
      timeout: options.timeout || 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    try {
      // Always add API key to query parameters
      const allParams = {
        api_key: this.apiKey,
        ...params,
      };
      
      const response = await this.axios.get<T>(path, { params: allParams });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, data?: unknown, params?: Record<string, any>): Promise<T> {
    try {
      // Always add API key to query parameters
      const allParams = {
        api_key: this.apiKey,
        ...params,
      };
      
      const response = await this.axios.post<T>(path, data, { params: allParams });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 401 || status === 403) {
        throw new AuthenticationError(`Authentication failed: ${message}`);
      }

      throw new ApiError(
        `SAM.gov API error: ${message}`,
        status,
        error.response?.data
      );
    }

    throw error;
  }
}
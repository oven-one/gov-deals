/**
 * Main SAM.gov client
 */

import { SamClient } from './client';
import { OpportunitiesEndpoint } from './endpoints/opportunities';
import { createConfig, validateConfig } from '../../core/config';
import type { Config } from '../../core/config';

export interface SamApiOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

/**
 * Main SAM.gov API client with all endpoints
 */
export class SamApi {
  private readonly client: SamClient;
  public readonly opportunities: OpportunitiesEndpoint;

  constructor(options: SamApiOptions) {
    // Create simple client options
    const clientOptions = {
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      timeout: options.timeout,
    };

    this.client = new SamClient(clientOptions);
    this.opportunities = new OpportunitiesEndpoint(this.client);
  }

  /**
   * Create SamApi from configuration
   */
  static fromConfig(config: Config): SamApi {
    validateConfig(config);
    
    return new SamApi({
      apiKey: config.samGov.apiKey,
      baseUrl: config.samGov.baseUrl,
      timeout: config.samGov.timeout,
      debug: config.debug,
    });
  }

  /**
   * Create SamApi from environment variables
   */
  static fromEnv(): SamApi {
    const config = createConfig();
    return SamApi.fromConfig(config);
  }
}

// Re-export types
export * from './client';
export * from './endpoints/opportunities';
export * from '../../types/opportunities';
export * from '../../config/constants';
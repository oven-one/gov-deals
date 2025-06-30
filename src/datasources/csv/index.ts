/**
 * CSV-based API that mimics SAM.gov API
 */

import { CsvClient } from './client';
import { CsvOpportunitiesEndpoint } from './endpoints/opportunities';

export interface CsvApiOptions {
  csvPath: string;
  cacheResults?: boolean;
  encoding?: BufferEncoding;
}

/**
 * CSV-based API client with all endpoints
 * Provides same interface as SamApi but reads from CSV
 */
export class CsvApi {
  private readonly client: CsvClient;
  public readonly opportunities: CsvOpportunitiesEndpoint;

  constructor(options: CsvApiOptions) {
    this.client = new CsvClient(options);
    this.opportunities = new CsvOpportunitiesEndpoint(this.client);
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.client.clearCache();
  }
}

// Re-export types
export * from './client';
export * from './endpoints/opportunities';
export * from './field-mapping';
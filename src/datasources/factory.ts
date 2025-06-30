/**
 * Factory for creating data source instances
 */

import { SamApi, SamApiOptions } from '../clients/sam';
import { CsvApi, CsvApiOptions } from './csv';
import { DataSourceConfig } from './types';

/**
 * Unified API interface that can use either SAM.gov or CSV data
 */
export interface GovDealsApi {
  opportunities: {
    search: (...args: any[]) => Promise<any>;
    getById: (noticeId: string) => Promise<any>;
    getDescription: (noticeId: string) => Promise<string>;
    searchConstruction: (...args: any[]) => Promise<any>;
  };
}

/**
 * Factory function to create appropriate data source
 */
export function createGovDealsApi(config: DataSourceConfig): GovDealsApi {
  switch (config.type) {
    case 'api':
      return createApiDataSource(config);
    case 'csv':
      return createCsvDataSource(config);
    default:
      throw new Error(`Unknown data source type: ${config.type}`);
  }
}

/**
 * Create SAM.gov API data source
 */
function createApiDataSource(config: DataSourceConfig): SamApi {
  if (!config.apiKey) {
    throw new Error('API key is required for SAM.gov data source');
  }

  const options: SamApiOptions = {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    debug: config.debug,
  };

  return new SamApi(options);
}

/**
 * Create CSV data source
 */
function createCsvDataSource(config: DataSourceConfig): CsvApi {
  if (!config.csvPath) {
    throw new Error('CSV path is required for CSV data source');
  }

  const options: CsvApiOptions = {
    csvPath: config.csvPath,
    cacheResults: true,
  };

  return new CsvApi(options);
}

/**
 * Configuration helper for historical data mode
 */
export function createHistoricalConfig(csvPath: string = './scratch/FY2025_opportunities.csv'): DataSourceConfig {
  return {
    type: 'csv',
    csvPath,
  };
}

/**
 * Configuration helper for production mode
 */
export function createProductionConfig(apiKey: string, baseUrl?: string): DataSourceConfig {
  return {
    type: 'api',
    apiKey,
    baseUrl,
  };
}
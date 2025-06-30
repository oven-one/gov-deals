// Main package exports
export { SamApi } from './clients/sam';
export type { SamApiOptions } from './clients/sam';

// Supabase wrapper for header-based auth
export { SupabaseApi, createSupabaseApi } from './clients/supabase-wrapper';

// Data sources
export { CsvApi } from './datasources/csv';
export type { CsvApiOptions } from './datasources/csv';

// Factory for creating data sources
export { 
  createGovDealsApi, 
  createHistoricalConfig, 
  createProductionConfig,
  type GovDealsApi 
} from './datasources/factory';
export type { DataSourceConfig, DataSourceType } from './datasources/types';

// Configuration
export { createConfig } from './core/config';
export type { Config } from './core/config';

// Types
export * from './types/common';
export * from './types/opportunities';

// Constants
export * from './config/constants';

// Errors
export * from './core/errors';

// Convenience exports for common use cases
export { CONSTRUCTION_NAICS_CODES, OPPORTUNITY_TYPES, SET_ASIDE_TYPES } from './config/constants';

// NAICS utilities
export * from './utils/naics';

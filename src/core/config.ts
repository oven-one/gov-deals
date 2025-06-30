/**
 * Configuration management for the gov-deals package
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration schema for validation
 */
export const ConfigSchema = z.object({
  samGov: z.object({
    apiKey: z.string().min(1, 'SAM.gov API key is required'),
    baseUrl: z.string().url().default('https://api.sam.gov'),
    timeout: z.number().int().positive().default(30000),
    retryAttempts: z.number().int().nonnegative().default(3),
    retryDelay: z.number().int().positive().default(1000),
  }),
  cache: z.object({
    enabled: z.boolean().default(true),
    ttlSeconds: z.number().int().positive().default(300),
    maxSize: z.number().int().positive().default(100),
  }),
  debug: z.boolean().default(false),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Create configuration from environment variables and options
 */
export function createConfig(options: Partial<Config> = {}): Config {
  // Build final config with fallbacks
  const config: Config = {
    samGov: {
      apiKey: options.samGov?.apiKey || process.env.SAM_GOV_API_KEY || '',
      baseUrl: options.samGov?.baseUrl || process.env.SAM_GOV_BASE_URL || 'https://api.sam.gov',
      timeout: options.samGov?.timeout || 
               (process.env.SAM_GOV_TIMEOUT ? parseInt(process.env.SAM_GOV_TIMEOUT) : 30000),
      retryAttempts: options.samGov?.retryAttempts || 
                     (process.env.SAM_GOV_RETRY_ATTEMPTS ? parseInt(process.env.SAM_GOV_RETRY_ATTEMPTS) : 3),
      retryDelay: options.samGov?.retryDelay || 
                  (process.env.SAM_GOV_RETRY_DELAY ? parseInt(process.env.SAM_GOV_RETRY_DELAY) : 1000),
    },
    cache: {
      enabled: options.cache?.enabled ?? 
               (process.env.CACHE_ENABLED ? process.env.CACHE_ENABLED === 'true' : true),
      ttlSeconds: options.cache?.ttlSeconds || 
                  (process.env.CACHE_TTL_SECONDS ? parseInt(process.env.CACHE_TTL_SECONDS) : 300),
      maxSize: options.cache?.maxSize || 
               (process.env.CACHE_MAX_SIZE ? parseInt(process.env.CACHE_MAX_SIZE) : 100),
    },
    debug: options.debug ?? (process.env.DEBUG === 'true') ?? (process.env.NODE_ENV === 'development'),
  };

  // Validate the final configuration
  return ConfigSchema.parse(config);
}

/**
 * Validate that required configuration is present
 */
export function validateConfig(config: Config): void {
  if (!config.samGov.apiKey) {
    throw new Error(
      'SAM.gov API key is required. Set SAM_GOV_API_KEY environment variable or pass it in configuration.'
    );
  }
}
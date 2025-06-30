/**
 * Common types used across the gov-deals package
 * All types are prefixed with 'GovDeals' to avoid naming conflicts
 */

import { z } from 'zod';
import { StateCodeSchema } from '../config/constants';

/**
 * Location information for government contracts
 */
export const GovDealsLocationSchema = z.object({
  city: z.string().optional(),
  state: StateCodeSchema.optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
});

export type GovDealsLocation = z.infer<typeof GovDealsLocationSchema>;

/**
 * Federal agency information
 */
export const GovDealsAgencySchema = z.object({
  name: z.string(),
  code: z.string().optional(),
  type: z.string().optional(),
  parentAgency: z.string().optional(),
});

export type GovDealsAgency = z.infer<typeof GovDealsAgencySchema>;

/**
 * Government contact information
 */
export const GovDealsContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
});

export type GovDealsContact = z.infer<typeof GovDealsContactSchema>;

/**
 * Date range for contract searches
 */
export const GovDealsDateRangeSchema = z.object({
  start: z.union([z.date(), z.string()]),
  end: z.union([z.date(), z.string()]),
});

export type GovDealsDateRange = z.infer<typeof GovDealsDateRangeSchema>;

/**
 * Value range for contract amounts
 */
export const GovDealsValueRangeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  currency: z.string().default('USD').optional(),
});

export type GovDealsValueRange = z.infer<typeof GovDealsValueRangeSchema>;

/**
 * Pagination parameters for API requests
 */
export const GovDealsPaginationParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type GovDealsPaginationParams = z.infer<typeof GovDealsPaginationParamsSchema>;

/**
 * Sort order for results
 */
export const GovDealsSortOrderSchema = z.enum(['asc', 'desc']);
export type GovDealsSortOrder = z.infer<typeof GovDealsSortOrderSchema>;

/**
 * API error response
 */
export const GovDealsErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type GovDealsErrorResponse = z.infer<typeof GovDealsErrorResponseSchema>;

/**
 * API response wrapper
 */
export const GovDealsApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    metadata: z.object({
      totalRecords: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      hasMore: z.boolean().optional(),
    }).optional(),
  });

export type GovDealsApiResponse<T> = {
  data: T;
  metadata?: {
    totalRecords?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
};
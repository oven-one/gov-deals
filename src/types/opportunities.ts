/**
 * SAM.gov Opportunity types with Zod validation
 */

import { z } from 'zod';
import {
  OpportunityTypeSchema,
  TypeOfSetAsideSchema,
  CompetitionStrategySchema,
  ActiveStatusSchema,
  StateCodeSchema,
} from '../config/constants';
import {
  GovDealsSortOrderSchema,
} from './common';

/**
 * Classification code (NAICS, PSC, etc.)
 */
export const SamClassificationCodeSchema = z.object({
  type: z.enum(['NAICS', 'PSC', 'FSC']),
  code: z.string(),
  description: z.string().optional(),
});

export type SamClassificationCode = z.infer<typeof SamClassificationCodeSchema>;

/**
 * Attachment/document information
 */
export const SamAttachmentSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  size: z.number().optional(),
  url: z.string().url().optional(),
  postedDate: z.string().optional(),
});

export type SamAttachment = z.infer<typeof SamAttachmentSchema>;

/**
 * Important dates for an opportunity
 */
export const SamOpportunityDatesSchema = z.object({
  posted: z.string().optional(),
  modified: z.string().optional(),
  responseDeadline: z.string().optional(),
  archiveDate: z.string().optional(),
  closeDate: z.string().optional(),
});

export type SamOpportunityDates = z.infer<typeof SamOpportunityDatesSchema>;

/**
 * Award information
 */
export const SamAwardInfoSchema = z.object({
  awardDate: z.string().optional(),
  awardNumber: z.string().optional(),
  awardAmount: z.number().optional(),
  awardee: z.object({
    name: z.string().optional(),
    uei: z.string().optional(), // Unique Entity Identifier
    cageCode: z.string().optional(),
  }).optional(),
});

export type SamAwardInfo = z.infer<typeof SamAwardInfoSchema>;

/**
 * Resource link
 */
export const SamResourceLinkSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
});

export type SamResourceLink = z.infer<typeof SamResourceLinkSchema>;

/**
 * Point of Contact schema (actual API structure)
 */
export const SamPointOfContactSchema = z.object({
  type: z.string(), // "primary", "secondary", etc.
  fullName: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  fax: z.string().nullable().optional(),
});

export type SamPointOfContact = z.infer<typeof SamPointOfContactSchema>;

/**
 * Office Address schema (actual API structure)
 */
export const SamOfficeAddressSchema = z.object({
  zipcode: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(), // Allow international states
  countryCode: z.string().nullable().optional(),
});

export type SamOfficeAddress = z.infer<typeof SamOfficeAddressSchema>;

/**
 * Award schema (actual API structure)
 */
export const SamAwardSchema = z.object({
  awardee: z.object({
    manual: z.boolean().optional(),
    name: z.string().nullable().optional(),
    uei: z.string().nullable().optional(),
    cageCode: z.string().nullable().optional(),
  }).optional(),
});

export type SamAward = z.infer<typeof SamAwardSchema>;

/**
 * Link schema
 */
export const SamLinkSchema = z.object({
  rel: z.string(),
  href: z.string(),
});

export type SamLink = z.infer<typeof SamLinkSchema>;

/**
 * Full SAM.gov Opportunity schema (based on actual API response)
 */
export const SamOpportunitySchema = z.object({
  // Core identifiers
  noticeId: z.string(),
  title: z.string(),
  solicitationNumber: z.string().nullable().optional(),
  
  // Agency information
  fullParentPathName: z.string().optional(),
  fullParentPathCode: z.string().optional(),
  organizationType: z.string().optional(),
  
  // Dates
  postedDate: z.string(),
  responseDeadLine: z.string().nullable().optional(),
  archiveDate: z.string().optional(),
  
  // Type information
  type: z.string(), // Keep as string since API returns "Solicitation" not codes
  baseType: z.string().optional(),
  archiveType: z.string().optional(),
  
  // Set-aside information
  typeOfSetAside: TypeOfSetAsideSchema.nullable().optional(),
  typeOfSetAsideDescription: z.string().nullable().optional(),
  
  // Classification
  naicsCode: z.string().nullable().optional(),
  naicsCodes: z.array(z.string()).optional(),
  classificationCode: z.string().nullable().optional(),
  
  // Status
  active: ActiveStatusSchema.optional(), // "Yes"/"No" validation
  
  // Description
  description: z.string().optional(), // URL to description endpoint
  
  // Contacts
  pointOfContact: z.array(SamPointOfContactSchema).optional(),
  
  // Addresses
  officeAddress: SamOfficeAddressSchema.optional(),
  placeOfPerformance: SamOfficeAddressSchema.nullable().optional(),
  
  // Award information
  award: SamAwardSchema.nullable().optional(),
  
  // Links
  uiLink: z.string().optional(),
  links: z.array(SamLinkSchema).optional(),
  additionalInfoLink: z.string().nullable().optional(),
  resourceLinks: z.string().nullable().optional(), // Can be null or string
});

export type SamOpportunity = z.infer<typeof SamOpportunitySchema>;

/**
 * Search filters for opportunities
 */
export const SamOpportunitySearchFiltersSchema = z.object({
  // Keywords
  keywords: z.string().optional(),
  
  // Type filters
  types: z.array(OpportunityTypeSchema).optional(),
  
  // Classification filters
  naicsCodes: z.array(z.string()).optional(),
  pscCodes: z.array(z.string()).optional(),
  
  // Location filters
  placeOfPerformanceStates: z.array(StateCodeSchema).optional(),
  placeOfPerformanceZips: z.array(z.string()).optional(),
  
  // Agency filters
  agencies: z.array(z.string()).optional(),
  
  // Set-aside filters
  setAsideTypes: z.array(TypeOfSetAsideSchema).optional(),
  
  // Date filters
  postedFrom: z.string().optional(),
  postedTo: z.string().optional(),
  responseDeadlineFrom: z.string().optional(),
  responseDeadlineTo: z.string().optional(),
  
  // Value filters
  estimatedValueMin: z.number().optional(),
  estimatedValueMax: z.number().optional(),
  
  // Status filters
  activeOnly: z.boolean().optional(),
  includeArchived: z.boolean().optional(),
  
  // Competition filters
  competitionStrategy: z.array(CompetitionStrategySchema).optional(),
});

export type SamOpportunitySearchFilters = z.infer<typeof SamOpportunitySearchFiltersSchema>;

/**
 * Sort options for opportunity searches
 */
export const SamOpportunitySortOptionsSchema = z.object({
  field: z.enum(['postedDate', 'modifiedDate', 'responseDeadline', 'title', 'estimatedValue']),
  order: GovDealsSortOrderSchema,
});

export type SamOpportunitySortOptions = z.infer<typeof SamOpportunitySortOptionsSchema>;

/**
 * API response for opportunity search (actual API structure)
 */
export const SamOpportunitySearchResponseSchema = z.object({
  totalRecords: z.number(),
  limit: z.number(),
  offset: z.number(),
  opportunitiesData: z.array(SamOpportunitySchema),
  links: z.array(SamLinkSchema).optional(),
});

export type SamOpportunitySearchResponse = z.infer<typeof SamOpportunitySearchResponseSchema>;
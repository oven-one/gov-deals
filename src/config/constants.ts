/**
 * Configuration constants for the gov-deals package
 * These values can be updated as the SAM.gov API evolves
 */

import { z } from 'zod';

/**
 * SAM.gov Opportunity Type Codes
 * Source: SAM.gov API Documentation
 * Last verified: 2024
 */
export const OPPORTUNITY_TYPES = {
  PRESOLICITATION: 'p',
  SOLICITATION: 'o',
  AWARD_NOTICE: 'a',
  INTENT_TO_BUNDLE: 'i',
  JUSTIFICATION: 'u',
  SOURCES_SOUGHT: 'r',
  SPECIAL_NOTICE: 's',
  COMBINED_SYNOPSIS: 'k',
  SALE_OF_SURPLUS: 'g',
} as const;

// Derive types from constants
export type OpportunityTypeCode = typeof OPPORTUNITY_TYPES[keyof typeof OPPORTUNITY_TYPES];
export type OpportunityTypeKey = keyof typeof OPPORTUNITY_TYPES;

// Zod schema for runtime validation
export const OpportunityTypeSchema = z.enum([
  OPPORTUNITY_TYPES.PRESOLICITATION,
  OPPORTUNITY_TYPES.SOLICITATION,
  OPPORTUNITY_TYPES.AWARD_NOTICE,
  OPPORTUNITY_TYPES.INTENT_TO_BUNDLE,
  OPPORTUNITY_TYPES.JUSTIFICATION,
  OPPORTUNITY_TYPES.SOURCES_SOUGHT,
  OPPORTUNITY_TYPES.SPECIAL_NOTICE,
  OPPORTUNITY_TYPES.COMBINED_SYNOPSIS,
  OPPORTUNITY_TYPES.SALE_OF_SURPLUS,
]);

/**
 * Federal Set-Aside Type Codes
 * Source: Federal Acquisition Regulation (FAR)
 */
export const SET_ASIDE_TYPES = {
  SMALL_BUSINESS: 'SBA',
  SMALL_BUSINESS_SET_ASIDE: 'SBP',
  EIGHT_A: '8A',
  EIGHT_A_SOLE_SOURCE: '8AN',
  EIGHT_A_COMPETITIVE: '8AC',
  HUB_ZONE: 'HZC',
  HUB_ZONE_SOLE_SOURCE: 'HZS',
  SDVOSB: 'SDVOSBC',
  SDVOSB_SOLE_SOURCE: 'SDVOSBS',
  WOMEN_OWNED: 'WOSB',
  EDWOSB: 'EDWOSB',
  LOCAL_AREA: 'LAS',
  INDIAN_ECONOMIC: 'IEE',
  INDIAN_SMALL_BUSINESS: 'ISBEE',
  BUY_INDIAN: 'BICiv',
  VETERAN_OWNED: 'VSA',
  VETERAN_OWNED_SOLE_SOURCE: 'VSS',
  NONE: 'NONE',
} as const;

export type SetAsideTypeCode = typeof SET_ASIDE_TYPES[keyof typeof SET_ASIDE_TYPES];
export type SetAsideTypeKey = keyof typeof SET_ASIDE_TYPES;

// Renamed to match actual API field name
export const TypeOfSetAsideSchema = z.enum([
  SET_ASIDE_TYPES.SMALL_BUSINESS,
  SET_ASIDE_TYPES.SMALL_BUSINESS_SET_ASIDE,
  SET_ASIDE_TYPES.EIGHT_A,
  SET_ASIDE_TYPES.EIGHT_A_SOLE_SOURCE,
  SET_ASIDE_TYPES.EIGHT_A_COMPETITIVE,
  SET_ASIDE_TYPES.HUB_ZONE,
  SET_ASIDE_TYPES.HUB_ZONE_SOLE_SOURCE,
  SET_ASIDE_TYPES.SDVOSB,
  SET_ASIDE_TYPES.SDVOSB_SOLE_SOURCE,
  SET_ASIDE_TYPES.WOMEN_OWNED,
  SET_ASIDE_TYPES.EDWOSB,
  SET_ASIDE_TYPES.LOCAL_AREA,
  SET_ASIDE_TYPES.INDIAN_ECONOMIC,
  SET_ASIDE_TYPES.INDIAN_SMALL_BUSINESS,
  SET_ASIDE_TYPES.BUY_INDIAN,
  SET_ASIDE_TYPES.VETERAN_OWNED,
  SET_ASIDE_TYPES.VETERAN_OWNED_SOLE_SOURCE,
  SET_ASIDE_TYPES.NONE,
]);

// Keep the old name for backward compatibility
export const SetAsideTypeSchema = TypeOfSetAsideSchema;

/**
 * Construction-related NAICS Codes
 * Source: North American Industry Classification System
 */
export const CONSTRUCTION_NAICS_CODES = {
  COMMERCIAL_BUILDING: '236220',
  INDUSTRIAL_BUILDING: '236210',
  RESIDENTIAL_REMODELING: '236118',
  ELECTRICAL_CONTRACTORS: '238210',
  PLUMBING_HVAC: '238220',
  DRYWALL_INSULATION: '238310',
  PAINTING: '238320',
  SITE_PREPARATION: '238910',
  ROOFING: '238160',
  CONCRETE: '238110',
} as const;

export type ConstructionNAICSCode = typeof CONSTRUCTION_NAICS_CODES[keyof typeof CONSTRUCTION_NAICS_CODES];
export type ConstructionNAICSKey = keyof typeof CONSTRUCTION_NAICS_CODES;

// Create an array of values for the schema
const constructionNAICSValues = Object.values(CONSTRUCTION_NAICS_CODES) as [string, ...string[]];
export const ConstructionNAICSSchema = z.enum(constructionNAICSValues);

/**
 * Contract Pricing Types
 * Source: Federal Acquisition Regulation (FAR) Part 16
 */
export const CONTRACT_PRICING_TYPES = {
  FIRM_FIXED_PRICE: 'FFP',
  FIXED_PRICE_EPA: 'FPE',
  FIXED_PRICE_INCENTIVE: 'FPI',
  FIXED_PRICE_REDETERMINATION: 'FPR',
  COST_PLUS_FIXED_FEE: 'CPFF',
  COST_PLUS_INCENTIVE_FEE: 'CPIF',
  COST_PLUS_AWARD_FEE: 'CPAF',
  COST_SHARING: 'CS',
  COST_REIMBURSEMENT: 'CR',
  TIME_AND_MATERIALS: 'TM',
  LABOR_HOURS: 'LH',
  OTHER: 'OT',
} as const;

export type ContractPricingTypeCode = typeof CONTRACT_PRICING_TYPES[keyof typeof CONTRACT_PRICING_TYPES];
export type ContractPricingTypeKey = keyof typeof CONTRACT_PRICING_TYPES;

const contractPricingValues = Object.values(CONTRACT_PRICING_TYPES) as [string, ...string[]];
export const ContractPricingTypeSchema = z.enum(contractPricingValues);

/**
 * API Configuration
 */
export const API_CONFIG = {
  SAM_GOV: {
    BASE_URL: 'https://api.sam.gov/prod',
    OPPORTUNITIES_ENDPOINT: '/opportunities/v2/search',
    ENTITIES_ENDPOINT: '/entity-information/v3/entities',
    HIERARCHY_ENDPOINT: '/federalorganizations/v2/hierarchy',
    DESCRIPTION_ENDPOINT: '/opportunities/v1/noticedesc',
    DEFAULT_PAGE_SIZE: 100,
    MAX_PAGE_SIZE: 1000,
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
  },
  CACHE: {
    DEFAULT_TTL_SECONDS: 300, // 5 minutes
    MAX_CACHE_SIZE: 100,
  },
} as const;

/**
 * US State Codes
 */
export const US_STATES = {
  ALABAMA: 'AL',
  ALASKA: 'AK',
  ARIZONA: 'AZ',
  ARKANSAS: 'AR',
  CALIFORNIA: 'CA',
  COLORADO: 'CO',
  CONNECTICUT: 'CT',
  DELAWARE: 'DE',
  FLORIDA: 'FL',
  GEORGIA: 'GA',
  HAWAII: 'HI',
  IDAHO: 'ID',
  ILLINOIS: 'IL',
  INDIANA: 'IN',
  IOWA: 'IA',
  KANSAS: 'KS',
  KENTUCKY: 'KY',
  LOUISIANA: 'LA',
  MAINE: 'ME',
  MARYLAND: 'MD',
  MASSACHUSETTS: 'MA',
  MICHIGAN: 'MI',
  MINNESOTA: 'MN',
  MISSISSIPPI: 'MS',
  MISSOURI: 'MO',
  MONTANA: 'MT',
  NEBRASKA: 'NE',
  NEVADA: 'NV',
  NEW_HAMPSHIRE: 'NH',
  NEW_JERSEY: 'NJ',
  NEW_MEXICO: 'NM',
  NEW_YORK: 'NY',
  NORTH_CAROLINA: 'NC',
  NORTH_DAKOTA: 'ND',
  OHIO: 'OH',
  OKLAHOMA: 'OK',
  OREGON: 'OR',
  PENNSYLVANIA: 'PA',
  RHODE_ISLAND: 'RI',
  SOUTH_CAROLINA: 'SC',
  SOUTH_DAKOTA: 'SD',
  TENNESSEE: 'TN',
  TEXAS: 'TX',
  UTAH: 'UT',
  VERMONT: 'VT',
  VIRGINIA: 'VA',
  WASHINGTON: 'WA',
  WEST_VIRGINIA: 'WV',
  WISCONSIN: 'WI',
  WYOMING: 'WY',
  DISTRICT_OF_COLUMBIA: 'DC',
  PUERTO_RICO: 'PR',
  US_VIRGIN_ISLANDS: 'VI',
  GUAM: 'GU',
  AMERICAN_SAMOA: 'AS',
  NORTHERN_MARIANA_ISLANDS: 'MP',
} as const;

export type StateCode = typeof US_STATES[keyof typeof US_STATES];
export type StateKey = keyof typeof US_STATES;

const stateValues = Object.values(US_STATES) as [string, ...string[]];
export const StateCodeSchema = z.enum(stateValues);

/**
 * Helper function to get state code from name
 */
export function getStateCode(stateName: StateKey): StateCode {
  return US_STATES[stateName];
}

/**
 * Helper function to validate if a string is a valid state code
 */
export function isValidStateCode(code: string): code is StateCode {
  return StateCodeSchema.safeParse(code).success;
}

/**
 * Competition Strategy
 */
export const COMPETITION_STRATEGIES = {
  FULL_AND_OPEN: 'fullAndOpen',
  SET_ASIDE: 'setAside',
  SOLE_SOURCE: 'soleSource',
  LIMITED_SOURCES: 'limitedSources',
} as const;

export type CompetitionStrategy = typeof COMPETITION_STRATEGIES[keyof typeof COMPETITION_STRATEGIES];

const competitionValues = Object.values(COMPETITION_STRATEGIES) as [string, ...string[]];
export const CompetitionStrategySchema = z.enum(competitionValues);

/**
 * Active Status for opportunities (as returned by API)
 */
export const ACTIVE_STATUS = {
  YES: 'Yes',
  NO: 'No',
} as const;

export type ActiveStatus = typeof ACTIVE_STATUS[keyof typeof ACTIVE_STATUS];
export const ActiveStatusSchema = z.enum([ACTIVE_STATUS.YES, ACTIVE_STATUS.NO]);
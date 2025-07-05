/**
 * SAM.gov Opportunities endpoint
 */

import { ValidationError } from '../../../core/errors';
import { GovDealsPaginationParams } from '../../../types/common';
import {
  SamOpportunity,
  SamOpportunitySearchFilters,
  SamOpportunitySearchFiltersSchema,
  SamOpportunitySearchResponse,
  SamOpportunitySearchResponseSchema,
} from '../../../types/opportunities';
import { SamClient } from '../client';

// US States and territories for search guidance
export const US_STATE_NAMES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 
  'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 
  'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 
  'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 
  'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 
  'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 
  'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming', 'puerto rico', 
  'district of columbia', 'american samoa', 'guam', 'northern mariana islands', 'us virgin islands'
];

export const US_STATE_CODES = [
  'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 
  'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 
  'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 
  'va', 'wa', 'wv', 'wi', 'wy', 'pr', 'dc', 'as', 'gu', 'mp', 'vi', 'ap', 'ae', 'aa'
];

export class OpportunitiesEndpoint {
  constructor(private client: SamClient) {}

  /**
   * Search for opportunities
   */
  async search(
    filters?: SamOpportunitySearchFilters,
    pagination?: GovDealsPaginationParams
  ): Promise<SamOpportunitySearchResponse> {
    // Validate filters if provided
    if (filters) {
      const result = SamOpportunitySearchFiltersSchema.safeParse(filters);
      if (!result.success) {
        throw new ValidationError('Invalid search filters', result.error);
      }
    }

    // Build query parameters
    const params: Record<string, any> = {
      limit: pagination?.limit || 100,
      page: pagination?.page || 1,
      ...this.buildSearchParams(filters),
    };

    // Make the API request
    const response = await this.client.get<any>('/opportunities/v2/search', params);

    // Validate and transform response
    return this.transformSearchResponse(response, filters);
  }


  /**
   * Search for construction opportunities specifically
   */
  async searchConstruction(
    additionalFilters?: Partial<SamOpportunitySearchFilters>,
    pagination?: GovDealsPaginationParams
  ): Promise<SamOpportunitySearchResponse> {
    const constructionFilters: SamOpportunitySearchFilters = {
      naicsCodes: ['236220', '236210', '238210', '238220'], // Construction NAICS codes
      keywords: 'renovation construction building modernization',
      ...additionalFilters,
    };

    return this.search(constructionFilters, pagination);
  }

  /**
   * Build search parameters for the API
   */
  private buildSearchParams(filters?: SamOpportunitySearchFilters): Record<string, any> {
    const params: Record<string, any> = {};

    // SAM.gov API requires PostedFrom and PostedTo - set defaults if not provided
    // API expects MM/dd/yyyy format
    if (filters?.postedFrom) {
      params.postedFrom = this.formatDateForApi(filters.postedFrom);
    } else {
      // Default to 30 days ago if not specified
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      params.postedFrom = this.formatDateForApi(thirtyDaysAgo.toISOString().split('T')[0]);
    }

    if (filters?.postedTo) {
      params.postedTo = this.formatDateForApi(filters.postedTo);
    } else {
      // Default to today if not specified
      params.postedTo = this.formatDateForApi(new Date().toISOString().split('T')[0]);
    }

    if (!filters) return params;

    // Basic filters
    if (filters.keywords) params.title = filters.keywords; // API uses 'title' parameter
    if (filters.naicsCodes?.length) params.ncode = filters.naicsCodes.join(','); // API uses 'ncode' parameter
    if (filters.pscCodes?.length) params.ccode = filters.pscCodes.join(','); // API uses 'ccode' parameter
    if (filters.types?.length) params.ptype = filters.types.join(','); // API uses 'ptype'
    if (filters.setAsideTypes?.length) params.typeOfSetAside = filters.setAsideTypes.join(',');

    // Response deadline filters
    if (filters.responseDeadlineFrom) params.rdlFrom = this.formatDateForApi(filters.responseDeadlineFrom);
    if (filters.responseDeadlineTo) params.rdlTo = this.formatDateForApi(filters.responseDeadlineTo);

    // Location filters
    if (filters.placeOfPerformanceStates?.length) params.state = filters.placeOfPerformanceStates.join(',');
    if (filters.placeOfPerformanceZips?.length) params.zip = filters.placeOfPerformanceZips.join(',');

    // Status filter
    if (filters.activeOnly !== undefined) params.active = filters.activeOnly ? 'true' : 'false';

    return params;
  }

  /**
   * Format date from YYYY-MM-DD to MM/dd/yyyy for SAM.gov API
   */
  private formatDateForApi(dateString: string): string {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * Transform API response to our schema
   * Based on actual SAM.gov API structure
   */
  private transformSearchResponse(apiResponse: any, filters?: SamOpportunitySearchFilters): SamOpportunitySearchResponse {
    // Validate the raw response matches expected structure
    const result = SamOpportunitySearchResponseSchema.safeParse(apiResponse);
    if (!result.success) {
      console.error('Validation errors:', JSON.stringify(result.error.errors, null, 2));
      console.error('Sample response data:', JSON.stringify(apiResponse, null, 2).substring(0, 1000));
      throw new ValidationError('Invalid search response from API', result.error);
    }

    const response = result.data;
    
    // Generate search tips based on filters and results
    const searchTips: string[] = [];
    
    if (filters) {
      // Multiple keywords tip
      if (filters.keywords && filters.keywords.includes(' ') && !filters.keywords.includes('"')) {
        searchTips.push('Multiple keywords use AND logic - try single keywords for broader results');
      }
      
      // Zero results tips
      if (response.totalRecords === 0) {
        if (filters.keywords) {
          searchTips.push('No results found - try broader terms, partial matches, or check spelling');
          
          // Check if keywords might be state names or other non-title content
          const keywords = filters.keywords.toLowerCase();
          
          if (US_STATE_NAMES.some(state => keywords.includes(state)) || US_STATE_CODES.some(code => keywords === code)) {
            searchTips.push('Keywords search titles only - use state filter for location-based searches');
          }
          
          // Check for operators that don't work
          if (keywords.includes(' or ') || keywords.includes(' and ') || keywords.includes('|')) {
            searchTips.push('Operators like OR/AND/| do not work - use simple keywords instead');
          }
        } else {
          searchTips.push('No results found - try adjusting your filters or expanding date ranges');
        }
      }
      
      // Date range tips
      if (filters.postedFrom && filters.postedTo) {
        const fromDate = new Date(filters.postedFrom);
        const toDate = new Date(filters.postedTo);
        const daysDiff = Math.abs((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (response.totalRecords === 0 && daysDiff < 30) {
          searchTips.push('Try expanding your date range for more results');
        }
      }
      
      // NAICS/PSC code tips
      if ((filters.naicsCodes?.length || filters.pscCodes?.length) && response.totalRecords === 0) {
        searchTips.push('No results for specified codes - try broader classification codes or remove code filters');
      }
      
      // Set-aside types guidance
      if (filters.setAsideTypes?.length) {
        if (response.totalRecords === 0) {
          searchTips.push('No results for specified set-aside types - try "SBA" for most opportunities or remove set-aside filter');
        } else if (response.totalRecords < 10 && filters.setAsideTypes.includes('HZC')) {
          searchTips.push('HUBZone set-asides are rare - consider "SBA" or "SDVOSBC" for more opportunities');
        }
      }
      
      // Geographic filter guidance
      if (filters.placeOfPerformanceStates?.length && response.totalRecords === 0) {
        searchTips.push('No results for specified states - some opportunities may have incomplete location data');
      }
      
      if (filters.placeOfPerformanceZips?.length) {
        if (response.totalRecords === 0) {
          searchTips.push('No results for specified zip codes - try using state filter instead as zip data is limited');
        } else if (response.totalRecords > 100) {
          searchTips.push('High zip code results may include surrounding areas - consider adding other filters');
        }
      }
      
      // Opportunity types guidance
      if (filters.types?.length) {
        if (response.totalRecords === 0) {
          searchTips.push('No results for specified opportunity types - try "a" (Award Notice) for most opportunities');
        }
        
        // Warn about problematic types
        if (filters.types.includes('s')) {
          searchTips.push('Special Notice type may have data quality issues - consider using other opportunity types');
        }
        
        // Guide toward high-volume types
        if (response.totalRecords < 10 && !filters.types.some(t => ['a', 'p', 'r'].includes(t))) {
          searchTips.push('For more opportunities, try "a" (Award Notice), "p" (Presolicitation), or "r" (Sources Sought)');
        }
      }
      
      // Date range optimization
      if (filters.postedFrom && filters.postedTo) {
        const fromDate = new Date(filters.postedFrom);
        const toDate = new Date(filters.postedTo);
        const daysDiff = Math.abs((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 180 && response.totalRecords > 500) {
          searchTips.push('Large date range returned many results - consider narrowing the date range or adding filters');
        } else if (daysDiff < 7 && response.totalRecords === 0) {
          searchTips.push('Short date range may be too restrictive - try expanding to 30+ days');
        }
      }
      
      // Filter combination suggestions
      if (response.totalRecords > 200) {
        const activeFilters = [
          filters.keywords ? 'keywords' : null,
          filters.naicsCodes?.length ? 'NAICS' : null,
          filters.pscCodes?.length ? 'PSC' : null,
          filters.setAsideTypes?.length ? 'set-aside' : null,
          filters.placeOfPerformanceStates?.length ? 'state' : null,
          filters.types?.length ? 'type' : null
        ].filter(Boolean);
        
        if (activeFilters.length === 1) {
          searchTips.push('Many results found - consider adding NAICS codes, set-aside types, or keywords to narrow search');
        }
      }
      
      // Success optimization tips
      if (response.totalRecords > 0 && response.totalRecords < 50) {
        if (!filters.keywords && (filters.naicsCodes?.length || filters.pscCodes?.length)) {
          searchTips.push('Good results with classification codes - try adding keywords for more specific matching');
        }
      }
    }
    
    // Add tips to response
    if (searchTips.length > 0) {
      response.searchTips = searchTips;
    }
    
    return response;
  }

  /**
   * Get opportunity by ID - uses search with specific notice ID
   */
  async getById(noticeId: string): Promise<SamOpportunity> {
    const response = await this.client.get<SamOpportunitySearchResponse>('/opportunities/v2/search', {
      noticeid: noticeId,
      limit: 1,
    });

    if (!response.opportunitiesData || response.opportunitiesData.length === 0) {
      throw new ValidationError(`Opportunity with ID ${noticeId} not found`);
    }

    return response.opportunitiesData[0];
  }

  /**
   * Get opportunity by SAM.gov UI URL - extracts notice ID from URL and retrieves the record
   * Accepts URLs like: https://sam.gov/opp/{noticeId}/view
   * Returns undefined if URL doesn't contain a valid notice ID
   */
  async getByUrl(url: string): Promise<SamOpportunity | undefined> {
    // Extract notice ID from SAM.gov URL
    const noticeId = this.extractNoticeIdFromUrl(url);
    if (!noticeId) {
      return undefined;
    }
    
    return this.getById(noticeId);
  }

  /**
   * Extract notice ID from SAM.gov opportunity URL
   * Returns undefined if no valid notice ID found
   */
  private extractNoticeIdFromUrl(url: string): string | undefined {
    // Handle different URL formats:
    // https://sam.gov/opp/{noticeId}/view
    // https://sam.gov/opp/{noticeId}
    // {noticeId} (just the ID)
    
    // If it's already just an ID (no protocol/domain), return as-is
    if (!url.includes('/') && url.length === 32) {
      return url;
    }
    
    // Match SAM.gov opportunity URL pattern
    const samGovPattern = /(?:https?:\/\/)?(?:www\.)?sam\.gov\/opp\/([a-f0-9]{32})(?:\/.*)?/i;
    const match = url.match(samGovPattern);
    
    if (match && match[1]) {
      return match[1];
    }
    
    // Try to extract any 32-character hex string from the URL
    const hexPattern = /([a-f0-9]{32})/i;
    const hexMatch = url.match(hexPattern);
    
    if (hexMatch && hexMatch[1]) {
      return hexMatch[1];
    }
    
    return undefined;
  }

  /**
   * Get opportunity description
   */
  async getDescription(noticeId: string): Promise<string> {
    const response = await this.client.get<{ description: string }>('/opportunities/v1/noticedesc', {
      noticeid: noticeId,
    });

    return response.description;
  }
}

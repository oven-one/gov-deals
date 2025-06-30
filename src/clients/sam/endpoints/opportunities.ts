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
    return this.transformSearchResponse(response);
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
    if (!filters) return {};

    const params: Record<string, any> = {};

    // Basic filters
    if (filters.keywords) params.title = filters.keywords; // API uses 'title' parameter
    if (filters.naicsCodes?.length) params.naicsCode = filters.naicsCodes.join(',');
    if (filters.pscCodes?.length) params.classificationCode = filters.pscCodes.join(',');
    if (filters.types?.length) params.ptype = filters.types.join(','); // API uses 'ptype'
    if (filters.setAsideTypes?.length) params.typeOfSetAside = filters.setAsideTypes.join(',');

    // Date filters
    if (filters.postedFrom) params.postedFrom = filters.postedFrom;
    if (filters.postedTo) params.postedTo = filters.postedTo;
    if (filters.responseDeadlineFrom) params.rdlFrom = filters.responseDeadlineFrom;
    if (filters.responseDeadlineTo) params.rdlTo = filters.responseDeadlineTo;

    // Location filters
    if (filters.placeOfPerformanceStates?.length) params.state = filters.placeOfPerformanceStates.join(',');
    if (filters.placeOfPerformanceZips?.length) params.zip = filters.placeOfPerformanceZips.join(',');

    // Status filter
    if (filters.activeOnly !== undefined) params.active = filters.activeOnly ? 'true' : 'false';

    return params;
  }

  /**
   * Transform API response to our schema
   * Based on actual SAM.gov API structure
   */
  private transformSearchResponse(apiResponse: any): SamOpportunitySearchResponse {
    // Validate the raw response matches expected structure
    const result = SamOpportunitySearchResponseSchema.safeParse(apiResponse);
    if (!result.success) {
      console.error('Validation errors:', JSON.stringify(result.error.errors, null, 2));
      console.error('Sample response data:', JSON.stringify(apiResponse, null, 2).substring(0, 1000));
      throw new ValidationError('Invalid search response from API', result.error);
    }

    return result.data;
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
   * Get opportunity description
   */
  async getDescription(noticeId: string): Promise<string> {
    const response = await this.client.get<{ description: string }>('/opportunities/v1/noticedesc', {
      noticeid: noticeId,
    });

    return response.description;
  }
}

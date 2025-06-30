/**
 * CSV-based Opportunities endpoint
 * Implements the same interface as SAM.gov opportunities endpoint
 */

import { CsvClient } from '../client';
import {
  SamOpportunity,
  SamOpportunitySearchFilters,
  SamOpportunitySearchResponse,
} from '../../../types/opportunities';
import { GovDealsPaginationParams } from '../../../types/common';
import { OpportunitiesDataSource } from '../../types';

export class CsvOpportunitiesEndpoint implements OpportunitiesDataSource {
  constructor(private client: CsvClient) {}

  /**
   * Search for opportunities in CSV data
   */
  async search(
    filters?: SamOpportunitySearchFilters,
    pagination?: GovDealsPaginationParams
  ): Promise<SamOpportunitySearchResponse> {
    return this.client.search(filters, pagination);
  }

  /**
   * Get opportunity by ID from CSV
   */
  async getById(noticeId: string): Promise<SamOpportunity> {
    return this.client.getById(noticeId);
  }

  /**
   * Get opportunity description from CSV
   */
  async getDescription(noticeId: string): Promise<string> {
    return this.client.getDescription(noticeId);
  }

  /**
   * Search for construction opportunities in CSV
   */
  async searchConstruction(
    additionalFilters?: Partial<SamOpportunitySearchFilters>,
    pagination?: GovDealsPaginationParams
  ): Promise<SamOpportunitySearchResponse> {
    return this.client.searchConstruction(additionalFilters, pagination);
  }
}
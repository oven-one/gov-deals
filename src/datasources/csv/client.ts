/**
 * CSV-based data source for opportunities
 * Provides same interface as SAM.gov API but reads from local CSV file
 */

import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import { 
  CsvOpportunityRow, 
  mapCsvToSamOpportunity, 
  filterCsvRow 
} from './field-mapping';
import {
  SamOpportunity,
  SamOpportunitySearchFilters,
  SamOpportunitySearchResponse,
  SamOpportunitySearchResponseSchema,
} from '../../types/opportunities';
import { GovDealsPaginationParams } from '../../types/common';
import { ValidationError } from '../../core/errors';

export interface CsvClientOptions {
  csvPath: string;
  cacheResults?: boolean;
  encoding?: BufferEncoding;
}

/**
 * CSV-based client that mimics SAM.gov API
 */
export class CsvClient {
  private csvPath: string;
  private cache: CsvOpportunityRow[] | null = null;
  private cacheResults: boolean;
  private encoding: BufferEncoding;

  constructor(options: CsvClientOptions) {
    if (!options.csvPath) {
      throw new Error('CSV file path is required');
    }

    this.csvPath = options.csvPath;
    this.cacheResults = options.cacheResults ?? true;
    this.encoding = options.encoding ?? 'utf-8';
  }

  /**
   * Load and parse CSV data
   */
  private async loadData(): Promise<CsvOpportunityRow[]> {
    // Return cached data if available
    if (this.cache && this.cacheResults) {
      return this.cache;
    }

    try {
      // Read CSV file
      const csvContent = await fs.readFile(this.csvPath, this.encoding);
      
      // Parse CSV with proper options
      const records = parse(csvContent, {
        columns: true, // Use first row as column names
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        skip_records_with_error: true, // Skip problematic rows
      }) as CsvOpportunityRow[];

      // Cache if enabled
      if (this.cacheResults) {
        this.cache = records;
      }

      return records;
    } catch (error) {
      throw new Error(`Failed to load CSV file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search opportunities with filtering and pagination
   */
  async search(
    filters?: SamOpportunitySearchFilters,
    pagination?: GovDealsPaginationParams
  ): Promise<SamOpportunitySearchResponse> {
    // Load all data
    const allRecords = await this.loadData();
    
    // Apply filters
    let filteredRecords = allRecords;
    if (filters) {
      filteredRecords = allRecords.filter(row => filterCsvRow(row, filters));
    }

    // Calculate pagination
    const limit = pagination?.limit || 100;
    const page = pagination?.page || 1;
    const offset = (page - 1) * limit;
    
    // Get paginated results
    const paginatedRecords = filteredRecords.slice(offset, offset + limit);
    
    // Transform to SAM format
    const opportunities = paginatedRecords.map(mapCsvToSamOpportunity);

    // Build response
    const response = {
      totalRecords: filteredRecords.length,
      limit,
      offset,
      opportunitiesData: opportunities,
      links: [], // CSV doesn't have links
    };

    // Validate response format
    const result = SamOpportunitySearchResponseSchema.safeParse(response);
    if (!result.success) {
      console.error('CSV mapping validation errors:', result.error.errors);
      // Continue anyway - the data is still useful even if not perfectly typed
    }

    return response;
  }

  /**
   * Get opportunity by ID
   */
  async getById(noticeId: string): Promise<SamOpportunity> {
    const allRecords = await this.loadData();
    const record = allRecords.find(row => row.NoticeId === noticeId);
    
    if (!record) {
      throw new ValidationError(`Opportunity with ID ${noticeId} not found`);
    }

    return mapCsvToSamOpportunity(record);
  }

  /**
   * Get opportunity description (from CSV Description field)
   */
  async getDescription(noticeId: string): Promise<string> {
    const allRecords = await this.loadData();
    const record = allRecords.find(row => row.NoticeId === noticeId);
    
    if (!record) {
      throw new ValidationError(`Opportunity with ID ${noticeId} not found`);
    }

    return record.Description || 'No description available';
  }

  /**
   * Search for construction opportunities
   */
  async searchConstruction(
    additionalFilters?: Partial<SamOpportunitySearchFilters>,
    pagination?: GovDealsPaginationParams
  ): Promise<SamOpportunitySearchResponse> {
    const constructionFilters: SamOpportunitySearchFilters = {
      naicsCodes: ['236', '238'], // Broader match for construction
      keywords: 'renovation construction building modernization',
      ...additionalFilters,
    };

    return this.search(constructionFilters, pagination);
  }

  /**
   * Clear cache if needed
   */
  clearCache(): void {
    this.cache = null;
  }
}
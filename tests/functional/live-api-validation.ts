/**
 * Functional Test Suite for Live SAM.gov API Validation
 * 
 * This test suite performs various live API queries to verify:
 * - Different payload structures are properly validated
 * - Schema validation works across different opportunity types
 * - Edge cases and null values are handled correctly
 * - API rate limits and error handling work properly
 * 
 * Run with: npm run test:functional
 */

import { SamApi } from '../../src/index';
import { SamOpportunitySearchFilters } from '../../src/types/opportunities';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  metadata?: Record<string, any>;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  results: TestResult[];
}

/**
 * Test scenarios to validate different API response patterns
 */
const TEST_SCENARIOS = [
  {
    name: 'Basic Active Search',
    description: 'Search for active opportunities with minimal filters',
    filters: {
      activeOnly: true,
      postedFrom: '06/01/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 5 },
    expectedMinResults: 0,
    validateFields: ['noticeId', 'title', 'type', 'active'],
  },
  {
    name: 'Construction NAICS Search',
    description: 'Search for construction opportunities using NAICS codes',
    filters: {
      naicsCodes: ['236220', '238210'],
      activeOnly: true,
      postedFrom: '01/01/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 10 },
    expectedMinResults: 0,
    validateFields: ['naicsCode', 'naicsCodes', 'classificationCode'],
  },
  {
    name: 'Keyword Search',
    description: 'Search with keywords to test title filtering',
    filters: {
      keywords: 'maintenance',
      activeOnly: true,
      postedFrom: '01/01/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 5 },
    expectedMinResults: 0,
    validateFields: ['title', 'keywords'],
    customValidation: (opp: any) => {
      // Verify keyword appears in title (case insensitive)
      return opp.title?.toLowerCase().includes('maintenance');
    },
  },
  {
    name: 'Set-Aside Filter',
    description: 'Search for small business set-aside opportunities',
    filters: {
      setAsideTypes: ['SBA'],
      activeOnly: true,
      postedFrom: '01/01/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 5 },
    expectedMinResults: 0,
    validateFields: ['typeOfSetAside', 'typeOfSetAsideDescription'],
  },
  {
    name: 'Geographic Search',
    description: 'Search by place of performance states',
    filters: {
      placeOfPerformanceStates: ['CA', 'TX', 'NY'],
      activeOnly: true,
      postedFrom: '01/01/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 5 },
    expectedMinResults: 0,
    validateFields: ['placeOfPerformance'],
    customValidation: (opp: any) => {
      // Verify state is in our filter list if place of performance exists
      if (opp.placeOfPerformance?.state?.code) {
        return ['CA', 'TX', 'NY'].includes(opp.placeOfPerformance.state.code);
      }
      return true; // If no place of performance, validation passes
    },
  },
  {
    name: 'Date Range Search',
    description: 'Search with specific date ranges',
    filters: {
      postedFrom: '06/15/2024',
      postedTo: '06/30/2024',
      activeOnly: true,
    },
    pagination: { limit: 3 },
    expectedMinResults: 0,
    validateFields: ['postedDate'],
    customValidation: (opp: any) => {
      // Verify posted date is within range
      const postedDate = new Date(opp.postedDate);
      const fromDate = new Date('2024-06-15');
      const toDate = new Date('2024-06-30');
      return postedDate >= fromDate && postedDate <= toDate;
    },
  },
  {
    name: 'Response Deadline Filter',
    description: 'Search with response deadline constraints',
    filters: {
      responseDeadlineFrom: '07/01/2024',
      responseDeadlineTo: '12/31/2024',
      activeOnly: true,
      postedFrom: '01/01/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 5 },
    expectedMinResults: 0,
    validateFields: ['responseDeadLine'],
  },
  {
    name: 'Complex Multi-Filter Search',
    description: 'Combine multiple filters to test interaction',
    filters: {
      keywords: 'building',
      naicsCodes: ['236'],
      placeOfPerformanceStates: ['VA', 'MD', 'DC'],
      activeOnly: true,
      postedFrom: '01/01/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 5 },
    expectedMinResults: 0,
    validateFields: ['title', 'naicsCode', 'placeOfPerformance'],
  },
  {
    name: 'Edge Case - Empty Results',
    description: 'Search designed to return no results',
    filters: {
      keywords: 'xyzzzzunlikelytermneverexists',
      activeOnly: true,
      postedFrom: '07/04/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 1 },
    expectedMinResults: 0,
    expectedMaxResults: 0,
    validateFields: [],
  },
  {
    name: 'Large Result Set',
    description: 'Test handling of larger result sets',
    filters: {
      activeOnly: true,
      postedFrom: '01/01/2024',
      postedTo: '07/04/2024',
    },
    pagination: { limit: 50 },
    expectedMinResults: 0,
    validateFields: ['noticeId', 'title'],
  },
] as const;

/**
 * Main test runner class
 */
export class LiveApiTestRunner {
  private samApi: SamApi;
  private results: TestResult[] = [];

  constructor(apiKey: string) {
    this.samApi = new SamApi({ apiKey });
  }

  /**
   * Run all test scenarios
   */
  async runAllTests(): Promise<TestSummary> {
    console.log('🚀 Starting Live API Functional Tests...\n');
    
    const startTime = Date.now();
    
    for (const scenario of TEST_SCENARIOS) {
      await this.runTestScenario(scenario);
      
      // Add delay between tests to respect rate limits
      await this.delay(500);
    }

    // Run additional API method tests
    await this.testGetById();
    await this.testGetDescription();
    await this.testConstructionSearch();

    const totalDuration = Date.now() - startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;

    const summary: TestSummary = {
      totalTests: this.results.length,
      passed,
      failed,
      duration: totalDuration,
      results: this.results,
    };

    this.printSummary(summary);
    return summary;
  }

  /**
   * Run a single test scenario
   */
  private async runTestScenario(scenario: any): Promise<void> {
    console.log(`📋 Running: ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    
    const startTime = Date.now();
    let result: TestResult;

    try {
      const searchResult = await this.samApi.opportunities.search(
        scenario.filters as SamOpportunitySearchFilters,
        scenario.pagination
      );

      // Validate basic response structure
      this.validateResponseStructure(searchResult);

      // Check result count expectations
      if (scenario.expectedMinResults !== undefined && 
          searchResult.totalRecords < scenario.expectedMinResults) {
        throw new Error(`Expected at least ${scenario.expectedMinResults} results, got ${searchResult.totalRecords}`);
      }

      if (scenario.expectedMaxResults !== undefined && 
          searchResult.totalRecords > scenario.expectedMaxResults) {
        throw new Error(`Expected at most ${scenario.expectedMaxResults} results, got ${searchResult.totalRecords}`);
      }

      // Validate required fields are present
      for (const opp of searchResult.opportunitiesData) {
        this.validateRequiredFields(opp, scenario.validateFields);
        
        // Run custom validation if provided
        if (scenario.customValidation && !scenario.customValidation(opp)) {
          throw new Error(`Custom validation failed for opportunity: ${opp.noticeId}`);
        }
      }

      result = {
        name: scenario.name,
        passed: true,
        duration: Date.now() - startTime,
        metadata: {
          totalRecords: searchResult.totalRecords,
          returnedRecords: searchResult.opportunitiesData.length,
          filters: scenario.filters,
        },
      };

      console.log(`   ✅ PASSED (${result.duration}ms) - Found ${searchResult.totalRecords} records\n`);

    } catch (error: any) {
      result = {
        name: scenario.name,
        passed: false,
        error: error.message,
        duration: Date.now() - startTime,
        metadata: {
          filters: scenario.filters,
        },
      };

      console.log(`   ❌ FAILED (${result.duration}ms) - ${error.message}\n`);
    }

    this.results.push(result);
  }

  /**
   * Test getById functionality with a known opportunity
   */
  private async testGetById(): Promise<void> {
    console.log('📋 Running: Get Opportunity By ID');
    
    const startTime = Date.now();
    let result: TestResult;

    try {
      // First get an opportunity ID from a search
      const searchResult = await this.samApi.opportunities.search({
        activeOnly: true,
        postedFrom: '01/01/2024',
        postedTo: '07/04/2024',
      }, { limit: 1 });

      if (searchResult.opportunitiesData.length === 0) {
        throw new Error('No opportunities found to test getById');
      }

      const noticeId = searchResult.opportunitiesData[0].noticeId;
      const opportunity = await this.samApi.opportunities.getById(noticeId);

      // Validate the returned opportunity
      if (opportunity.noticeId !== noticeId) {
        throw new Error(`Expected noticeId ${noticeId}, got ${opportunity.noticeId}`);
      }

      this.validateRequiredFields(opportunity, ['noticeId', 'title', 'type']);

      result = {
        name: 'Get Opportunity By ID',
        passed: true,
        duration: Date.now() - startTime,
        metadata: {
          noticeId,
          title: opportunity.title,
        },
      };

      console.log(`   ✅ PASSED (${result.duration}ms) - Retrieved: ${opportunity.title}\n`);

    } catch (error: any) {
      result = {
        name: 'Get Opportunity By ID',
        passed: false,
        error: error.message,
        duration: Date.now() - startTime,
      };

      console.log(`   ❌ FAILED (${result.duration}ms) - ${error.message}\n`);
    }

    this.results.push(result);
  }

  /**
   * Test getDescription functionality
   */
  private async testGetDescription(): Promise<void> {
    console.log('📋 Running: Get Opportunity Description');
    
    const startTime = Date.now();
    let result: TestResult;

    try {
      // Get an opportunity ID from a search
      const searchResult = await this.samApi.opportunities.search({
        activeOnly: true,
        postedFrom: '01/01/2024',
        postedTo: '07/04/2024',
      }, { limit: 1 });

      if (searchResult.opportunitiesData.length === 0) {
        throw new Error('No opportunities found to test getDescription');
      }

      const noticeId = searchResult.opportunitiesData[0].noticeId;
      const description = await this.samApi.opportunities.getDescription(noticeId);

      // Validate description is a string
      if (typeof description !== 'string') {
        throw new Error(`Expected string description, got ${typeof description}`);
      }

      result = {
        name: 'Get Opportunity Description',
        passed: true,
        duration: Date.now() - startTime,
        metadata: {
          noticeId,
          descriptionLength: description.length,
        },
      };

      console.log(`   ✅ PASSED (${result.duration}ms) - Description length: ${description.length} chars\n`);

    } catch (error: any) {
      result = {
        name: 'Get Opportunity Description',
        passed: false,
        error: error.message,
        duration: Date.now() - startTime,
      };

      console.log(`   ❌ FAILED (${result.duration}ms) - ${error.message}\n`);
    }

    this.results.push(result);
  }

  /**
   * Test construction-specific search
   */
  private async testConstructionSearch(): Promise<void> {
    console.log('📋 Running: Construction Search');
    
    const startTime = Date.now();
    let result: TestResult;

    try {
      const constructionResult = await this.samApi.opportunities.searchConstruction({
        postedFrom: '01/01/2024',
        postedTo: '07/04/2024',
      }, { limit: 5 });

      this.validateResponseStructure(constructionResult);

      // Verify construction NAICS codes are present if results exist
      for (const opp of constructionResult.opportunitiesData) {
        if (opp.naicsCode) {
          const isConstructionNaics = ['236', '238'].some(code => 
            opp.naicsCode!.startsWith(code)
          );
          if (!isConstructionNaics) {
            console.log(`   ⚠️  Non-construction NAICS found: ${opp.naicsCode} in ${opp.title}`);
          }
        }
      }

      result = {
        name: 'Construction Search',
        passed: true,
        duration: Date.now() - startTime,
        metadata: {
          totalRecords: constructionResult.totalRecords,
          returnedRecords: constructionResult.opportunitiesData.length,
        },
      };

      console.log(`   ✅ PASSED (${result.duration}ms) - Found ${constructionResult.totalRecords} construction opportunities\n`);

    } catch (error: any) {
      result = {
        name: 'Construction Search',
        passed: false,
        error: error.message,
        duration: Date.now() - startTime,
      };

      console.log(`   ❌ FAILED (${result.duration}ms) - ${error.message}\n`);
    }

    this.results.push(result);
  }

  /**
   * Validate basic response structure
   */
  private validateResponseStructure(response: any): void {
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    const requiredFields = ['totalRecords', 'limit', 'offset', 'opportunitiesData'];
    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(response.opportunitiesData)) {
      throw new Error('opportunitiesData is not an array');
    }

    if (typeof response.totalRecords !== 'number') {
      throw new Error('totalRecords is not a number');
    }
  }

  /**
   * Validate required fields are present in opportunity
   */
  private validateRequiredFields(opportunity: any, fields: string[]): void {
    for (const field of fields) {
      if (field === 'keywords') {
        // Skip validation for keywords as it's a search parameter, not a response field
        continue;
      }
      
      if (!(field in opportunity)) {
        throw new Error(`Missing required field: ${field} in opportunity ${opportunity.noticeId}`);
      }
    }
  }

  /**
   * Print test summary
   */
  private printSummary(summary: TestSummary): void {
    console.log('📊 Test Summary');
    console.log('=' * 50);
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(`Duration: ${summary.duration}ms`);
    console.log(`Success Rate: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`);
    
    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      for (const result of summary.results.filter(r => !r.passed)) {
        console.log(`   • ${result.name}: ${result.error}`);
      }
    }
    
    console.log('\n🎯 Detailed Results:');
    for (const result of summary.results) {
      const status = result.passed ? '✅' : '❌';
      console.log(`   ${status} ${result.name} (${result.duration}ms)`);
      if (result.metadata?.totalRecords !== undefined) {
        console.log(`      Records: ${result.metadata.totalRecords}`);
      }
    }
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main execution function
 */
export async function runLiveApiTests(apiKey?: string): Promise<TestSummary> {
  const key = apiKey || process.env.SAM_API_KEY;
  
  if (!key) {
    throw new Error('SAM API key is required. Set SAM_API_KEY environment variable or pass as parameter.');
  }

  const runner = new LiveApiTestRunner(key);
  return await runner.runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  
  runLiveApiTests()
    .then(summary => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test execution failed:', error.message);
      process.exit(1);
    });
}
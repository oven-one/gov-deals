/**
 * Basic usage examples for @lineai/gov-deals
 * 
 * This file shows how to use the SAM.gov integration for finding
 * federal construction and renovation opportunities.
 */

import { SamApi } from '@lineai/gov-deals';

async function basicExamples() {
  // Initialize the SAM.gov API client
  // You'll need to get an API key from https://sam.gov
  if (!process.env.SAM_API_KEY) {
    throw new Error('SAM_API_KEY environment variable is required. Get your API key from https://sam.gov');
  }
  
  const samApi = new SamApi({
    apiKey: process.env.SAM_API_KEY,
  });

  try {
    // Example 1: Basic search for active opportunities
    console.log('=== Example 1: Basic Search ===');
    const basicSearch = await samApi.opportunities.search(
      {
        activeOnly: true,
        keywords: 'renovation building',
      },
      { limit: 5 }
    );
    
    console.log(`Found ${basicSearch.totalRecords} total opportunities`);
    console.log(`Showing first ${basicSearch.opportunitiesData.length}:`);
    
    basicSearch.opportunitiesData.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.title}`);
      console.log(`   ID: ${opp.noticeId}`);
      console.log(`   Posted: ${opp.postedDate}`);
      console.log(`   Agency: ${opp.fullParentPathName || 'N/A'}`);
      console.log(`   Type: ${opp.type}`);
      console.log('');
    });

    // Example 2: Construction-specific search
    console.log('\n=== Example 2: Construction Search ===');
    const constructionSearch = await samApi.opportunities.searchConstruction(
      {
        setAsideTypes: ['SBA'], // Small Business set-aside
        postedFrom: '2024-01-01',
      },
      { limit: 3 }
    );
    
    console.log(`Found ${constructionSearch.totalRecords} construction opportunities`);
    
    for (const opp of constructionSearch.opportunitiesData) {
      console.log(`Title: ${opp.title}`);
      console.log(`NAICS: ${opp.naicsCode || 'N/A'}`);
      console.log(`Set-aside: ${opp.typeOfSetAsideDescription || 'None'}`);
      console.log(`Response deadline: ${opp.responseDeadLine || 'N/A'}`);
      console.log('---');
    }

    // Example 3: Get specific opportunity details
    if (constructionSearch.opportunitiesData.length > 0) {
      console.log('\n=== Example 3: Get Opportunity Details ===');
      const firstOpp = constructionSearch.opportunitiesData[0];
      
      // Get the full opportunity details
      const detailedOpp = await samApi.opportunities.getById(firstOpp.noticeId);
      console.log(`Detailed info for: ${detailedOpp.title}`);
      console.log(`Solicitation Number: ${detailedOpp.solicitationNumber || 'N/A'}`);
      console.log(`Classification: ${detailedOpp.classificationCode || 'N/A'}`);
      
      // Get the opportunity description
      try {
        const description = await samApi.opportunities.getDescription(firstOpp.noticeId);
        console.log(`Description (first 200 chars): ${description.substring(0, 200)}...`);
      } catch (error) {
        console.log('Description not available');
      }
    }

    // Example 4: Advanced filtering
    console.log('\n=== Example 4: Advanced Filtering ==='); 
    const advancedSearch = await samApi.opportunities.search({
      naicsCodes: ['236220'], // Commercial building construction
      placeOfPerformanceStates: ['VA', 'MD', 'DC'], // DMV area
      activeOnly: true,
      setAsideTypes: ['SBA', '8AN'], // Small business set-asides
      responseDeadlineFrom: new Date().toISOString().split('T')[0], // From today
    });
    
    console.log(`Found ${advancedSearch.totalRecords} opportunities matching advanced criteria`);
    
    // Show the filtering results
    advancedSearch.opportunitiesData.slice(0, 3).forEach(opp => {
      console.log(`• ${opp.title}`);
      console.log(`  Location: ${opp.placeOfPerformance?.state || opp.officeAddress?.state || 'N/A'}`);
      console.log(`  Set-aside: ${opp.typeOfSetAside || 'None'}`);
    });

  } catch (error: any) {
    console.error('Error:', error.message);
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      console.log('Rate limit reached. Consider upgrading your SAM.gov API account.');
      console.log('See RATE_LIMITS.md for more information.');
    }
  }
}

// Example 5: Working with types
function typeExamples() {
  console.log('\n=== Example 5: Working with Types ===');
  
  // Import types for better development experience
  // import type { SamOpportunity, SamOpportunitySearchFilters } from '../src/types/opportunities';
  
  // Type-safe filter creation
  const filters = {
    keywords: 'courthouse renovation',
    naicsCodes: ['236220', '238210'], // Construction NAICS
    activeOnly: true,
    setAsideTypes: ['SBA'] as const, // Type-safe set-aside
  };
  
  console.log('Filters created with full type safety:', filters);
  
  // The API responses are fully typed, so you get autocomplete
  // and compile-time type checking on all opportunity fields
}

// Run examples if this file is executed directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  basicExamples()
    .then(() => typeExamples())
    .catch(error => {
      console.error('Example failed:', error);
      process.exit(1);
    });
}

export { basicExamples, typeExamples };
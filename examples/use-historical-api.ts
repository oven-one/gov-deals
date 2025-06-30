/**
 * Example: Using the @lineai/gov-deals library with historical data
 * 
 * This shows how to use the same library interface with different data sources:
 * - SAM.gov API (live data)
 * - Supabase (historical data)
 * - CSV files (offline data)
 */

import { SamApi, CsvApi, createSupabaseApi } from '@lineai/gov-deals';

// Example 1: Using SAM.gov API (Live Data)
async function useLiveData() {
  const api = new SamApi({
    apiKey: process.env.SAM_API_KEY!
  });

  console.log('=== Using SAM.gov Live Data ===');
  
  // Search for active construction opportunities
  const results = await api.opportunities.search({
    naicsCodes: ['236220'], // Commercial building construction
    activeOnly: true,
    postedFrom: new Date().toISOString().split('T')[0] // Today
  }, { limit: 5 });
  
  console.log(`Found ${results.totalRecords} active opportunities`);
}

// Example 2: Using Supabase Historical Data
async function useHistoricalData() {
  const api = createSupabaseApi(
    process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'your-anon-key'
  );

  console.log('\n=== Using Supabase Historical Data ===');
  
  // IMPORTANT: Don't use activeOnly: true with historical data!
  const results = await api.opportunities.search({
    naicsCodes: ['236220'],
    keywords: 'renovation',
    postedFrom: '2024-01-01',
    postedTo: '2024-12-31'
  }, { limit: 5 });
  
  console.log(`Found ${results.totalRecords} historical opportunities from 2024`);
  
  // All historical opportunities have active: "No"
  results.opportunitiesData.forEach(opp => {
    console.log(`- ${opp.title?.substring(0, 50)}... (Active: ${opp.active})`);
  });
}

// Example 3: Using CSV File (Offline)
async function useOfflineData() {
  const api = new CsvApi({
    csvPath: './data/opportunities.csv'
  });

  console.log('\n=== Using CSV Offline Data ===');
  
  const results = await api.opportunities.search({
    keywords: 'courthouse',
    naicsCodes: ['236220']
  }, { limit: 5 });
  
  console.log(`Found ${results.totalRecords} opportunities in CSV`);
}

// Example 4: Dynamic Data Source Selection
function createApi() {
  const dataSource = process.env.DATA_SOURCE || 'sam';
  
  switch (dataSource) {
    case 'supabase':
      console.log('Using Supabase historical data...');
      return createSupabaseApi(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
    case 'csv':
      console.log('Using CSV offline data...');
      return new CsvApi({
        csvPath: process.env.CSV_PATH || './data/opportunities.csv'
      });
      
    case 'sam':
    default:
      console.log('Using SAM.gov live data...');
      return new SamApi({
        apiKey: process.env.SAM_API_KEY!
      });
  }
}

// Example 5: Common Interface Across All Data Sources
async function searchAnyDataSource() {
  const api = createApi();
  
  try {
    // Same interface works for all data sources!
    const results = await api.opportunities.search({
      naicsCodes: ['236220', '238210'], // Construction NAICS codes
      keywords: 'renovation',
      placeOfPerformanceStates: ['CA', 'TX', 'NY']
    }, { 
      limit: 10,
      page: 1 
    });
    
    console.log(`\nFound ${results.totalRecords} opportunities`);
    console.log(`Showing ${results.opportunitiesData.length} results from page 1`);
    
    // Display results
    results.opportunitiesData.forEach((opp, i) => {
      console.log(`\n${i + 1}. ${opp.title}`);
      console.log(`   Notice ID: ${opp.noticeId}`);
      console.log(`   Type: ${opp.type}`);
      console.log(`   Posted: ${opp.postedDate}`);
      console.log(`   Active: ${opp.active}`);
      console.log(`   Location: ${opp.placeOfPerformance?.state || 'N/A'}`);
    });
    
    // Get full description (if supported by data source)
    if (results.opportunitiesData.length > 0) {
      try {
        const description = await api.opportunities.getDescription(
          results.opportunitiesData[0].noticeId
        );
        console.log('\nFirst opportunity description:');
        console.log(description.description.substring(0, 200) + '...');
      } catch (error) {
        console.log('\nDescription not available for this data source');
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  
  async function runExamples() {
    // Choose which example to run based on available credentials
    if (process.env.SAM_API_KEY) {
      await useLiveData();
    }
    
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      await useHistoricalData();
    }
    
    if (process.env.CSV_PATH || require('fs').existsSync('./data/opportunities.csv')) {
      await useOfflineData();
    }
    
    // Always run the dynamic example
    await searchAnyDataSource();
  }
  
  runExamples().catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
  });
}

export { useLiveData, useHistoricalData, useOfflineData, createApi, searchAnyDataSource };
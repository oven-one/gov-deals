/**
 * Example: Analyzing historical opportunities data
 * 
 * This example shows how to use the historical data for market research
 * and trend analysis using the Supabase integration.
 */

import { createSupabaseApi } from '@lineai/gov-deals';
import { getConstructionNAICSCodes } from '@lineai/gov-deals';

async function analyzeHistoricalData() {
  // Initialize Supabase API
  const api = createSupabaseApi(
    process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'your-anon-key'
  );

  console.log('🔍 HISTORICAL DATA ANALYSIS\n');

  try {
    // 1. Analyze opportunities by year
    console.log('1️⃣ Opportunities by Year:');
    const years = ['2023', '2024'];
    for (const year of years) {
      const yearResults = await api.opportunities.search({
        postedFrom: `${year}-01-01`,
        postedTo: `${year}-12-31`
      }, { limit: 1 });
      console.log(`   ${year}: ${yearResults.totalRecords} opportunities`);
    }

    // 2. Top agencies for construction
    console.log('\n2️⃣ Analyzing Construction Opportunities by Agency:');
    const constructionOpps = await api.opportunities.search({
      naicsCodes: getConstructionNAICSCodes(),
      postedFrom: '2024-01-01',
      postedTo: '2024-12-31'
    }, { limit: 100 });

    const agencyCount: Record<string, number> = {};
    constructionOpps.opportunitiesData.forEach(opp => {
      const agency = opp.fullParentPathName || 'Unknown';
      agencyCount[agency] = (agencyCount[agency] || 0) + 1;
    });

    const topAgencies = Object.entries(agencyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    console.log('   Top 5 agencies:');
    topAgencies.forEach(([agency, count]) => {
      console.log(`   - ${agency}: ${count} opportunities`);
    });

    // 3. Geographic distribution
    console.log('\n3️⃣ Geographic Distribution (Top States):');
    const stateCount: Record<string, number> = {};
    
    // Get more data for better analysis
    const geoResults = await api.opportunities.search({
      naicsCodes: ['236220'], // Commercial construction
      postedFrom: '2024-01-01'
    }, { limit: 500 });

    geoResults.opportunitiesData.forEach(opp => {
      const state = opp.placeOfPerformance?.state || 'Unknown';
      stateCount[state] = (stateCount[state] || 0) + 1;
    });

    const topStates = Object.entries(stateCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    topStates.forEach(([state, count]) => {
      console.log(`   ${state}: ${count} opportunities`);
    });

    // 4. Set-aside analysis
    console.log('\n4️⃣ Set-Aside Distribution:');
    const setAsideTypes = ['SBA', 'WOSB', 'HZC', '8A', 'SDVOSBC'];
    
    for (const setAside of setAsideTypes) {
      const results = await api.opportunities.search({
        setAsideTypes: [setAside],
        naicsCodes: getConstructionNAICSCodes(),
        postedFrom: '2024-01-01'
      }, { limit: 1 });
      console.log(`   ${setAside}: ${results.totalRecords} opportunities`);
    }

    // 5. Keyword trends
    console.log('\n5️⃣ Popular Keywords in Construction:');
    const keywords = ['renovation', 'modernization', 'repair', 'construction', 'upgrade'];
    
    for (const keyword of keywords) {
      const results = await api.opportunities.search({
        keywords: keyword,
        naicsCodes: getConstructionNAICSCodes(),
        postedFrom: '2024-01-01'
      }, { limit: 1 });
      console.log(`   "${keyword}": ${results.totalRecords} opportunities`);
    }

    // 6. Average opportunity characteristics
    console.log('\n6️⃣ Opportunity Types Distribution:');
    const types = ['o', 's', 'p', 'k', 'r'];
    const typeNames: Record<string, string> = {
      'o': 'Solicitation',
      's': 'Special Notice',
      'p': 'Presolicitation',
      'k': 'Combined Synopsis',
      'r': 'Sources Sought'
    };

    for (const type of types) {
      const results = await api.opportunities.search({
        types: [type as any],
        naicsCodes: getConstructionNAICSCodes(),
        postedFrom: '2024-01-01'
      }, { limit: 1 });
      console.log(`   ${typeNames[type]}: ${results.totalRecords} opportunities`);
    }

    // 7. Sample opportunities for reference
    console.log('\n7️⃣ Recent Construction Opportunities Sample:');
    const recentOpps = await api.opportunities.search({
      naicsCodes: ['236220'],
      keywords: 'renovation',
      postedFrom: '2024-06-01'
    }, { limit: 3 });

    recentOpps.opportunitiesData.forEach((opp, i) => {
      console.log(`\n   ${i + 1}. ${opp.title}`);
      console.log(`      Agency: ${opp.fullParentPathName}`);
      console.log(`      Location: ${opp.placeOfPerformance?.city}, ${opp.placeOfPerformance?.state}`);
      console.log(`      Posted: ${opp.postedDate}`);
      console.log(`      Type: ${opp.type}`);
      console.log(`      Set-Aside: ${opp.typeOfSetAsideDescription || 'None'}`);
    });

    console.log('\n✅ Analysis complete!');
    console.log('\n💡 Insights:');
    console.log('- Historical data is valuable for understanding agency patterns');
    console.log('- Geographic distribution helps target business development');
    console.log('- Set-aside analysis shows small business opportunities');
    console.log('- Keyword trends indicate common project types');

  } catch (error: any) {
    console.error('❌ Analysis failed:', error.message);
    if (error.message.includes('your-project.supabase.co')) {
      console.error('\nPlease set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  require('dotenv').config();
  
  analyzeHistoricalData().catch(error => {
    console.error('Failed to run analysis:', error);
    process.exit(1);
  });
}

export { analyzeHistoricalData };
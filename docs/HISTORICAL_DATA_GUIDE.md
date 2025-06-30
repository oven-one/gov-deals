# Historical Data Guide

This guide provides insights into using the historical opportunities data available through the Supabase integration.

## Overview

The historical dataset contains 71,969+ federal contract opportunities spanning from 2018 to 2025. This data is valuable for:

- Market research and trend analysis
- Understanding seasonal patterns in government contracting
- Analyzing agency spending patterns
- Preparing competitive proposals based on past opportunities
- Training and testing applications without API keys

## Key Characteristics

### All Records are Inactive

**Important**: Every record in the historical database has `active: "No"` status. This is because these are past opportunities that have already closed.

```typescript
// ❌ This will return 0 results
const results = await api.opportunities.search({
  activeOnly: true  // Don't use this with historical data!
});

// ✅ This will work
const results = await api.opportunities.search({
  keywords: 'construction'
  // activeOnly omitted or set to false
});
```

### Data Quality Notes

1. **Nullable Fields**: Many fields that are required in live SAM.gov data may be null in historical records:
   - `responseDeadLine`
   - `solicitationNumber`
   - `naicsCode`
   - `classificationCode`

2. **International Locations**: Some opportunities include international locations with non-standard state codes (e.g., "KR-11" for South Korea).

3. **Set-Aside Variations**: The database contains 20 unique set-aside descriptions that map to standard SAM.gov codes.

## Useful Queries for Historical Analysis

### Finding Opportunities by Time Period

```typescript
// Q1 2024 opportunities
const q1_2024 = await api.opportunities.search({
  postedFrom: '2024-01-01',
  postedTo: '2024-03-31'
}, { limit: 100 });

// Year-over-year comparison
const year2023 = await api.opportunities.search({
  postedFrom: '2023-01-01',
  postedTo: '2023-12-31',
  naicsCodes: ['236220'] // Commercial construction
});

const year2024 = await api.opportunities.search({
  postedFrom: '2024-01-01',
  postedTo: '2024-12-31',
  naicsCodes: ['236220']
});
```

### Agency Analysis

```typescript
// Find all opportunities from a specific agency
const results = await api.opportunities.search({
  keywords: 'Department of Defense'
}, { limit: 100 });

// Then analyze the results
const agencyStats = results.opportunitiesData.reduce((acc, opp) => {
  const agency = opp.fullParentPathName || 'Unknown';
  acc[agency] = (acc[agency] || 0) + 1;
  return acc;
}, {});
```

### Geographic Distribution

```typescript
// Opportunities by state
const states = ['CA', 'TX', 'NY', 'FL', 'IL'];
const stateResults = await Promise.all(
  states.map(state => 
    api.opportunities.search({
      placeOfPerformanceStates: [state]
    }, { limit: 1 }) // Just get count
  )
);

const stateDistribution = states.map((state, i) => ({
  state,
  count: stateResults[i].totalRecords
}));
```

### Set-Aside Analysis

```typescript
// Compare small business set-asides
const setAsideTypes = ['SBA', 'WOSB', 'HZC', '8A', 'SDVOSBC'];
const setAsideResults = await Promise.all(
  setAsideTypes.map(type =>
    api.opportunities.search({
      setAsideTypes: [type]
    }, { limit: 1 })
  )
);

const setAsideStats = setAsideTypes.map((type, i) => ({
  type,
  count: setAsideResults[i].totalRecords
}));
```

## Common Patterns in Historical Data

### Seasonal Trends
- **Q4 (Oct-Dec)**: Typically sees increased activity as agencies use year-end budgets
- **Q1 (Jan-Mar)**: Often slower, with new fiscal year planning
- **Summer months**: May see reduced activity due to vacation schedules

### Popular NAICS Codes
Based on the historical data, common NAICS codes include:
- Construction and renovation services
- IT and professional services
- Facilities maintenance
- Architecture and engineering

### Typical Opportunity Types
- **Special Notice** (s): Announcements and pre-solicitation notices
- **Solicitation** (o): Active requests for proposals
- **Award Notice** (a): Completed contract awards
- **Sources Sought** (r): Market research notices

## Best Practices

1. **Use Date Ranges**: Since all data is historical, always use date ranges to narrow your search to relevant time periods.

2. **Analyze Patterns**: Look for patterns in successful opportunities to inform future proposals.

3. **Test Your Applications**: Use this data to test search functionality, filtering, and data processing without consuming API credits.

4. **Cache Results**: Since historical data doesn't change, consider caching results for frequently-used queries.

5. **Combine with Live Data**: Use historical data for analysis and SAM.gov API for current opportunities.

## Example: Market Research Script

```typescript
import { createSupabaseApi } from '@lineai/gov-deals';
import { getConstructionNAICSCodes } from '@lineai/gov-deals';

async function analyzeConstructionMarket() {
  const api = createSupabaseApi(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  // Get all construction opportunities from last year
  const results = await api.opportunities.search({
    naicsCodes: getConstructionNAICSCodes(),
    postedFrom: '2024-01-01',
    postedTo: '2024-12-31'
  }, { limit: 1000 });

  // Analyze by agency
  const byAgency = results.opportunitiesData.reduce((acc, opp) => {
    const agency = opp.fullParentPathName || 'Unknown';
    acc[agency] = (acc[agency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Analyze by state
  const byState = results.opportunitiesData.reduce((acc, opp) => {
    const state = opp.placeOfPerformance?.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Analyze by set-aside
  const bySetAside = results.opportunitiesData.reduce((acc, opp) => {
    const setAside = opp.typeOfSetAsideDescription || 'None';
    acc[setAside] = (acc[setAside] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Construction Opportunities Analysis (2024)');
  console.log('Total Opportunities:', results.totalRecords);
  console.log('\nTop Agencies:', Object.entries(byAgency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10));
  console.log('\nTop States:', Object.entries(byState)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10));
  console.log('\nSet-Aside Distribution:', bySetAside);
}
```

## Limitations

1. **No Real-Time Updates**: This is a static dataset that won't receive new opportunities.
2. **Incomplete Records**: Some historical records may have missing fields.
3. **No Active Opportunities**: All opportunities are closed/inactive.
4. **Limited to Dataset Range**: Only includes opportunities from the specific CSV import.

## Next Steps

- Use the historical data for research and analysis
- Test your application thoroughly with various search scenarios
- When ready for production, switch to the SAM.gov API for live data
- Consider implementing a hybrid approach using both data sources
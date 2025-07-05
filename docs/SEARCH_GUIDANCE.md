# Search Guidance System

The @lineai/gov-deals library includes an intelligent search guidance system that provides contextual tips to help users and AI assistants optimize their searches for better results.

## Overview

When performing searches, the library automatically analyzes your search parameters and results to provide helpful tips in the `searchTips` field of the response:

```typescript
const results = await api.opportunities.search({
  keywords: 'construction repair',
  naicsCodes: ['999999']
});

console.log(results.searchTips);
// [
//   "Multiple keywords use AND logic - try single keywords for broader results",
//   "No results for specified codes - try broader classification codes or remove code filters"
// ]
```

## Guidance Categories

### 1. Keyword Search Guidance

**Multiple Keywords**
- **Trigger**: Space-separated keywords without quotes
- **Example**: `"construction repair"`
- **Tip**: `"Multiple keywords use AND logic - try single keywords for broader results"`
- **Explanation**: SAM.gov searches require ALL keywords to be present in the title

**State Names in Keywords**
- **Trigger**: State names or codes in keyword search with zero results
- **Example**: `"Texas construction"` (0 results)
- **Tip**: `"Keywords search titles only - use state filter for location-based searches"`
- **Explanation**: Geographic terms work better as filters than keywords

**Invalid Operators**
- **Trigger**: OR, AND, or | operators in keywords
- **Example**: `"construction OR repair"`
- **Tip**: `"Operators like OR/AND/| do not work - use simple keywords instead"`
- **Explanation**: SAM.gov doesn't support Boolean operators

### 2. Classification Code Guidance

**NAICS/PSC Codes**
- **Trigger**: Zero results with classification codes
- **Example**: `naicsCodes: ['999999']`
- **Tip**: `"No results for specified codes - try broader classification codes or remove code filters"`
- **Explanation**: Code may not exist or have no opportunities in date range

### 3. Set-Aside Type Guidance

**Rare Set-Asides**
- **Trigger**: HUBZone (HZC) with few results
- **Example**: `setAsideTypes: ['HZC']` (1 result)
- **Tip**: `"HUBZone set-asides are rare - consider 'SBA' or 'SDVOSBC' for more opportunities"`
- **Explanation**: Some set-asides are much less common

**Zero Results Set-Asides**
- **Trigger**: No results for specified set-aside types
- **Tip**: `"No results for specified set-aside types - try 'SBA' for most opportunities or remove set-aside filter"`

### 4. Geographic Filter Guidance

**State Filter Issues**
- **Trigger**: Zero results with state filter
- **Tip**: `"No results for specified states - some opportunities may have incomplete location data"`
- **Explanation**: Data quality varies for geographic information

**Zip Code Guidance**
- **Trigger**: Zero results with zip codes
- **Tip**: `"No results for specified zip codes - try using state filter instead as zip data is limited"`
- **High Volume**: `"High zip code results may include surrounding areas - consider adding other filters"`

### 5. Opportunity Type Guidance

**Special Notice Warning**
- **Trigger**: Special Notice type ('s') selected
- **Tip**: `"Special Notice type may have data quality issues - consider using other opportunity types"`
- **Explanation**: Special Notice has known email validation issues

**Zero Results Types**
- **Trigger**: No results for specified types
- **Tip**: `"No results for specified opportunity types - try 'a' (Award Notice) for most opportunities"`

**Low Volume Types**
- **Trigger**: < 10 results with uncommon types
- **Tip**: `"For more opportunities, try 'a' (Award Notice), 'p' (Presolicitation), or 'r' (Sources Sought)"`

### 6. Date Range Optimization

**Large Date Ranges**
- **Trigger**: > 180 days with > 500 results
- **Tip**: `"Large date range returned many results - consider narrowing the date range or adding filters"`

**Short Date Ranges**
- **Trigger**: < 7 days with 0 results
- **Tip**: `"Short date range may be too restrictive - try expanding to 30+ days"`

### 7. Filter Combination Suggestions

**Too Many Results**
- **Trigger**: > 200 results with only one filter type
- **Tip**: `"Many results found - consider adding NAICS codes, set-aside types, or keywords to narrow search"`

**Optimization Suggestions**
- **Trigger**: Good results (1-50) with classification codes but no keywords
- **Tip**: `"Good results with classification codes - try adding keywords for more specific matching"`

## AI Assistant Integration

The guidance system is designed specifically for AI assistants:

### Lightweight Format
- Simple string array - no complex objects
- Direct actionable messages
- No severity levels or categories

### Contextual Intelligence
- Tips generated based on actual search behavior
- Considers filter combinations and result counts
- Provides specific parameter suggestions

### Example AI Usage

```typescript
async function searchWithGuidance(userQuery: string) {
  const results = await api.opportunities.search(parseQuery(userQuery));
  
  let response = `Found ${results.totalRecords} opportunities.`;
  
  if (results.searchTips && results.searchTips.length > 0) {
    response += '\n\nSuggestions to improve your search:\n';
    results.searchTips.forEach((tip, i) => {
      response += `${i + 1}. ${tip}\n`;
    });
  }
  
  return response;
}
```

## Verified Filter Behaviors

All guidance is based on comprehensive testing of the SAM.gov API:

### ✅ Verified Working Filters
- **Keywords**: Case-insensitive, title search only, AND logic
- **NAICS Codes**: 100% accuracy with parameter `ncode`
- **PSC Codes**: 100% accuracy with parameter `ccode`
- **Set-Aside Types**: All types working correctly
- **Geographic**: State and zip filters functional
- **Dates**: Posted date ranges working perfectly
- **Types**: 6/7 opportunity types working

### 🔧 Known Issues Handled
- Special Notice type has email validation issues (guided away from)
- Zip code data is limited (suggests state filter alternative)
- Multiple keywords are restrictive (suggests single keywords)
- Boolean operators don't work (warns users)

## Implementation Notes

The guidance system:
- Runs automatically with every search
- Adds minimal overhead (inline processing)
- Only appears when relevant (no spam)
- Uses verified behavioral data from extensive testing
- Designed for both human users and AI systems

This makes the library particularly powerful for AI assistants that need to help users navigate the complexities of government contract searching.
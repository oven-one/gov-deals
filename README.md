# @lineai/gov-deals

A TypeScript library for exploring federal contracts and opportunities for government building renovations, including city halls, courthouses, libraries, federal buildings, and base housing upgrades.

## Features

- 🔍 **Search Opportunities**: Find government contracts by keywords, NAICS codes, location, and more
- 🏗️ **Construction-Focused**: Built-in helpers for construction industry NAICS codes
- 📄 **Detailed Information**: Get full opportunity descriptions and metadata
- 🔄 **Type-Safe**: Full TypeScript support with runtime validation using Zod
- ⚡ **Efficient**: Pagination and filtering to handle large result sets
- 🛠️ **Multiple Data Sources**: 
  - **SAM.gov API**: Live federal opportunities (requires API key)
  - **CSV Files**: Local data for offline development
  - **Supabase**: Historical opportunities database (no API key required)
- 📊 **Historical Analysis**: Access 70,000+ historical opportunities for research

## Installation

```bash
npm install @lineai/gov-deals
```

## Quick Start

### Using SAM.gov API (Live Data)

```typescript
import { SamApi } from '@lineai/gov-deals';

// Initialize with your SAM.gov API key
const api = new SamApi({ 
  apiKey: process.env.SAM_API_KEY 
});

// Search for construction opportunities
const results = await api.opportunities.searchConstruction({
  keywords: 'renovation'
}, { 
  limit: 25 
});

// Get specific opportunity details
const opportunity = await api.opportunities.getById('notice-id');
const description = await api.opportunities.getDescription('notice-id');
```

### Using Supabase (Historical Data - No API Key Required)

```typescript
import { createSupabaseApi } from '@lineai/gov-deals';

// Initialize with Supabase credentials
const api = createSupabaseApi(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Same interface as SamApi
const results = await api.opportunities.search({
  naicsCodes: ['236220'], // Commercial construction
  placeOfPerformanceStates: ['CA', 'TX'],
  postedFrom: '2025-01-01'
}, { 
  limit: 50 
});
```

**Important Note**: All historical records in the Supabase database have `active: "No"` status as they represent past opportunities. When searching historical data:
- Don't use `activeOnly: true` as it will return zero results
- Use date ranges to find opportunities from specific time periods
- All opportunities are inactive but contain valuable historical information

### Using CSV Files (Offline Development)

```typescript
import { CsvApi } from '@lineai/gov-deals';

// Initialize with CSV file path
const api = new CsvApi({ 
  csvPath: './data/opportunities.csv' 
});

// Same interface for searching
const results = await api.opportunities.search({
  keywords: 'courthouse'
});
```

## Search Filters

All data sources support the same search filters:

```typescript
interface SearchFilters {
  // Text search
  keywords?: string;                    // Search in titles
  
  // Classification
  naicsCodes?: string[];               // NAICS industry codes
  pscCodes?: string[];                 // Product/Service codes
  
  // Opportunity types
  types?: OpportunityType[];           // 'o' = Solicitation, 's' = Special Notice, etc.
  
  // Set-asides
  setAsideTypes?: SetAsideType[];      // 'SBA', 'WOSB', 'HZC', etc.
  
  // Location
  placeOfPerformanceStates?: string[]; // State codes: ['CA', 'TX']
  placeOfPerformanceZips?: string[];   // ZIP codes
  
  // Dates
  postedFrom?: string;                 // YYYY-MM-DD
  postedTo?: string;                   // YYYY-MM-DD
  responseDeadlineFrom?: string;       // YYYY-MM-DD
  responseDeadlineTo?: string;         // YYYY-MM-DD
  
  // Status
  activeOnly?: boolean;                // Filter active opportunities
}
```

## Construction Industry Focus

The library includes built-in support for construction-related NAICS codes:

```typescript
import { CONSTRUCTION_NAICS_CODES, getConstructionNAICSCodes } from '@lineai/gov-deals';

// Pre-configured construction search
const results = await api.opportunities.searchConstruction();

// Get all construction NAICS codes
const naicsCodes = getConstructionNAICSCodes();
// Returns: ['236220', '236210', '238210', ...]

// Check if a NAICS code is construction-related
const isConstruction = isConstructionNAICS('236220'); // true
```

### Included Construction NAICS Codes

- **236220**: Commercial and Institutional Building Construction
- **236210**: Industrial Building Construction
- **236118**: Residential Remodeling
- **238210**: Electrical Contractors
- **238220**: Plumbing, Heating, and Air-Conditioning
- **238310**: Drywall and Insulation
- **238320**: Painting and Wall Covering
- **238910**: Site Preparation
- **238160**: Roofing Contractors
- **238110**: Poured Concrete Foundation

## Opportunity Types

Use these codes for the `types` filter:

| Code | Description |
|------|-------------|
| `o` | Solicitation |
| `p` | Presolicitation |
| `a` | Award Notice |
| `s` | Special Notice |
| `k` | Combined Synopsis/Solicitation |
| `u` | Justification |
| `r` | Sources Sought |
| `g` | Sale of Surplus Property |
| `i` | Intent to Bundle Requirements |

## Set-Aside Types

Common set-aside codes for the `setAsideTypes` filter:

| Code | Description |
|------|-------------|
| `SBA` | Total Small Business |
| `WOSB` | Women-Owned Small Business |
| `EDWOSB` | Economically Disadvantaged WOSB |
| `HZC` | HUBZone Competitive |
| `HZS` | HUBZone Sole Source |
| `SDVOSBC` | Service-Disabled Veteran-Owned (Competitive) |
| `SDVOSBS` | Service-Disabled Veteran-Owned (Sole Source) |
| `8A` | 8(a) Sole Source |
| `8AN` | 8(a) Set-Aside |
| `VSA` | Veteran-Owned (VA specific) |

## Examples

### Find Recent Construction Opportunities in Multiple States

```typescript
const results = await api.opportunities.search({
  naicsCodes: ['236220', '238210'],
  placeOfPerformanceStates: ['CA', 'TX', 'FL'],
  postedFrom: '2025-01-01',
  types: ['o', 'k'], // Solicitations and Combined Synopsis
  setAsideTypes: ['SBA', 'WOSB']
}, {
  limit: 100,
  page: 1
});

console.log(`Found ${results.totalRecords} opportunities`);
results.opportunitiesData.forEach(opp => {
  console.log(`${opp.title} - ${opp.naicsCode} - ${opp.placeOfPerformance?.state}`);
});
```

### Search by Keywords and Location

```typescript
const results = await api.opportunities.search({
  keywords: 'courthouse renovation',
  placeOfPerformanceStates: ['NY'],
  responseDeadlineFrom: '2025-07-01'
});
```

### Get Full Opportunity Details

```typescript
// Get basic opportunity data
const opportunity = await api.opportunities.getById('abc123');

// Get full description (often contains detailed requirements)
const description = await api.opportunities.getDescription('abc123');
```

## Data Sources Comparison

| Feature | SAM.gov API | Supabase | CSV |
|---------|-------------|----------|-----|
| Real-time data | ✅ | ❌ | ❌ |
| Historical data | ❌ | ✅ (71,969+ records) | ✅ |
| API key required | ✅ | ❌ | ❌ |
| Internet required | ✅ | ✅ | ❌ |
| Search performance | Good | Excellent | Good |
| Data completeness | Full | Full | Depends on CSV |
| Active opportunities | ✅ | ❌ (all inactive) | Depends on CSV |
| Date range | Current | 2018-2025 | Depends on CSV |

## Environment Variables

```bash
# For SAM.gov API
SAM_API_KEY=your-sam-gov-api-key

# For Supabase (optional - can pass directly to function)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Error Handling

The library throws typed errors for better error handling:

```typescript
import { ApiError, AuthenticationError, ValidationError } from '@lineai/gov-deals';

try {
  const results = await api.opportunities.search({ /* ... */ });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof ValidationError) {
    console.error('Invalid search parameters:', error.message);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.status, error.message);
  }
}
```

## TypeScript Support

Full TypeScript support with strict typing:

```typescript
import type { 
  SamOpportunity,
  SamOpportunitySearchFilters,
  OpportunityType,
  SetAsideType 
} from '@lineai/gov-deals';

// All responses and parameters are fully typed
const filters: SamOpportunitySearchFilters = {
  naicsCodes: ['236220'],
  types: ['o'] as OpportunityType[],
  activeOnly: true
};
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT

## Additional Documentation

- [API Comparison Guide](./docs/API_COMPARISON.md) - Detailed comparison of SAM.gov, Supabase, and CSV data sources
- [Supabase Integration Guide](./docs/SUPABASE_INTEGRATION.md) - Guide for using the Supabase historical data API
- [Historical Data Guide](./docs/HISTORICAL_DATA_GUIDE.md) - Working with historical opportunities data
- [Implementation Guide](./docs/IMPLEMENTATION_GUIDE.md) - Technical implementation details

## Resources

- [SAM.gov API Documentation](https://open.gsa.gov/api/get-opportunities-public-api/)
- [NAICS Code Lookup](https://www.census.gov/naics/)
- [Federal Acquisition Regulation (FAR)](https://www.acquisition.gov/far/)
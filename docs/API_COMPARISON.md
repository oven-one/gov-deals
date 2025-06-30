# API Comparison Guide

This guide compares the three data sources available in the @lineai/gov-deals library: SAM.gov API, Supabase, and CSV files.

## Quick Comparison Table

| Feature | SAM.gov API | Supabase | CSV |
|---------|-------------|----------|-----|
| **Data Type** | Live/Real-time | Historical | Static |
| **API Key Required** | Yes | No* | No |
| **Internet Required** | Yes | Yes | No |
| **Data Volume** | Unlimited | 71,969+ records | Depends on file |
| **Active Opportunities** | Yes | No (all inactive) | Depends on file |
| **Search Performance** | Good (rate limited) | Excellent | Good (in-memory) |
| **Cost** | Free (with registration) | Free tier available | Free |
| **Updates** | Real-time | Static dataset | Manual updates |

*Supabase requires an anon key, but it's publicly shareable unlike SAM.gov API keys.

## SAM.gov API

### When to Use
- Production applications needing current opportunities
- Automated monitoring of new opportunities
- Real-time searches with active solicitations
- Official government contract submissions

### Pros
- Always up-to-date
- Official government source
- Complete opportunity details
- Active opportunities available

### Cons
- Requires API key registration
- Rate limits apply
- Internet connection required
- Can't access historical data

### Example
```typescript
import { SamApi } from '@lineai/gov-deals';

const api = new SamApi({ 
  apiKey: process.env.SAM_API_KEY // Required
});

const results = await api.opportunities.search({
  keywords: 'renovation',
  activeOnly: true // Makes sense here
});
```

## Supabase (Historical Data)

### When to Use
- Development and testing without API keys
- Historical analysis and research
- Market trend analysis
- Training and demos
- High-performance searches

### Pros
- No API key required for access
- Fast PostgreSQL queries
- Good for analysis
- 71,969+ historical records
- Same interface as SAM.gov

### Cons
- All data is inactive (historical)
- No real-time updates
- Internet connection required
- Limited to imported dataset

### Example
```typescript
import { createSupabaseApi } from '@lineai/gov-deals';

const api = createSupabaseApi(
  'https://your-project.supabase.co',
  'your-anon-key' // Public key, shareable
);

const results = await api.opportunities.search({
  keywords: 'courthouse',
  postedFrom: '2024-01-01',
  // Don't use activeOnly: true here!
});
```

## CSV Files

### When to Use
- Offline development
- Environments without internet
- Custom datasets
- Rapid prototyping
- Testing specific scenarios

### Pros
- Works offline
- No API keys needed
- Full control over data
- Can use custom datasets
- Instant searches (in-memory)

### Cons
- Manual updates required
- Memory usage for large files
- Limited by file size
- No automatic updates

### Example
```typescript
import { CsvApi } from '@lineai/gov-deals';

const api = new CsvApi({ 
  csvPath: './data/opportunities.csv'
});

const results = await api.opportunities.search({
  naicsCodes: ['236220']
});
```

## Implementation Differences

### Authentication

**SAM.gov**: Query parameter
```
GET /api/opportunities/v2/search?api_key=YOUR_KEY
```

**Supabase**: Header-based
```
Headers:
  apikey: your-anon-key
  Authorization: Bearer your-anon-key
```

**CSV**: None required

### Data Freshness

- **SAM.gov**: Real-time, updated continuously
- **Supabase**: Static snapshot (historical data from CSV import)
- **CSV**: As fresh as your last download/update

### Performance Characteristics

**SAM.gov**
- Network latency: 200-500ms typical
- Rate limits: Check current limits
- Pagination: Server-side

**Supabase**
- Network latency: 50-200ms typical  
- No rate limits on anon key
- Pagination: Database-optimized

**CSV**
- Search time: 10-100ms (in-memory)
- No rate limits
- Pagination: Client-side

## Switching Between APIs

The library makes it easy to switch between data sources:

```typescript
// Development with Supabase
let api = createSupabaseApi(SUPABASE_URL, SUPABASE_KEY);

// Testing with CSV
api = new CsvApi({ csvPath: './test-data.csv' });

// Production with SAM.gov
api = new SamApi({ apiKey: process.env.SAM_API_KEY });

// Same interface for all!
const results = await api.opportunities.search({
  keywords: 'renovation',
  naicsCodes: ['236220']
});
```

## Best Practices by Use Case

### Development Environment
```typescript
// Use Supabase for development - no API key hassles
const api = process.env.NODE_ENV === 'development' 
  ? createSupabaseApi(SUPABASE_URL, SUPABASE_KEY)
  : new SamApi({ apiKey: process.env.SAM_API_KEY });
```

### Testing
```typescript
// Use CSV for unit tests - predictable data
const api = new CsvApi({ 
  csvPath: './tests/fixtures/test-opportunities.csv' 
});
```

### Analysis & Research
```typescript
// Use Supabase for historical analysis
const api = createSupabaseApi(SUPABASE_URL, SUPABASE_KEY);

// Analyze trends over time
const yearlyData = await Promise.all([
  api.opportunities.search({ 
    postedFrom: '2023-01-01', 
    postedTo: '2023-12-31' 
  }),
  api.opportunities.search({ 
    postedFrom: '2024-01-01', 
    postedTo: '2024-12-31' 
  })
]);
```

### Production Monitoring
```typescript
// Use SAM.gov for live monitoring
const api = new SamApi({ apiKey: process.env.SAM_API_KEY });

// Check for new opportunities
const results = await api.opportunities.search({
  postedFrom: new Date().toISOString().split('T')[0], // Today
  activeOnly: true,
  naicsCodes: getConstructionNAICSCodes()
});
```

## Data Schema Differences

While all APIs return the same TypeScript interfaces, there are some subtle differences:

### Set-Aside Descriptions
- **SAM.gov**: Returns short codes (e.g., "SBA")
- **Supabase**: Stores full descriptions, Edge Function maps to codes
- **CSV**: Depends on source data

### Null Values
- **SAM.gov**: Rarely has null values for core fields
- **Supabase**: Historical data has many nullable fields
- **CSV**: Depends on data quality

### Active Status
- **SAM.gov**: Mix of "Yes" and "No"
- **Supabase**: All "No" (historical)
- **CSV**: Depends on when exported

## Cost Considerations

### SAM.gov
- Free API with registration
- No direct costs
- Rate limits may affect high-volume usage

### Supabase
- Free tier: 500MB database, 2GB bandwidth
- Sufficient for the historical dataset
- Pay for additional bandwidth if needed

### CSV
- No hosting costs
- Storage cost only
- Memory usage during runtime

## Migration Guide

### From CSV to Supabase
1. Export CSV data
2. Import to Supabase using provided scripts
3. Deploy Edge Functions
4. Update client initialization

### From Supabase to SAM.gov
1. Register for SAM.gov API key
2. Update environment variables
3. Change client initialization
4. Remove `activeOnly: false` workarounds
5. Update date filters for current data

## Conclusion

- **Use SAM.gov** for production applications needing live data
- **Use Supabase** for development, testing, and historical analysis
- **Use CSV** for offline work and controlled test scenarios

All three APIs share the same interface, making it easy to develop with one and deploy with another.
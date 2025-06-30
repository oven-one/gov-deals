# Usage Examples

This directory contains practical examples showing how to use @lineai/gov-deals with different data sources.

## Quick Start

### Option 1: SAM.gov API (Live Data)
1. **Get a SAM.gov API Key**
   - Register at [SAM.gov](https://sam.gov)
   - Request an API key
   - See [RATE_LIMITS.md](../RATE_LIMITS.md) for account tier information

2. **Set up your environment**
   ```bash
   echo "SAM_API_KEY=your-api-key-here" > .env
   ```

### Option 2: Supabase (Historical Data - No API Key Required)
1. **Use the public Supabase instance or set up your own**
   ```bash
   echo "SUPABASE_URL=https://your-project.supabase.co" >> .env
   echo "SUPABASE_ANON_KEY=your-anon-key" >> .env
   ```

### Option 3: CSV Files (Offline - No API Key Required)
1. **Place your CSV file in the data directory**
   ```bash
   mkdir -p data
   cp your-opportunities.csv data/opportunities.csv
   ```

### Running the Examples
```bash
# Install dependencies
npm install

# Run basic usage examples
npx ts-node examples/basic-usage.ts

# Run multi-source examples
npx ts-node examples/use-historical-api.ts

# Use a specific data source
DATA_SOURCE=supabase npx ts-node examples/use-historical-api.ts
```

## Examples Included

### basic-usage.ts
Comprehensive SAM.gov API examples covering:
- **Basic Search**: Simple keyword and status filtering
- **Construction Search**: Specialized search for construction/renovation opportunities
- **Detailed Retrieval**: Getting full opportunity details and descriptions
- **Advanced Filtering**: Complex multi-criteria searches with location, NAICS codes, and set-asides
- **Type Safety**: Working with TypeScript types for better development experience

### use-historical-api.ts
Multi-source examples showing:
- **SAM.gov API**: Live federal opportunities
- **Supabase**: Historical data (71,969+ records, no API key required)
- **CSV Files**: Offline data access
- **Dynamic Selection**: Switch between data sources with environment variables
- **Common Interface**: Same code works with all data sources

### analyze-historical-data.ts
Market research and analysis examples:
- **Yearly Trends**: Compare opportunities across years
- **Agency Analysis**: Find top agencies posting opportunities
- **Geographic Distribution**: Identify states with most opportunities
- **Set-Aside Analysis**: Understand small business opportunities
- **Keyword Trends**: Popular terms in construction projects
- **Type Distribution**: Breakdown by opportunity types

## Common Use Cases

### Finding Local Construction Opportunities
```typescript
const localOpps = await samApi.opportunities.searchConstruction({
  placeOfPerformanceStates: ['CA'], // Your state
  setAsideTypes: ['SBA'], // Small business set-aside
  activeOnly: true,
});
```

### Searching by Building Type
```typescript
// Courthouse renovations
const courthouseOpps = await samApi.opportunities.search({
  keywords: 'courthouse renovation modernization',
  naicsCodes: ['236220'], // Commercial building construction
});

// Library modernizations  
const libraryOpps = await samApi.opportunities.search({
  keywords: 'library modernization upgrade',
  naicsCodes: ['236220'],
});
```

### Set-Aside Opportunities
```typescript
// Small business opportunities
const smallBizOpps = await samApi.opportunities.search({
  setAsideTypes: ['SBA', '8AN', 'HZC'], // Various small business set-asides
  activeOnly: true,
});
```

## Error Handling

The examples show how to handle common issues:
- **Rate Limiting**: Basic API accounts have very low limits
- **Missing Data**: Many fields can be null/optional
- **API Errors**: Network issues and invalid responses

## Important Notes

### Historical Data Characteristics
When using Supabase historical data:
- All opportunities have `active: "No"` status
- Don't use `activeOnly: true` filter
- Data spans 2018-2025 (varies by dataset)
- Contains 71,969+ opportunities

### Data Source Selection
Set the `DATA_SOURCE` environment variable:
- `sam` - SAM.gov live data (default)
- `supabase` - Historical data
- `csv` - Offline CSV file

## Next Steps

After trying these examples:
1. Check [API Comparison Guide](../docs/API_COMPARISON.md) to choose the right data source
2. Review [Historical Data Guide](../docs/HISTORICAL_DATA_GUIDE.md) for analysis tips
3. See [RATE_LIMITS.md](../RATE_LIMITS.md) for SAM.gov production usage
4. Review the [API documentation](../src/types/opportunities.ts) for all available fields
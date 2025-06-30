# Supabase Integration Guide

This guide documents the Supabase integration for hosting historical SAM.gov opportunities data.

## Overview

The Supabase integration provides a SAM.gov-compatible API for historical opportunities data. This allows users to:
- Access historical data without API keys
- Test applications with real data
- Analyze past opportunities for research

**Important Note**: All historical records have `active: "No"` status, as they represent past opportunities.

## Architecture

### Database
- **PostgreSQL** database hosted on Supabase
- **Table**: `opportunities` with 52 columns matching SAM.gov data structure
- **Records**: 71,969+ historical opportunities (as of June 2025)

### Edge Function
- **Name**: `api`
- **Runtime**: Deno
- **Framework**: Hono (Express-like router)
- **Endpoints**: Mimics SAM.gov API structure

## API Endpoints

### Base URL
```
https://your-project.supabase.co/functions/v1/api
```

### Available Endpoints

#### 1. Search Opportunities
```
GET /opportunities/v2/search
```

**Parameters** (all optional):
- `title` - Keywords to search in opportunity titles
- `naicsCode` - NAICS codes (comma-separated)
- `classificationCode` - PSC codes (comma-separated)
- `ptype` - Opportunity types (comma-separated codes)
- `typeOfSetAside` - Set-aside types (comma-separated)
- `postedFrom` - Start date (YYYY-MM-DD)
- `postedTo` - End date (YYYY-MM-DD)
- `rdlFrom` - Response deadline from
- `rdlTo` - Response deadline to
- `state` - Place of performance states (comma-separated)
- `zip` - Place of performance ZIP codes (comma-separated)
- `active` - "true" or "false" (Note: all historical data is inactive)
- `noticeid` - Specific notice ID
- `limit` - Results per page (default: 100)
- `page` - Page number (default: 1)

#### 2. Get Opportunity Description
```
GET /opportunities/v1/noticedesc?noticeid={noticeId}
```

#### 3. Health Check
```
GET /health
```

## Data Mappings

### Opportunity Type Codes
| Code | Full Name |
|------|-----------|
| `o` | Solicitation |
| `p` | Presolicitation |
| `a` | Award Notice |
| `s` | Special Notice |
| `k` | Combined Synopsis/Solicitation |
| `u` | Justification |
| `r` | Sources Sought |
| `g` | Sale of Surplus Property |
| `i` | Intent to Bundle Requirements |

### Set-Aside Codes
The Edge Function maps between SAM.gov codes and full descriptions:

| Code | Description |
|------|-------------|
| `SBA` | Total Small Business Set-Aside (FAR 19.5) |
| `SBP` | Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside |
| `SDVOSBC` | SDVOSB Competitive |
| `SDVOSBS` | SDVOSB Sole Source |
| `WOSB` | Women-Owned Small Business |
| `WOSBSS` | Women-Owned Small Business Sole Source |
| `EDWOSB` | Economically Disadvantaged Women-Owned Small Business |
| `EDWOSBSS` | EDWOSB Sole Source |
| `HZC` | HUBZone Competitive |
| `HZS` | HUBZone Sole Source |
| `8A` | 8(a) Sole Source |
| `8AN` | 8(a) Set-Aside |
| `8AC` | 8(a) Competitive |
| `IEE` | Indian Economic Enterprise |
| `ISBEE` | Indian Small Business Economic Enterprise |
| `BICiv` | Buy Indian Act |
| `VSA` | Veteran-Owned Small Business (VA specific) |
| `VSS` | Veteran-Owned Small Business Sole Source |
| `LAS` | Local Area Set-Aside |
| `NONE` | No Set-Aside |

## Using with the Library

### Setup

```typescript
import { createSupabaseApi } from '@lineai/gov-deals';

const api = createSupabaseApi(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

### Examples

```typescript
// Search for construction opportunities
const results = await api.opportunities.search({
  naicsCodes: ['236220'], // Commercial construction
  keywords: 'renovation',
  postedFrom: '2025-01-01'
}, { 
  limit: 50,
  page: 1 
});

// Get specific opportunity
const opportunity = await api.opportunities.getById('notice-id-here');

// Get opportunity description
const description = await api.opportunities.getDescription('notice-id-here');
```

## Database Schema

Key columns in the `opportunities` table:

- `notice_id` (VARCHAR, PRIMARY KEY)
- `title` (TEXT)
- `sol_number` (VARCHAR)
- `department_agency` (TEXT)
- `posted_date` (VARCHAR)
- `type` (VARCHAR) - Full type names, not codes
- `set_aside` (TEXT) - Full descriptions, not codes
- `response_deadline` (VARCHAR)
- `naics_code` (VARCHAR)
- `classification_code` (VARCHAR)
- `pop_city`, `pop_state`, `pop_zip` (TEXT) - Place of performance
- `active` (VARCHAR) - "Yes" or "No"
- `description` (TEXT)

## Known Issues and Limitations

1. **All Historical Data is Inactive**: Since this is historical data, all opportunities have `active: "No"`. Don't use `activeOnly: true` in filters.

2. **International Locations**: Some opportunities include international locations (e.g., "KR-11" for South Korea). The schema handles these by allowing any string for state codes.

3. **Data Variations**: Historical data includes variations in set-aside descriptions and null values in various fields. The Edge Function handles these mappings.

4. **No Real-Time Updates**: This is historical data and doesn't receive real-time updates from SAM.gov.

5. **Set-Aside Code Mappings**: The Edge Function maps between SAM.gov codes and the full descriptions stored in the database. All 20 unique set-aside variations in the database are supported.

6. **Type Mappings**: Opportunity types are stored as full names in the database (e.g., "Special Notice") but the API accepts single-letter codes (e.g., "s").

## Deployment

### Edge Function Deployment

```bash
cd supabase
npx supabase functions deploy api
```

### Environment Variables

The Edge Function uses these Supabase-provided variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Testing

Use the comprehensive test scripts to verify functionality:

### Full Test Suite
```bash
node scripts/test-search-comprehensive.js
```

This tests all search parameters including:
- Keywords/title search
- NAICS and PSC codes
- Opportunity types and set-asides
- Date ranges (posted and response deadline)
- Location filters (state and ZIP)
- Active/inactive status
- Pagination
- Combined complex filters

### Progressive Filter Test
```bash
node scripts/test-complex-progressive.js
```

This helps identify which filters are preventing results by progressively removing filters until results are found.

## Authentication

Unlike SAM.gov which uses query parameter authentication (`api_key`), Supabase requires header-based authentication:

```
Headers:
  apikey: your-anon-key
  Authorization: Bearer your-anon-key
```

The library's `SupabaseApi` wrapper handles this conversion automatically.

## Data Characteristics

### Historical Data Overview
- **Total Records**: 71,969+ opportunities
- **Date Range**: 2018-2025 (varies by dataset)
- **Status**: All opportunities have `active: "No"` status
- **Industries**: Covers all NAICS codes, not limited to construction
- **Locations**: Includes all US states and some international locations

### Common Queries

```typescript
// Find construction opportunities from 2024
const results = await api.opportunities.search({
  naicsCodes: getConstructionNAICSCodes(),
  postedFrom: '2024-01-01',
  postedTo: '2024-12-31'
});

// Find opportunities by state (without activeOnly filter)
const stateResults = await api.opportunities.search({
  placeOfPerformanceStates: ['CA', 'TX'],
  keywords: 'renovation'
});

// Find small business set-asides
const setAsideResults = await api.opportunities.search({
  setAsideTypes: ['SBA', 'WOSB', 'HZC']
});
```
# SAM.gov API Schema Verification

This document explains how to verify our TypeScript types against the actual SAM.gov API responses.

## Setup

1. **Get a SAM.gov API Key**:
   - Go to [SAM.gov](https://sam.gov)
   - Create an account or log in
   - Navigate to your profile: https://sam.gov/profile/details
   - Copy your "Public API Key"

2. **Set Environment Variable**:
   ```bash
   export SAM_GOV_API_KEY="your-api-key-here"
   ```

3. **Run the Verification**:
   ```bash
   yarn verify-api
   ```

## What It Tests

The verification script tests these endpoints:

1. **Opportunities Search** (`GET /opportunities/v2/search`)
   - Tests basic search functionality
   - Captures response structure
   - Identifies field names and types

2. **Get Opportunity by ID** (`GET /opportunities/v2/{id}`)
   - Tests individual opportunity retrieval
   - Compares single vs. list response structures

3. **Construction Opportunities** (`GET /opportunities/v2/search` with filters)
   - Tests NAICS code filtering (236220)
   - Tests keyword search
   - Validates construction-specific responses

## Output

The script will:

1. **Display real-time results** as it tests each endpoint
2. **Show response structures** with field names and types  
3. **Generate a detailed report** saved to `api-verification-report.json`
4. **Provide next steps** for updating our TypeScript types

## Expected Issues

Our current types are based on assumptions. The verification will likely reveal:

- **Different field names** than we assumed
- **Different response structure** (pagination, wrapper objects)
- **Missing fields** we didn't account for
- **Additional fields** we should include
- **Different data types** than expected

## After Verification

Once you run the verification:

1. **Review the console output** to see actual API responses
2. **Check `api-verification-report.json`** for detailed field mappings
3. **Update our types** in `src/types/opportunities.ts`
4. **Update transformations** in `src/clients/sam/endpoints/opportunities.ts`
5. **Re-run verification** to confirm fixes

## Troubleshooting

**API Key Issues**:
- Ensure your API key is valid and active
- Check you're using the "Public API Key" from your profile
- Verify the key has permissions for opportunities data

**Network Issues**:
- The script has a 30-second timeout
- SAM.gov APIs can be slow, especially for searches
- Try running during off-peak hours if you get timeouts

**Rate Limiting**:
- SAM.gov has rate limits per API key
- If you get 429 errors, wait and try again
- The script uses small result sets to minimize impact

## API Documentation

- [SAM.gov API Documentation](https://open.gsa.gov/api/get-opportunities-public-api/)
- [SAM.gov Developer Resources](https://api.sam.gov/docs/)
- [Federal Service Desk](https://www.fsd.gov/) for API support
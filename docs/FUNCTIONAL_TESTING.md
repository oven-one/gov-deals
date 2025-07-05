# Functional Testing Guide

This document describes the functional test suite for the @lineai/gov-deals library that validates the live SAM.gov API integration.

## Overview

The functional test suite performs comprehensive validation of the library's integration with the live SAM.gov API. It tests various search scenarios, payload structures, and edge cases to ensure the library handles real-world API responses correctly.

## Running the Tests

### Prerequisites

- Valid SAM.gov API key
- Active internet connection
- Node.js environment

### Basic Usage

```bash
# Run all functional tests
npm run test:functional

# Run with specific API key
npm run test:functional -- --api-key your-api-key-here

# Output results in JSON format
npm run test:functional -- --json

# Save results to file
npm run test:functional -- --json --output test-results.json
```

### Environment Variables

Set your SAM.gov API key as an environment variable:

```bash
export SAM_API_KEY=your-api-key-here
npm run test:functional
```

Or create a `.env.local` file:

```
SAM_API_KEY=your-api-key-here
```

## Test Scenarios

The functional test suite includes the following test scenarios:

### 1. Basic Active Search
- **Purpose**: Validates basic search functionality with minimal filters
- **Filters**: Active opportunities from recent date range
- **Validates**: Core response structure, basic fields

### 2. Construction NAICS Search
- **Purpose**: Tests NAICS code filtering for construction opportunities
- **Filters**: Construction-specific NAICS codes (236220, 238210)
- **Validates**: NAICS code fields, classification codes

### 3. Keyword Search
- **Purpose**: Validates keyword-based title filtering
- **Filters**: Search for "maintenance" in opportunity titles
- **Validates**: Title field, keyword matching logic

### 4. Set-Aside Filter
- **Purpose**: Tests small business set-aside filtering
- **Filters**: Small Business Administration (SBA) set-asides
- **Validates**: Set-aside type fields and descriptions

### 5. Geographic Search
- **Purpose**: Validates place of performance filtering
- **Filters**: Opportunities in CA, TX, NY states
- **Validates**: Place of performance nested object structure

### 6. Date Range Search
- **Purpose**: Tests date-based filtering
- **Filters**: Specific posted date ranges
- **Validates**: Date field formats and range logic

### 7. Complex Multi-Filter Search
- **Purpose**: Tests interaction between multiple filters
- **Filters**: Combines keywords, NAICS, and geography
- **Validates**: Filter interaction and result accuracy

### 8. Edge Case - Empty Results
- **Purpose**: Validates handling of searches with no results
- **Filters**: Impossible search terms
- **Validates**: Empty result set handling

### 9. Get Opportunity By ID
- **Purpose**: Tests individual opportunity retrieval
- **Method**: Uses `getById()` with real opportunity ID
- **Validates**: Detailed opportunity structure

### 10. Get Opportunity Description
- **Purpose**: Tests description retrieval functionality
- **Method**: Uses `getDescription()` with real opportunity ID
- **Validates**: Description format and content

### 11. Construction Search
- **Purpose**: Tests specialized construction search method
- **Method**: Uses `searchConstruction()` with date filters
- **Validates**: Construction-specific filtering logic

## Validation Checks

### Response Structure Validation
- Verifies required fields: `totalRecords`, `limit`, `offset`, `opportunitiesData`
- Ensures `opportunitiesData` is an array
- Validates numeric fields are numbers

### Field Validation
Each test scenario validates specific fields are present:
- `noticeId` - Unique opportunity identifier
- `title` - Opportunity title
- `type` - Opportunity type (Solicitation, Presolicitation, etc.)
- `active` - Active status
- `naicsCode` - Primary NAICS code
- `naicsCodes` - Array of NAICS codes
- `placeOfPerformance` - Location information with nested objects
- `typeOfSetAside` - Set-aside type code
- `typeOfSetAsideDescription` - Set-aside description

### Custom Validation
Some tests include custom validation logic:
- **Keyword Search**: Verifies keywords appear in opportunity titles
- **Geographic Search**: Confirms place of performance matches filter
- **Date Range Search**: Validates posted dates fall within specified range

### Schema Validation
All responses are validated against Zod schemas to ensure:
- Correct data types
- Required vs optional fields
- Nested object structures match API specification
- Null value handling

## Output Formats

### Individual Test Response Files
Each test automatically saves its full API response to a separate JSON file in the `./test-results/` directory. This provides complete visibility into the actual data returned by the API for each test scenario.

**File naming convention**: Test names are converted to lowercase kebab-case
- "Basic Active Search" → `basic-active-search.json`
- "Get Opportunity By ID" → `get-opportunity-by-id.json`

**Contents**: Each file contains the complete API response, including:
- Search results: Full `SamOpportunitySearchResponse` with all opportunities
- Individual opportunities: Complete opportunity details from `getById()`
- Descriptions: The full text description from `getDescription()`

**Example response file structure**:
```json
{
  "totalRecords": 324,
  "limit": 5,
  "offset": 0,
  "opportunitiesData": [
    {
      "noticeId": "f3af2bea5b4c45bea361381ba7a0ed03",
      "title": "Preproposal Conference dates...",
      "solicitationNumber": "FA521524R0006",
      "fullParentPathName": "DEPT OF DEFENSE.DEPT OF THE AIR FORCE",
      "placeOfPerformance": {
        "city": {
          "code": "3000",
          "name": "Anchorage"
        },
        "state": {
          "code": "AK",
          "name": "Alaska"
        }
      },
      "resourceLinks": [
        "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/..."
      ]
      // ... complete opportunity data
    }
  ],
  "links": [...]
}
```

### Console Output (Default)
Provides real-time test progress and detailed summary:

```
🚀 Starting Live API Functional Tests...

📋 Running: Basic Active Search
   Search for active opportunities with minimal filters
   ✅ PASSED (2467ms) - Found 324 records

📊 Test Summary
==================================================
Total Tests: 11
Passed: 11 ✅
Failed: 0 ❌
Duration: 33693ms
Success Rate: 100.0%
```

### JSON Output
Structured data format for automation and analysis:

```json
{
  "totalTests": 11,
  "passed": 11,
  "failed": 0,
  "duration": 33693,
  "results": [
    {
      "name": "Basic Active Search",
      "passed": true,
      "duration": 2467,
      "metadata": {
        "totalRecords": 324,
        "returnedRecords": 5,
        "filters": {
          "activeOnly": true,
          "postedFrom": "06/01/2024",
          "postedTo": "07/04/2024"
        }
      }
    }
  ]
}
```

## Error Handling

The test suite handles various error conditions:

### API Errors
- Rate limiting (429 responses)
- Authentication failures (401/403)
- Invalid requests (400)
- Network timeouts

### Validation Errors
- Missing required fields
- Incorrect data types
- Schema validation failures
- Custom validation logic failures

### Test Failures
Failed tests include:
- Error message details
- Test duration
- Filter parameters used
- Expected vs actual results

## Rate Limiting

The test suite includes built-in rate limiting features:
- 500ms delay between test scenarios
- Respects SAM.gov API rate limits
- Configurable delays for different API tiers

## Continuous Integration

### GitHub Actions Integration
Add to your CI pipeline:

```yaml
- name: Run Functional Tests
  run: npm run test:functional
  env:
    SAM_API_KEY: ${{ secrets.SAM_API_KEY }}
```

### Scheduled Testing
Run tests periodically to catch API changes:

```yaml
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
```

## Interpreting Results

### Success Indicators
- All tests pass (100% success rate)
- Response times are reasonable (<5 seconds per test)
- Expected data structures are returned
- Field validation passes

### Warning Signs
- Intermittent test failures
- Significantly increased response times
- Schema validation errors
- Unexpected empty result sets

### When to Investigate
- Multiple test failures
- New validation errors
- Consistent timeouts
- API behavior changes

## Troubleshooting

### Common Issues

**API Key Problems**
```
❌ Test execution failed: SAM API key is required
```
Solution: Set SAM_API_KEY environment variable or use --api-key parameter

**Rate Limiting**
```
❌ SAM.gov API error: Request failed with status code 429
```
Solution: Wait and retry, or upgrade API tier

**Network Issues**
```
❌ Test execution failed: Request timeout
```
Solution: Check internet connection, try again later

**Schema Validation Errors**
```
❌ Invalid search response from API
```
Solution: This indicates API response structure changes - update schemas

### Debug Mode

For detailed error information:
```bash
npm run test:functional -- --verbose
```

This shows full stack traces and additional debugging information.

## Extending the Test Suite

### Adding New Test Scenarios

1. Add scenario to `TEST_SCENARIOS` array in `scripts/functional-test-runner.js`
2. Define filters, expected results, and validation fields
3. Optionally add custom validation logic

Example:
```javascript
{
  name: 'My New Test',
  description: 'Tests new functionality',
  filters: {
    // Your search filters
  },
  pagination: { limit: 5 },
  validateFields: ['field1', 'field2'],
  customValidation: (opp) => {
    // Your validation logic
    return true;
  },
}
```

### Adding New Validation

Extend the `validateRequiredFields` method or add custom validation functions.

### Performance Testing

Monitor test duration and add performance assertions:
```javascript
if (result.duration > 10000) {
  console.warn(`⚠️ Slow response: ${result.duration}ms`);
}
```

## Best Practices

1. **Run Regularly**: Execute tests daily or before releases
2. **Monitor Trends**: Track response times and success rates over time
3. **Update Filters**: Adjust date ranges to ensure relevant test data
4. **Version Control**: Track test results to identify API changes
5. **Documentation**: Update tests when adding new library features

## Support

For issues with the functional test suite:
1. Check this documentation
2. Review test output and error messages
3. Verify API key and network connectivity
4. Report issues to the library maintainers
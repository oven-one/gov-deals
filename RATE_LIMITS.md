# SAM.gov API Rate Limits

## Important Notice

The SAM.gov API has different rate limits based on your account type. During our testing with a basic public API key, we encountered rate limits after just **2 API requests**.

## Rate Limit Tiers

SAM.gov applies different rate limits based on your registration type:

1. **Public API Key (Basic)**
   - Extremely limited - as low as 2-3 requests before hitting limits
   - Suitable only for testing and development
   - 429 errors will occur frequently

2. **Non-Federal Registered Users**
   - Higher limits than public keys
   - Requires SAM.gov registration with entity validation

3. **Federal Registered Users**
   - Significantly higher limits
   - Requires federal agency affiliation

4. **System Accounts**
   - Highest rate limits
   - Requires special approval process
   - Intended for production applications

## What This Means for You

- **Development/Testing**: The basic public API key is sufficient but expect frequent rate limit errors
- **Production Use**: You will need at least a Non-Federal registered account with entity validation
- **High-Volume Applications**: Consider applying for a System Account

## Getting Higher Rate Limits

1. **Register your entity** at [SAM.gov](https://sam.gov)
2. **Complete entity validation** process
3. **Request System Account** access if needed for production use
4. Contact the Federal Service Desk for specific rate limit quotas

## Best Practices

While this library doesn't enforce rate limiting, consider:

- Caching responses when possible
- Batching queries to minimize API calls
- Implementing your own rate limiting based on your account tier
- Monitoring your usage to stay within limits

## Error Handling

When you hit rate limits, you'll receive:
```
ApiError: SAM.gov API error: Request failed with status code 429
```

The API may include a `Retry-After` header indicating when you can retry.

---

**Note**: Most production users of this library will have entity-validated accounts with much higher rate limits than the public tier. The library is designed for these production use cases.
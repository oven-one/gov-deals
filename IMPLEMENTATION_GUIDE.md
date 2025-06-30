# Government Deals Package Architecture Plan

## Package Structure
```
@lineai/gov-deals/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── clients/                 # API client implementations
│   │   ├── sam/                 # SAM.gov API client
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── endpoints/
│   │   │       ├── opportunities.ts
│   │   │       ├── entities.ts
│   │   │       └── hierarchy.ts
│   │   ├── usaspending/         # USAspending.gov API client
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── endpoints/
│   │   │       ├── awards.ts
│   │   │       ├── spending.ts
│   │   │       └── search.ts
│   │   └── fpds/                # FPDS integration
│   │       ├── client.ts
│   │       └── types.ts
│   ├── core/                   # Core functionality
│   │   ├── config.ts            # Configuration management
│   │   ├── auth.ts              # Authentication handling
│   │   ├── cache.ts             # Caching layer
│   │   ├── rateLimit.ts         # Rate limiting
│   │   └── errors.ts            # Custom error types
│   ├── services/                # Business logic layer
│   │   ├── contractSearch.ts    # Unified contract search
│   │   ├── opportunityTracker.ts # Track new opportunities
│   │   └── analytics.ts         # Data analytics
│   ├── types/                   # TypeScript interfaces
│   │   ├── contracts.ts         # Contract types
│   │   ├── opportunities.ts     # Opportunity types
│   │   ├── vendors.ts           # Vendor types
│   │   └── construction.ts      # Construction-specific types
│   ├── utils/                   # Utility functions
│   │   ├── naics.ts             # NAICS code utilities
│   │   ├── filters.ts           # Filter builders
│   │   └── formatters.ts        # Data formatting
│   └── ai/                      # AI integration guides
│       ├── prompts.ts           # AI prompt templates
│       ├── examples.ts          # Usage examples
│       └── guides.md            # Documentation
├── examples/                    # Example implementations
│   ├── basic-search.ts
│   ├── opportunity-monitoring.ts
│   ├── analytics-dashboard.ts
│   └── ai-integration.ts
├── docs/                        # Documentation
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── ai-guide.md
│   └── construction-codes.md
└── tests/                       # Test files

```

## Core Features Implementation

### 1. Unified API Client
- Abstract complexity of multiple government APIs
- Provide single interface for searching contracts across SAM.gov, USAspending, and FPDS
- Handle authentication, rate limiting, and retries automatically

### 2. Type-Safe Data Models
```typescript
interface Contract {
  id: string;
  title: string;
  agency: Agency;
  vendor?: Vendor;
  amount: ContractAmount;
  performanceLocation: Location;
  naicsCode: string;
  type: ContractType;
  setAsideType?: SetAsideType;
  status: ContractStatus;
  dates: ContractDates;
  renovationType?: RenovationType;
}

interface Opportunity {
  id: string;
  title: string;
  solicitationNumber: string;
  agency: Agency;
  type: OpportunityType;
  naicsCode: string;
  setAsideType?: SetAsideType;
  responseDeadline: Date;
  estimatedValue?: ValueRange;
  placeOfPerformance: Location;
  attachments: Attachment[];
}
```

### 3. Smart Search & Filtering
- Pre-configured filters for construction/renovation projects
- NAICS code helpers (236220 for commercial construction, etc.)
- Location-based filtering
- Set-aside type filtering (small business, etc.)

### 4. Performance Optimizations
- Built-in caching layer with Redis support
- Request batching and deduplication
- Parallel API calls where possible
- Streaming support for large datasets

### 5. AI Integration Features
- Pre-built prompt templates for contract analysis
- Structured data extraction helpers
- Example integrations with OpenAI/Anthropic APIs
- Vector search preparation utilities

### 6. Developer Experience
- Comprehensive TypeScript types
- Intuitive method chaining API
- Detailed error messages
- Built-in retry logic with exponential backoff

## API Examples

```typescript
// Basic usage
const deals = new GovDeals({ apiKey: 'YOUR_API_KEY' });

// Search for renovation opportunities
const opportunities = await deals.opportunities
  .searchRenovations({
    location: { state: 'CA' },
    minValue: 100000,
    setAside: 'small-business'
  })
  .limit(50)
  .execute();

// Monitor new opportunities
const monitor = deals.monitor
  .renovationOpportunities({
    naicsCodes: ['236220', '238210'],
    keywords: ['renovation', 'modernization', 'retrofit']
  })
  .on('new', (opportunity) => {
    console.log('New opportunity:', opportunity);
  })
  .start();

// AI-ready data export
const contractData = await deals.contracts
  .searchHistorical({
    dateRange: { start: '2023-01-01', end: '2023-12-31' },
    contractType: 'renovation'
  })
  .formatForAI() // Returns structured JSON optimized for LLMs
  .execute();
```

## Implementation Phases - Revised Approach

We will implement this package in phases, fully completing and publishing each phase before moving to the next. This ensures we deliver working value incrementally and get user feedback early.

### Phase 1: SAM.gov Integration (MVP)
**Goal**: Fully functional SAM.gov opportunities search package

**Target Structure**:
```
src/
├── index.ts
├── clients/
│   └── sam/
│       ├── client.ts
│       ├── types.ts
│       └── endpoints/
│           └── opportunities.ts
├── types/
│   ├── opportunities.ts
│   └── common.ts
├── core/
│   ├── config.ts
│   └── errors.ts
└── utils/
    └── naics.ts
```

**Deliverables**:
- Basic SAM.gov client with authentication
- Opportunity search with filters
- TypeScript types for all data
- Basic error handling
- NAICS code utilities for construction industry
- Simple examples and documentation
- **Publish**: v0.1.0

### Phase 2: Enhanced SAM.gov Features
**Goal**: Complete SAM.gov integration with all endpoints

**Additions**:
```
src/
├── clients/
│   └── sam/
│       └── endpoints/
│           ├── entities.ts      # NEW: Entity/vendor data
│           └── hierarchy.ts     # NEW: Federal hierarchy
├── core/
│   ├── cache.ts                # NEW: Response caching
│   └── rateLimit.ts            # NEW: Rate limiting
└── services/
    └── opportunityTracker.ts   # NEW: Monitor opportunities
```

**Deliverables**:
- Entity management endpoint
- Federal hierarchy endpoint
- Caching layer for performance
- Rate limiting to prevent API blocks
- Opportunity monitoring service
- **Publish**: v0.2.0

### Phase 3: USAspending.gov Integration
**Goal**: Add historical contract data analysis

**Additions**:
```
src/
├── clients/
│   └── usaspending/           # NEW: Complete USAspending client
│       ├── client.ts
│       ├── types.ts
│       └── endpoints/
│           ├── awards.ts
│           ├── spending.ts
│           └── search.ts
└── services/
    ├── contractSearch.ts      # NEW: Unified search
    └── analytics.ts           # NEW: Data analytics
```

**Deliverables**:
- Complete USAspending.gov client
- Historical contract search
- Spending analytics
- Unified search across both APIs
- **Publish**: v0.3.0

### Phase 4: FPDS & Advanced Features
**Goal**: Complete data coverage and advanced features

**Additions**:
```
src/
├── clients/
│   └── fpds/                  # NEW: FPDS integration
├── services/
│   └── aiExport.ts            # NEW: AI-ready exports
└── ai/                        # NEW: AI integration guides
    ├── prompts.ts
    ├── examples.ts
    └── guides.md
```

**Deliverables**:
- FPDS integration
- AI-ready data formatting
- Comprehensive AI usage guides
- Advanced filtering and analytics
- **Publish**: v1.0.0

### Phase 5: Enterprise Features
**Goal**: Production-ready features for scale

**Additions**:
- Redis caching support
- Webhook support for opportunity monitoring
- Batch processing for large datasets
- Advanced retry strategies
- Comprehensive logging
- **Publish**: v1.1.0

## Current Focus: Phase 1 - SAM.gov Integration

We will start by building a fully functional SAM.gov opportunities search package with:
1. Clean API client architecture
2. Strong TypeScript types
3. Construction industry focus (NAICS codes)
4. Simple, intuitive API
5. Good documentation and examples

This phased approach ensures we:
- Deliver value quickly
- Get user feedback early
- Build on a solid foundation
- Avoid over-engineering
- Maintain focus on user needs

## Key Dependencies
- axios: HTTP client
- zod: Runtime type validation
- p-limit: Concurrency control
- node-cache: In-memory caching
- date-fns: Date utilities
- dotenv: Configuration management

## Government API Resources

### SAM.gov APIs
- **Get Opportunities Public API**: Search and retrieve federal contracting opportunities
- **Entity Management API**: Access entity registration and validation data
- **Federal Hierarchy API**: Navigate federal organization structures
- **Authentication**: Requires API key from SAM.gov profile page
- **Rate Limits**: Based on federal/non-federal status

### USAspending.gov API
- **Version**: V2 (V1 deprecated)
- **Authentication**: No authentication required
- **Key Endpoints**:
  - `/v2/search/spending_by_category/`: Search spending by various categories
  - `/v2/awards/`: Access award data
  - `/v2/transactions/`: Transaction-level data
- **NAICS Codes**: Use for construction industry filtering (e.g., 236220)

### FPDS (Federal Procurement Data System)
- Authoritative source for federal contract data
- DataBank for reports and downloads
- Contract actions >$10,000

## Construction Industry NAICS Codes
- 236220: Commercial and Institutional Building Construction
- 238210: Electrical Contractors
- 238220: Plumbing, Heating, and Air-Conditioning Contractors
- 238310: Drywall and Insulation Contractors
- 238320: Painting and Wall Covering Contractors

This architecture ensures the package is easy to use, performant, type-safe, and provides excellent support for AI integration while abstracting the complexity of multiple government APIs.
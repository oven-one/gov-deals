/**
 * Field mapping between CSV columns and SAM.gov API fields
 * 
 * The CSV uses different field names than the API, so we need to map between them
 */

/**
 * CSV column names from FY2025_opportunities.csv
 */
export interface CsvOpportunityRow {
  NoticeId: string;
  Title: string;
  'Sol#': string;
  'Department/Ind.Agency': string;
  CGAC: string;
  'Sub-Tier': string;
  'FPDS Code': string;
  Office: string;
  'AAC Code': string;
  PostedDate: string;
  Type: string;
  BaseType: string;
  ArchiveType: string;
  ArchiveDate: string;
  SetASideCode: string;
  SetASide: string;
  ResponseDeadLine: string;
  NaicsCode: string | number; // Can be numeric in CSV
  ClassificationCode: string;
  PopStreetAddress: string;
  PopCity: string;
  PopState: string;
  PopZip: string;
  PopCountry: string;
  Active: string;
  AwardNumber: string;
  AwardDate: string;
  'Award$': string;
  Awardee: string;
  PrimaryContactTitle: string;
  PrimaryContactFullname: string;
  PrimaryContactEmail: string;
  PrimaryContactPhone: string;
  PrimaryContactFax: string;
  SecondaryContactTitle: string;
  SecondaryContactFullname: string;
  SecondaryContactEmail: string;
  SecondaryContactPhone: string;
  SecondaryContactFax: string;
  OrganizationType: string;
  State: string;
  City: string;
  ZipCode: string;
  CountryCode: string;
  AdditionalInfoLink: string;
  Link: string;
  Description: string;
}

/**
 * Map CSV row to SAM.gov opportunity format
 */
export function mapCsvToSamOpportunity(csvRow: CsvOpportunityRow): any {
  return {
    // Core identifiers
    noticeId: csvRow.NoticeId,
    title: csvRow.Title,
    solicitationNumber: csvRow['Sol#'],
    
    // Agency information
    fullParentPathName: csvRow['Department/Ind.Agency'],
    fullParentPathCode: csvRow.CGAC,
    organizationType: csvRow.OrganizationType,
    
    // Dates
    postedDate: csvRow.PostedDate,
    responseDeadLine: csvRow.ResponseDeadLine,
    archiveDate: csvRow.ArchiveDate,
    
    // Type information
    type: csvRow.Type,
    baseType: csvRow.BaseType,
    archiveType: csvRow.ArchiveType,
    
    // Set-aside information (map the text value to our enum codes)
    typeOfSetAside: mapSetAsideTextToCode(csvRow.SetASide),
    typeOfSetAsideDescription: csvRow.SetASide,
    
    // Classification
    naicsCode: String(csvRow.NaicsCode), // Convert to string
    classificationCode: csvRow.ClassificationCode,
    
    // Status
    active: csvRow.Active === '1' ? 'Yes' : 'No', // CSV uses 1/0, API uses Yes/No
    
    // Description URL
    description: csvRow.Description || `/opportunities/v1/noticedesc?noticeid=${csvRow.NoticeId}`,
    
    // Contacts - map to array format
    pointOfContact: [
      ...(csvRow.PrimaryContactFullname ? [{
        type: 'primary',
        fullName: csvRow.PrimaryContactFullname,
        title: csvRow.PrimaryContactTitle,
        email: csvRow.PrimaryContactEmail,
        phone: csvRow.PrimaryContactPhone,
        fax: csvRow.PrimaryContactFax,
      }] : []),
      ...(csvRow.SecondaryContactFullname ? [{
        type: 'secondary',
        fullName: csvRow.SecondaryContactFullname,
        title: csvRow.SecondaryContactTitle,
        email: csvRow.SecondaryContactEmail,
        phone: csvRow.SecondaryContactPhone,
        fax: csvRow.SecondaryContactFax,
      }] : []),
    ],
    
    // Addresses
    officeAddress: {
      city: csvRow.City,
      state: csvRow.State,
      zipcode: csvRow.ZipCode,
      countryCode: csvRow.CountryCode,
    },
    placeOfPerformance: csvRow.PopCity ? {
      city: csvRow.PopCity,
      state: csvRow.PopState,
      zipcode: csvRow.PopZip,
      countryCode: csvRow.PopCountry,
    } : null,
    
    // Award information
    award: csvRow.AwardNumber ? {
      awardee: {
        name: csvRow.Awardee,
        manual: false,
      }
    } : null,
    
    // Links
    uiLink: csvRow.Link,
    additionalInfoLink: csvRow.AdditionalInfoLink,
  };
}

/**
 * Map set-aside text descriptions to codes
 * Based on the analysis, we saw these set-aside values in the CSV
 */
function mapSetAsideTextToCode(setAsideText: string): string | null {
  if (!setAsideText || setAsideText === 'None/Null') return null;
  
  const mapping: Record<string, string> = {
    'Total Small Business Set-Aside (FAR 19.5)': 'SBA',
    'Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside (FAR 19.14)': 'SBP',
    'SBA Certified Women-Owned Small Business (WOSB) Program Set-Aside (FAR 19.15)': 'WOSB',
    'Historically Underutilized Business (HUBZone) Set-Aside (FAR 19.13)': 'HUB',
    '8(a) Set-Aside (FAR 19.8)': '8AN',
    'Veteran-Owned Small Business Set-Aside (specific to Department of Veterans Affairs)': 'VSA',
    'No Set aside used': '',
  };
  
  // Return the code if we have a mapping, otherwise keep the original text
  return mapping[setAsideText] || setAsideText;
}

/**
 * Filter CSV rows based on SAM.gov search filters
 */
export function filterCsvRow(
  row: CsvOpportunityRow, 
  filters?: any
): boolean {
  if (!filters) return true;
  
  // Keywords search in title
  if (filters.keywords) {
    const keywords = filters.keywords.toLowerCase();
    if (!row.Title.toLowerCase().includes(keywords)) {
      return false;
    }
  }
  
  // NAICS codes filter
  if (filters.naicsCodes?.length) {
    const naicsStr = String(row.NaicsCode);
    const matches = filters.naicsCodes.some((code: string) => 
      naicsStr.startsWith(code)
    );
    if (!matches) return false;
  }
  
  // Active only filter
  if (filters.activeOnly && row.Active !== '1') {
    return false;
  }
  
  // Place of performance states
  if (filters.placeOfPerformanceStates?.length) {
    if (!filters.placeOfPerformanceStates.includes(row.PopState)) {
      return false;
    }
  }
  
  // Set-aside types
  if (filters.setAsideTypes?.length) {
    const mappedCode = mapSetAsideTextToCode(row.SetASide);
    if (!mappedCode || !filters.setAsideTypes.includes(mappedCode)) {
      return false;
    }
  }
  
  // Date filters
  if (filters.postedFrom) {
    if (new Date(row.PostedDate) < new Date(filters.postedFrom)) {
      return false;
    }
  }
  
  if (filters.postedTo) {
    if (new Date(row.PostedDate) > new Date(filters.postedTo)) {
      return false;
    }
  }
  
  return true;
}
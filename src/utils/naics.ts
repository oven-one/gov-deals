/**
 * NAICS code utilities for construction industry
 */

import { CONSTRUCTION_NAICS_CODES } from '../config/constants';

/**
 * Get all construction-related NAICS codes
 */
export function getConstructionNAICSCodes(): string[] {
  return Object.values(CONSTRUCTION_NAICS_CODES);
}

/**
 * Get NAICS codes for building construction
 */
export function getBuildingConstructionNAICS(): string[] {
  return [
    CONSTRUCTION_NAICS_CODES.COMMERCIAL_BUILDING,
    CONSTRUCTION_NAICS_CODES.INDUSTRIAL_BUILDING,
    CONSTRUCTION_NAICS_CODES.RESIDENTIAL_REMODELING,
  ];
}

/**
 * Get NAICS codes for specialty contractors
 */
export function getSpecialtyContractorNAICS(): string[] {
  return [
    CONSTRUCTION_NAICS_CODES.ELECTRICAL_CONTRACTORS,
    CONSTRUCTION_NAICS_CODES.PLUMBING_HVAC,
    CONSTRUCTION_NAICS_CODES.DRYWALL_INSULATION,
    CONSTRUCTION_NAICS_CODES.PAINTING,
    CONSTRUCTION_NAICS_CODES.ROOFING,
    CONSTRUCTION_NAICS_CODES.CONCRETE,
  ];
}

/**
 * Check if a NAICS code is construction-related
 */
export function isConstructionNAICS(code: string): boolean {
  return getConstructionNAICSCodes().includes(code);
}

/**
 * Get a human-readable description for construction NAICS codes
 */
export function getConstructionNAICSDescription(code: string): string | undefined {
  const descriptions: Record<string, string> = {
    [CONSTRUCTION_NAICS_CODES.COMMERCIAL_BUILDING]: 'Commercial and Institutional Building Construction',
    [CONSTRUCTION_NAICS_CODES.INDUSTRIAL_BUILDING]: 'Industrial Building Construction',
    [CONSTRUCTION_NAICS_CODES.RESIDENTIAL_REMODELING]: 'Residential Remodeling',
    [CONSTRUCTION_NAICS_CODES.ELECTRICAL_CONTRACTORS]: 'Electrical Contractors',
    [CONSTRUCTION_NAICS_CODES.PLUMBING_HVAC]: 'Plumbing, Heating, and Air-Conditioning Contractors',
    [CONSTRUCTION_NAICS_CODES.DRYWALL_INSULATION]: 'Drywall and Insulation Contractors',
    [CONSTRUCTION_NAICS_CODES.PAINTING]: 'Painting and Wall Covering Contractors',
    [CONSTRUCTION_NAICS_CODES.SITE_PREPARATION]: 'Site Preparation Contractors',
    [CONSTRUCTION_NAICS_CODES.ROOFING]: 'Roofing Contractors',
    [CONSTRUCTION_NAICS_CODES.CONCRETE]: 'Concrete Contractors',
  };

  return descriptions[code];
}
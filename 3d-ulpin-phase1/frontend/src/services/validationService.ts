// ============================================================================
// 3D ULPIN Phase 1 — Validation Service
// All validation checks are COMPUTED from data, never hardcoded.
// ============================================================================

import type { Property, Floor, Building, Parcel, ValidationResult, ValidationCheck } from '../types';

/**
 * Check that property geometry dimensions are valid (positive dimensions).
 */
function validateGeometry(property: Property): ValidationCheck {
  const valid =
    property.xMax > property.xMin &&
    property.yMax > property.yMin &&
    property.zMax > property.zMin &&
    property.area > 0;

  return {
    name: 'Geometry',
    key: 'geometry',
    valid,
    message: valid
      ? 'All dimensions are positive and area > 0'
      : `Invalid dimensions: X(${property.xMin}-${property.xMax}), Y(${property.yMin}-${property.yMax}), Z(${property.zMin}-${property.zMax})`,
  };
}

/**
 * Check that property Z range falls within its floor Z range.
 */
function validateTopology(property: Property, floor: Floor | null): ValidationCheck {
  if (!floor) {
    return {
      name: 'Topology',
      key: 'topology',
      valid: false,
      message: `Floor not found for floorNumber=${property.floorNumber}`,
    };
  }

  const valid =
    property.zMin >= floor.zMin &&
    property.zMax <= floor.zMax;

  return {
    name: 'Topology',
    key: 'topology',
    valid,
    message: valid
      ? `Property Z(${property.zMin}-${property.zMax}) within floor Z(${floor.zMin}-${floor.zMax})`
      : `Property Z(${property.zMin}-${property.zMax}) outside floor Z(${floor.zMin}-${floor.zMax})`,
  };
}

/**
 * Check if this property overlaps with any other property on the same floor.
 */
function validateOverlap(property: Property, sameFloorProperties: Property[]): ValidationCheck {
  const overlapping: string[] = [];

  for (const other of sameFloorProperties) {
    if (other.id === property.id) continue;

    // Check XY overlap (AABB intersection)
    const xOverlap = property.xMin < other.xMax && property.xMax > other.xMin;
    const yOverlap = property.yMin < other.yMax && property.yMax > other.yMin;
    const zOverlap = property.zMin < other.zMax && property.zMax > other.zMin;

    if (xOverlap && yOverlap && zOverlap) {
      overlapping.push(other.id);
    }
  }

  const valid = overlapping.length === 0;

  return {
    name: 'Overlap',
    key: 'overlap',
    valid,
    message: valid
      ? 'No overlapping properties detected'
      : `Overlaps with: ${overlapping.join(', ')}`,
  };
}

/**
 * Check that property Z range aligns exactly with floor Z range.
 */
function validateFloorAlignment(property: Property, floor: Floor | null): ValidationCheck {
  if (!floor) {
    return {
      name: 'Floor Alignment',
      key: 'floorAlignment',
      valid: false,
      message: 'Floor not found',
    };
  }

  const valid =
    property.zMin === floor.zMin &&
    property.zMax === floor.zMax;

  return {
    name: 'Floor Alignment',
    key: 'floorAlignment',
    valid,
    message: valid
      ? `Property Z matches floor Z(${floor.zMin}-${floor.zMax})`
      : `Misaligned: property Z(${property.zMin}-${property.zMax}) vs floor Z(${floor.zMin}-${floor.zMax})`,
  };
}

/**
 * Check that the building's parcel exists in the parcels list.
 */
function validateParcelLink(
  property: Property,
  buildings: Building[],
  parcels: Parcel[]
): ValidationCheck {
  const building = buildings.find(b => b.id === property.buildingId);
  if (!building) {
    return {
      name: 'Parcel Link',
      key: 'parcelLink',
      valid: false,
      message: `Building ${property.buildingId} not found`,
    };
  }

  const parcel = parcels.find(p => p.id === building.parcelId);
  const valid = !!parcel;

  return {
    name: 'Parcel Link',
    key: 'parcelLink',
    valid,
    message: valid
      ? `Linked to parcel ${building.parcelId} (${parcel!.name})`
      : `Parcel ${building.parcelId} not found`,
  };
}

/**
 * Check that this property's ULPIN is unique across all properties.
 */
function validateUlpinUnique(property: Property, allProperties: Property[]): ValidationCheck {
  const duplicates = allProperties.filter(
    p => p.id !== property.id && p.ulpin === property.ulpin
  );

  const valid = duplicates.length === 0;

  return {
    name: 'ULPIN',
    key: 'ulpinUnique',
    valid,
    message: valid
      ? `ULPIN "${property.ulpin}" is unique`
      : `Duplicate ULPIN found in: ${duplicates.map(d => d.id).join(', ')}`,
  };
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Run all validation checks on a single property.
 * All results are computed from the actual data — nothing is hardcoded.
 */
export function validateProperty(
  property: Property,
  floor: Floor | null,
  sameFloorProperties: Property[],
  buildings: Building[],
  parcels: Parcel[],
  allProperties: Property[]
): ValidationResult {
  return {
    geometry: validateGeometry(property),
    topology: validateTopology(property, floor),
    overlap: validateOverlap(property, sameFloorProperties),
    floorAlignment: validateFloorAlignment(property, floor),
    parcelLink: validateParcelLink(property, buildings, parcels),
    ulpinUnique: validateUlpinUnique(property, allProperties),
  };
}

/**
 * Run validation on all properties and return a summary.
 */
export function validateAllProperties(
  properties: Property[],
  floors: Record<string, Floor[]>,
  buildings: Building[],
  parcels: Parcel[]
): { total: number; valid: number; issues: number; results: Map<string, ValidationResult> } {
  const results = new Map<string, ValidationResult>();
  let valid = 0;
  let issues = 0;

  for (const prop of properties) {
    const buildingFloors = floors[prop.buildingId] || [];
    const floor = buildingFloors.find(f => f.floorNumber === prop.floorNumber) || null;
    const sameFloorProps = properties.filter(
      p => p.buildingId === prop.buildingId && p.floorNumber === prop.floorNumber
    );

    const result = validateProperty(prop, floor, sameFloorProps, buildings, parcels, properties);
    results.set(prop.id, result);

    const allChecksValid = Object.values(result).every(check => check.valid);
    if (allChecksValid) {
      valid++;
    } else {
      issues++;
    }
  }

  return { total: properties.length, valid, issues, results };
}

// ============================================================================
// 3D ULPIN Phase 1 — Building Generator Service
// Procedurally generates floors from building parameters.
// Floor Z ranges are ALWAYS computed, never hardcoded.
// ============================================================================

import type { Building, Floor, Property, BuildingRegistration, Parcel } from '../types';

/**
 * Generate all floors for a building.
 * Computes Z ranges from groundElevation, floorHeight, and floor count.
 * 
 * Example for B001 (groundElevation=0, floorHeight=4, basementFloors=1, numberOfFloors=6):
 *   B1:  zMin = -4,  zMax = 0
 *   G:   zMin =  0,  zMax = 4
 *   F1:  zMin =  4,  zMax = 8
 *   F2:  zMin =  8,  zMax = 12
 *   F3:  zMin = 12,  zMax = 16
 *   F4:  zMin = 16,  zMax = 20
 *   F5:  zMin = 20,  zMax = 24
 */
export function generateFloors(building: Building): Floor[] {
  const floors: Floor[] = [];

  // Generate basement floors (from deepest to shallowest)
  for (let i = building.basementFloors; i >= 1; i--) {
    const floorNumber = -i;
    const zMin = building.groundElevation + (floorNumber * building.floorHeight);
    const zMax = zMin + building.floorHeight;

    floors.push({
      id: `${building.id}-B${i}`,
      buildingId: building.id,
      floorNumber,
      label: `B${i}`,
      zMin,
      zMax,
    });
  }

  // Generate ground + above-ground floors
  for (let i = 0; i < building.numberOfFloors; i++) {
    const floorNumber = i;
    const zMin = building.groundElevation + (floorNumber * building.floorHeight);
    const zMax = zMin + building.floorHeight;

    let label: string;
    if (i === 0) {
      label = 'G';
    } else {
      label = `F${i}`;
    }

    floors.push({
      id: `${building.id}-${label}`,
      buildingId: building.id,
      floorNumber,
      label,
      zMin,
      zMax,
    });
  }

  return floors;
}

/**
 * Generate floors for all buildings and return as a map.
 */
export function generateAllFloors(buildings: Building[]): Record<string, Floor[]> {
  const result: Record<string, Floor[]> = {};
  for (const building of buildings) {
    result[building.id] = generateFloors(building);
  }
  return result;
}

/**
 * Get properties grouped by floor for a specific building.
 */
export function getPropertiesByFloor(
  buildingId: string,
  floors: Floor[],
  allProperties: Property[]
): Map<string, Property[]> {
  const result = new Map<string, Property[]>();

  for (const floor of floors) {
    const floorProps = allProperties.filter(
      p => p.buildingId === buildingId && p.floorNumber === floor.floorNumber
    );
    result.set(floor.id, floorProps);
  }

  return result;
}

/**
 * Get all properties for a specific floor.
 */
export function getFloorProperties(
  buildingId: string,
  floorNumber: number,
  allProperties: Property[]
): Property[] {
  return allProperties.filter(
    p => p.buildingId === buildingId && p.floorNumber === floorNumber
  );
}

/**
 * Get the floor object for a specific property.
 */
export function getFloorForProperty(
  property: Property,
  floors: Record<string, Floor[]>
): Floor | null {
  const buildingFloors = floors[property.buildingId];
  if (!buildingFloors) return null;
  return buildingFloors.find(f => f.floorNumber === property.floorNumber) || null;
}

/**
 * Generate a deterministic Prototype ULPIN.
 * Format: 3D-IN-{BUILDING}-{FLOOR}-{UNIT}
 */
export function generateULPIN(
  buildingId: string,
  floorNumber: number,
  unitNumber: string
): string {
  const floorStr = floorNumber < 0
    ? `B${String(Math.abs(floorNumber)).padStart(2, '0')}`
    : `F${String(floorNumber).padStart(2, '0')}`;
  return `3D-IN-${buildingId}-${floorStr}-${unitNumber}`;
}

/**
 * Get floor color based on floor number.
/**
 * Professional Architectural Color Scheme for Building Floors.
 * Replaces rainbow/childish hues with sleek titanium, slate, cobalt, and glass steel tones.
 */
export function getFloorColor(floorNumber: number): string {
  const colors: Record<number, string> = {
    [-2]: '#475569', // B2: Slate
    [-1]: '#64748b', // B1: Cool Ash
    0:    '#0284c7', // Ground Floor: Sapphire Accent
    1:    '#64748b', // F1: Ash Grey
    2:    '#475569', // F2: Metallic Steel
    3:    '#94a3b8', // F3: Platinum Silver
    4:    '#64748b', // F4: Cool Grey
    5:    '#2563eb', // F5: Cobalt Accent
    6:    '#475569', // F6: Dark Ash
    7:    '#64748b', // F7: Steel Silver
    8:    '#0369a1', // F8: Executive Ocean
    9:    '#94a3b8', // F9: Platinum
    10:   '#0284c7', // F10: Apex Sapphire
  };
  return colors[floorNumber] || '#64748b';
}

/**
 * Professional GIS & Architectural Color Scheme for Property Types.
 */
export function getPropertyTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'Residential':      '#2563eb', // Professional Royal Blue
    'Commercial':       '#d97706', // Muted Warm Bronze
    'Laboratory':       '#7c3aed', // Deep Indigo Purple
    'Parking':          '#475569', // Slate Steel
    'Utility Corridor': '#334155', // Charcoal Steel
    'Office':           '#0284c7', // Sapphire Cyan
    'Classroom':        '#059669', // Forest Emerald
    'Library':          '#0d9488', // Deep Teal
    'Storage':          '#52525b', // Zinc Oxide
  };
  return colors[type] || '#475569';
}

// ---------------------------------------------------------------------------
// BUILDING FROM REGISTRATION — Generate complete building data from form inputs
// ---------------------------------------------------------------------------



/** Property type distribution based on building type */
function getPropertyTypesForBuildingType(
  buildingType: string,
  floorNumber: number
): string[] {
  const typeMap: Record<string, { basement: string[]; ground: string[]; upper: string[] }> = {
    'Academic': {
      basement: ['Parking', 'Parking', 'Utility Corridor', 'Storage', 'Parking', 'Storage'],
      ground: ['Office', 'Classroom', 'Office', 'Library', 'Classroom', 'Office'],
      upper: ['Classroom', 'Laboratory', 'Office', 'Classroom', 'Laboratory', 'Office'],
    },
    'Residential': {
      basement: ['Parking', 'Parking', 'Storage', 'Parking', 'Storage', 'Utility Corridor'],
      ground: ['Commercial', 'Office', 'Commercial', 'Office', 'Commercial', 'Office'],
      upper: ['Residential', 'Residential', 'Residential', 'Residential', 'Residential', 'Residential'],
    },
    'Commercial': {
      basement: ['Parking', 'Parking', 'Parking', 'Storage', 'Parking', 'Utility Corridor'],
      ground: ['Commercial', 'Commercial', 'Office', 'Commercial', 'Commercial', 'Office'],
      upper: ['Office', 'Commercial', 'Office', 'Commercial', 'Office', 'Commercial'],
    },
    'Mixed-Use': {
      basement: ['Parking', 'Parking', 'Utility Corridor', 'Storage', 'Parking', 'Storage'],
      ground: ['Commercial', 'Office', 'Commercial', 'Residential', 'Commercial', 'Office'],
      upper: ['Residential', 'Office', 'Residential', 'Classroom', 'Office', 'Residential'],
    },
  };

  const config = typeMap[buildingType] || typeMap['Mixed-Use'];
  if (floorNumber < 0) return config.basement;
  if (floorNumber === 0) return config.ground;
  return config.upper;
}

/** Generate a ULPIN for registered buildings */
function makeRegisteredUlpin(buildingId: string, floorNumber: number, unitNumber: string): string {
  const floorStr = floorNumber < 0
    ? `B${String(Math.abs(floorNumber)).padStart(2, '0')}`
    : `F${String(floorNumber).padStart(2, '0')}`;
  return `3D-IN-${buildingId}-${floorStr}-${unitNumber}`;
}

/** Generate properties for a single floor of a registered building */
function generateRegisteredFloorProperties(
  buildingId: string,
  floorNumber: number,
  floorLabel: string,
  buildingWidth: number,
  buildingDepth: number,
  zMin: number,
  zMax: number,
  types: string[],
  ownerName: string,
): Property[] {
  const halfW = buildingWidth / 2;
  const halfD = buildingDepth / 2;
  const corridorW = 3;
  const corridorD = 3;

  const colWidth = (buildingWidth - corridorW * 2) / 3;
  const rowDepth = (buildingDepth - corridorD) / 2;

  const floorPrefix = floorNumber < 0
    ? `B${Math.abs(floorNumber)}`
    : floorNumber === 0 ? 'G' : `${floorNumber}`;

  const floorId = `${buildingId}-${floorLabel}`;

  const positions = [
    { xMin: -halfW, xMax: -halfW + colWidth, yMin: halfD - rowDepth, yMax: halfD },
    { xMin: -colWidth / 2, xMax: colWidth / 2, yMin: halfD - rowDepth, yMax: halfD },
    { xMin: halfW - colWidth, xMax: halfW, yMin: halfD - rowDepth, yMax: halfD },
    { xMin: -halfW, xMax: -halfW + colWidth, yMin: -halfD, yMax: -halfD + rowDepth },
    { xMin: -colWidth / 2, xMax: colWidth / 2, yMin: -halfD, yMax: -halfD + rowDepth },
    { xMin: halfW - colWidth, xMax: halfW, yMin: -halfD, yMax: -halfD + rowDepth },
  ];

  return positions.map((pos, i) => {
    const unitNum = i + 1;
    const unitNumber = `U${floorPrefix}${String(unitNum).padStart(2, '0')}`;
    const area = Math.round((pos.xMax - pos.xMin) * (pos.yMax - pos.yMin) * 100) / 100;

    return {
      id: `${buildingId}-${floorLabel}-${unitNumber}`,
      buildingId,
      floorId,
      floorNumber,
      unitNumber,
      type: (types[i % types.length]) as Property['type'],
      xMin: Math.round(pos.xMin * 100) / 100,
      xMax: Math.round(pos.xMax * 100) / 100,
      yMin: Math.round(pos.yMin * 100) / 100,
      yMax: Math.round(pos.yMax * 100) / 100,
      zMin,
      zMax,
      area,
      ulpin: makeRegisteredUlpin(buildingId, floorNumber, unitNumber),
      owner: ownerName,
      status: 'Active',
    };
  });
}

/**
 * Generate a complete Building + Properties + Floors from a BuildingRegistration.
 * Computes parcel center to place the building, assigns a unique ID, and
 * generates floor/property data using the same logic as existing buildings.
 */
export function generateBuildingFromRegistration(
  registration: BuildingRegistration,
  parcel: Parcel,
  existingBuildingCount: number,
): { building: Building; properties: Property[]; floors: Floor[] } {
  // Compute parcel center for building placement
  const centerX = parcel.footprint.reduce((sum, [x]) => sum + x, 0) / parcel.footprint.length;
  const centerY = parcel.footprint.reduce((sum, [, y]) => sum + y, 0) / parcel.footprint.length;

  // Generate unique building ID
  const buildingId = `BR${String(existingBuildingCount + 1).padStart(3, '0')}`;

  // Color based on building type
  const typeColors: Record<string, string> = {
    'Academic': '#3b82f6',
    'Residential': '#8b5cf6',
    'Commercial': '#f59e0b',
    'Mixed-Use': '#06b6d4',
  };

  const building: Building = {
    id: buildingId,
    name: registration.buildingName,
    parcelId: registration.parcelId,
    position: { x: centerX, y: centerY },
    width: registration.width,
    depth: registration.depth,
    totalHeight: registration.numberOfFloors * registration.floorHeight,
    numberOfFloors: registration.numberOfFloors,
    floorHeight: registration.floorHeight,
    groundElevation: 0,
    basementFloors: registration.basementFloors,
    color: typeColors[registration.buildingType] || '#06b6d4',
    isRegistered: true,
    registrationImages: {
      floorPlans: registration.floorPlanImages,
      buildingDesigns: registration.buildingDesignImages,
      photos: registration.buildingPhotos,
    },
  };

  // Generate floors
  const floors = generateFloors(building);

  // Generate properties for every floor
  const properties: Property[] = [];
  for (let i = -registration.basementFloors; i < registration.numberOfFloors; i++) {
    const label = i < 0 ? `B${Math.abs(i)}` : i === 0 ? 'G' : `F${i}`;
    const zMin = i * registration.floorHeight;
    const zMax = zMin + registration.floorHeight;
    const types = getPropertyTypesForBuildingType(registration.buildingType, i);

    properties.push(
      ...generateRegisteredFloorProperties(
        buildingId, i, label,
        registration.width, registration.depth,
        zMin, zMax, types,
        registration.owner.name,
      )
    );
  }

  return { building, properties, floors };
}


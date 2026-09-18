// ============================================================================
// 3D ULPIN Phase 1 — Building Generator Service
// Procedurally generates floors from building parameters.
// Floor Z ranges are ALWAYS computed, never hardcoded.
// ============================================================================

import type { Building, Floor, Property } from '../types';

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

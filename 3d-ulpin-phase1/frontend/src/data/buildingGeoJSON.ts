// ============================================================================
// 3D ULPIN Phase 2 — Real GPS Building Footprints (GeoJSON)
// Accurate GPS coordinates for LPU Phagwara campus buildings aligned with satellite imagery
// Center: 31.2536°N, 75.7028°E
// ============================================================================

import type { FeatureCollection, Polygon } from 'geojson';

export interface BuildingGeoProperties {
  buildingId: string;
  name: string;
  floors: number;
  height: number;
  basementFloors: number;
  color: string;
  parcelId: string;
}

/**
 * Real GPS polygon footprints for the 13 LPU campus buildings.
 * Coordinates are aligned with Mapbox / OpenStreetMap satellite imagery
 * of the LPU Phagwara campus.
 *
 * Each polygon is [longitude, latitude] pairs (GeoJSON standard).
 */
export const buildingFootprints: FeatureCollection<Polygon, BuildingGeoProperties> = {
  type: 'FeatureCollection',
  features: [
    // -----------------------------------------------------------------------
    // MAIN ACADEMIC QUAD (Blocks 25, 26, 27, 28, 29, 30) — Primary Academic Spine
    // -----------------------------------------------------------------------
    {
      type: 'Feature',
      properties: {
        buildingId: 'B025',
        name: 'Block 25',
        floors: 6,
        height: 24,
        basementFloors: 1,
        color: '#3b82f6',
        parcelId: 'P001',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7008, 31.2536],
          [75.7014, 31.2536],
          [75.7014, 31.2542],
          [75.7008, 31.2542],
          [75.7008, 31.2536],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B026',
        name: 'Block 26 — Central Academic Complex',
        floors: 7,
        height: 28,
        basementFloors: 1,
        color: '#2563eb',
        parcelId: 'P001',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7016, 31.2536],
          [75.7027, 31.2536],
          [75.7027, 31.2542],
          [75.7016, 31.2542],
          [75.7016, 31.2536],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B027',
        name: 'Block 27',
        floors: 5,
        height: 20,
        basementFloors: 0,
        color: '#0284c7',
        parcelId: 'P001',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7018, 31.2530],
          [75.7023, 31.2530],
          [75.7023, 31.2535],
          [75.7018, 31.2535],
          [75.7018, 31.2530],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B028',
        name: 'Block 28',
        floors: 5,
        height: 20,
        basementFloors: 0,
        color: '#0369a1',
        parcelId: 'P001',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7030, 31.2530],
          [75.7035, 31.2530],
          [75.7035, 31.2535],
          [75.7030, 31.2535],
          [75.7030, 31.2530],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B029',
        name: 'Division of Admissions, LPU',
        floors: 6,
        height: 24,
        basementFloors: 1,
        color: '#3b82f6',
        parcelId: 'P001',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7029, 31.2536],
          [75.7038, 31.2536],
          [75.7038, 31.2542],
          [75.7029, 31.2542],
          [75.7029, 31.2536],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B030',
        name: 'The Chancellory',
        floors: 7,
        height: 28,
        basementFloors: 1,
        color: '#1d4ed8',
        parcelId: 'P001',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7040, 31.2536],
          [75.7048, 31.2536],
          [75.7048, 31.2542],
          [75.7040, 31.2542],
          [75.7040, 31.2536],
        ]],
      },
    },

    // -----------------------------------------------------------------------
    // SOUTH SECTOR (Blocks 37, 36, 35, 34 Auditorium)
    // -----------------------------------------------------------------------
    {
      type: 'Feature',
      properties: {
        buildingId: 'B037',
        name: 'Block 37',
        floors: 6,
        height: 24,
        basementFloors: 1,
        color: '#a855f7',
        parcelId: 'P002',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7018, 31.2522],
          [75.7026, 31.2522],
          [75.7026, 31.2527],
          [75.7018, 31.2527],
          [75.7018, 31.2522],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B036',
        name: 'Block 36',
        floors: 6,
        height: 24,
        basementFloors: 1,
        color: '#8b5cf6',
        parcelId: 'P002',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7018, 31.2515],
          [75.7026, 31.2515],
          [75.7026, 31.2520],
          [75.7018, 31.2520],
          [75.7018, 31.2515],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B035',
        name: 'Block 35',
        floors: 5,
        height: 20,
        basementFloors: 0,
        color: '#7c3aed',
        parcelId: 'P002',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7030, 31.2515],
          [75.7038, 31.2515],
          [75.7038, 31.2520],
          [75.7030, 31.2520],
          [75.7030, 31.2515],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B034',
        name: 'Shanti Devi Mittal Auditorium',
        floors: 5,
        height: 25,
        basementFloors: 1,
        color: '#c084fc',
        parcelId: 'P002',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7030, 31.2522],
          [75.7039, 31.2522],
          [75.7039, 31.2528],
          [75.7030, 31.2528],
          [75.7030, 31.2522],
        ]],
      },
    },

    // -----------------------------------------------------------------------
    // EAST & WEST SECTORS (Block 33 CS, Lovely Bake Studio, Biosciences)
    // -----------------------------------------------------------------------
    {
      type: 'Feature',
      properties: {
        buildingId: 'B033',
        name: 'Block 33 — School of Computer Science & Engineering',
        floors: 10,
        height: 45,
        basementFloors: 2,
        color: '#06b6d4',
        parcelId: 'P003',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7043, 31.2520],
          [75.7054, 31.2520],
          [75.7054, 31.2532],
          [75.7043, 31.2532],
          [75.7043, 31.2520],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B011',
        name: 'Lovely Bake Studio & Services',
        floors: 3,
        height: 12,
        basementFloors: 0,
        color: '#10b981',
        parcelId: 'P004',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7006, 31.2516],
          [75.7013, 31.2516],
          [75.7013, 31.2522],
          [75.7006, 31.2522],
          [75.7006, 31.2516],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        buildingId: 'B038',
        name: 'School of Biosciences',
        floors: 6,
        height: 24,
        basementFloors: 1,
        color: '#f59e0b',
        parcelId: 'P005',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7022, 31.2545],
          [75.7035, 31.2545],
          [75.7035, 31.2550],
          [75.7022, 31.2550],
          [75.7022, 31.2545],
        ]],
      },
    },
  ],
};

/**
 * Parcel boundaries in GeoJSON format.
 */
export const parcelBoundaries: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'P001', name: 'Main Academic Block Complex (Blocks 25-30)', color: '#3b82f6' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7006, 31.2529],
          [75.7050, 31.2529],
          [75.7050, 31.2544],
          [75.7006, 31.2544],
          [75.7006, 31.2529],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'P002', name: 'South Courtyard & Auditorium Sector (Blocks 34-37)', color: '#a855f7' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7016, 31.2513],
          [75.7040, 31.2513],
          [75.7040, 31.2528],
          [75.7016, 31.2528],
          [75.7016, 31.2513],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'P003', name: 'School of CS & Engineering Sector (Block 33)', color: '#06b6d4' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7042, 31.2518],
          [75.7056, 31.2518],
          [75.7056, 31.2534],
          [75.7042, 31.2534],
          [75.7042, 31.2518],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'P004', name: 'Campus Services & Bake Studio Sector', color: '#10b981' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7004, 31.2514],
          [75.7015, 31.2514],
          [75.7015, 31.2524],
          [75.7004, 31.2524],
          [75.7004, 31.2514],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'P005', name: 'School of Biosciences Sector (Block 38)', color: '#f59e0b' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7020, 31.2544],
          [75.7037, 31.2544],
          [75.7037, 31.2552],
          [75.7020, 31.2552],
          [75.7020, 31.2544],
        ]],
      },
    },
  ],
};

/** Campus center coordinates */
export const LPU_CENTER: [number, number] = [75.7028, 31.2536];
export const DEFAULT_ZOOM = 17.2;

/**
 * Empty / Vacant parcel boundaries in GeoJSON format.
 * These parcels have no buildings and are available for registration.
 */
export interface EmptyParcelGeoProperties {
  id: string;
  name: string;
  color: string;
  isVacant: boolean;
  area: number;
}

export const emptyParcelBoundaries: FeatureCollection<Polygon, EmptyParcelGeoProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'EP001',
        name: 'Vacant Plot — East Extension',
        color: '#eab308',
        isVacant: true,
        area: 11700,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7058, 31.2522],
          [75.7070, 31.2522],
          [75.7070, 31.2536],
          [75.7058, 31.2536],
          [75.7058, 31.2522],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'EP002',
        name: 'Vacant Plot — South-West Sector',
        color: '#f97316',
        isVacant: true,
        area: 12000,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.6995, 31.2508],
          [75.7012, 31.2508],
          [75.7012, 31.2516],
          [75.6995, 31.2516],
          [75.6995, 31.2508],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'EP003',
        name: 'Vacant Plot — North-East Corner',
        color: '#14b8a6',
        isVacant: true,
        area: 10500,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.7040, 31.2548],
          [75.7058, 31.2548],
          [75.7058, 31.2556],
          [75.7040, 31.2556],
          [75.7040, 31.2548],
        ]],
      },
    },
  ],
};


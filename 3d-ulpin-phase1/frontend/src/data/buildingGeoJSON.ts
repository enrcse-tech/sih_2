// ============================================================================
// 3D ULPIN Phase 2 — Real GPS Building Footprints (GeoJSON)
// Accurate GPS coordinates for LPU Phagwara campus buildings aligned with satellite imagery
// Center: 31.2536°N, 75.7028°E
// ============================================================================

import type { FeatureCollection, Polygon, LineString } from 'geojson';

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

// ---------------------------------------------------------------------------
// UNDERGROUND UTILITIES GEOJSON (REAL GPS MAPPING)
// Coordinates mapped using site center: 31.2536°N, 75.7028°E
// ---------------------------------------------------------------------------

export interface UtilityGeoProperties {
  id: string;
  type: 'water' | 'sewer' | 'electrical';
  name: string;
  depth: number;
  diameter: number;
  material: string;
  flowRateOrSlope: string;
  color: string;
  connectedBuildings: string;
}

export const waterNetworkGeoJSON: FeatureCollection<LineString, UtilityGeoProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'WTR-001',
        type: 'water',
        name: 'North Academic Main Water Grid',
        depth: 2.2,
        diameter: 0.5,
        material: 'HDPE PE100 SDR11',
        flowRateOrSlope: '4.8 bar / 720 L/min',
        color: '#0284c7',
        connectedBuildings: 'Block 25, Block 26, Admissions, Chancellory',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [75.7008, 31.2544],
          [75.7010, 31.2544],
          [75.7020, 31.2544],
          [75.7028, 31.2544],
          [75.7035, 31.2544],
          [75.7045, 31.2544],
          [75.7047, 31.2544],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'WTR-002',
        type: 'water',
        name: 'North-South Central Water Spine',
        depth: 2.4,
        diameter: 0.45,
        material: 'Ductile Iron Class K9',
        flowRateOrSlope: '4.5 bar / 560 L/min',
        color: '#0284c7',
        connectedBuildings: 'Biosciences, Central Plaza, Block 27, Block 28',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [75.7028, 31.2553],
          [75.7028, 31.2547],
          [75.7028, 31.2544],
          [75.7028, 31.2538],
          [75.7028, 31.2531],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'WTR-003',
        type: 'water',
        name: 'East Sector Water Feeder (CSE Ring)',
        depth: 2.2,
        diameter: 0.4,
        material: 'HDPE PE100 SDR11',
        flowRateOrSlope: '4.2 bar / 640 L/min',
        color: '#0284c7',
        connectedBuildings: 'Chancellory, Block 33 CSE, Auditorium',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [75.7045, 31.2544],
          [75.7046, 31.2539],
          [75.7046, 31.2532],
          [75.7041, 31.2531],
          [75.7034, 31.2531],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'WTR-004',
        type: 'water',
        name: 'South & West Sector Water Loop',
        depth: 2.3,
        diameter: 0.35,
        material: 'HDPE PE100 SDR11',
        flowRateOrSlope: '4.0 bar / 480 L/min',
        color: '#0284c7',
        connectedBuildings: 'Block 37, Block 36, Block 35, Services & Lovely Bake',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [75.7020, 31.2531],
          [75.7020, 31.2524],
          [75.7028, 31.2524],
          [75.7034, 31.2524],
          [75.7028, 31.2524],
          [75.7010, 31.2524],
          [75.7010, 31.2525],
        ],
      },
    },
  ],
};

export const sewageNetworkGeoJSON: FeatureCollection<LineString, UtilityGeoProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'SEW-001',
        type: 'sewer',
        name: 'North Spine Gravity Sewer Interceptor',
        depth: 3.8,
        diameter: 0.6,
        material: 'Reinforced Concrete Pipe (RCC NP3)',
        flowRateOrSlope: '1:140 Gravity Gradient / 820 L/min',
        color: '#ea580c',
        connectedBuildings: 'Chancellory, Admissions, Block 26, Block 25 -> West Trunk',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [75.7045, 31.2545],
          [75.7035, 31.2545],
          [75.7020, 31.2545],
          [75.7010, 31.2545],
          [75.7007, 31.2545],
          [75.7007, 31.2536],
          [75.7007, 31.2525],
          [75.7010, 31.2525],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'SEW-002',
        type: 'sewer',
        name: 'Central Biosciences & Academic Wastewater Collector',
        depth: 3.6,
        diameter: 0.5,
        material: 'Twin-Wall Corrugated HDPE (SN8)',
        flowRateOrSlope: '1:130 Gravity Gradient / 540 L/min',
        color: '#ea580c',
        connectedBuildings: 'Biosciences, Block 27, Block 37 -> STP',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [75.7028, 31.2554],
          [75.7023, 31.2547],
          [75.7020, 31.2539],
          [75.7020, 31.2532],
          [75.7016, 31.2528],
          [75.7010, 31.2525],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'SEW-003',
        type: 'sewer',
        name: 'South-East Gravity Sewer Outfall to STP',
        depth: 4.0,
        diameter: 0.55,
        material: 'Reinforced Concrete Pipe (RCC NP3)',
        flowRateOrSlope: '1:150 Gravity Gradient / 780 L/min',
        color: '#ea580c',
        connectedBuildings: 'Block 33 CSE, Auditorium, Block 35, Block 36 -> STP B011',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [75.7046, 31.2533],
          [75.7035, 31.2532],
          [75.7035, 31.2525],
          [75.7020, 31.2525],
          [75.7011, 31.2525],
          [75.7010, 31.2525],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'SEW-004',
        type: 'sewer',
        name: 'Central STP Primary Inflow Wet Well',
        depth: 4.2,
        diameter: 0.8,
        material: 'Epoxy-Coated Ductile Iron',
        flowRateOrSlope: 'Final Discharge Header / 2,140 L/min Peak',
        color: '#c2410c',
        connectedBuildings: 'STP Bio-Digester Equalization Tank (B011)',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [75.7011, 31.2525],
          [75.7010, 31.2525],
          [75.7008, 31.2525],
        ],
      },
    },
  ],
};


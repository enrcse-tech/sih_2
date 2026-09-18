// ============================================================================
// 3D ULPIN Phase 1 — Real LPU Campus Data
// ============================================================================
// ⚠️  SAMPLE REFERENCE DATA — NON-OFFICIAL LPU COORDINATES
//     Building layout and names match LPU Phagwara main academic quad
//     (Block 25, 26, 27, 28, Division of Admissions, Chancellory,
//      Block 37, 36, 35, Shanti Devi Mittal Auditorium, Block 33).
// ============================================================================

import type { SiteData } from '../types';

/**
 * Generate a ULPIN from building, floor, and unit info.
 * Format: 3D-IN-{BUILDING}-F{FLOOR:02}-{UNIT}
 */
function makeUlpin(buildingId: string, floorNumber: number, unitNumber: string): string {
  const floorStr = floorNumber < 0
    ? `B${String(Math.abs(floorNumber)).padStart(2, '0')}`
    : `F${String(floorNumber).padStart(2, '0')}`;
  return `3D-IN-${buildingId}-${floorStr}-${unitNumber}`;
}

/**
 * Generate properties for a building floor.
 * Creates a 3×2 grid of 6 units on each floor.
 */
function generateFloorProperties(
  buildingId: string,
  floorNumber: number,
  floorLabel: string,
  buildingWidth: number,
  buildingDepth: number,
  zMin: number,
  zMax: number,
  types: string[],
  owners: string[],
  startUnitIndex: number
): SiteData['properties'] {
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
    const unitNum = startUnitIndex + i + 1;
    const unitNumber = `U${floorPrefix}${String(unitNum).padStart(2, '0')}`;
    const area = Math.round((pos.xMax - pos.xMin) * (pos.yMax - pos.yMin) * 100) / 100;

    return {
      id: `${buildingId}-${floorLabel}-${unitNumber}`,
      buildingId,
      floorId,
      floorNumber,
      unitNumber,
      type: types[i % types.length] as SiteData['properties'][0]['type'],
      xMin: Math.round(pos.xMin * 100) / 100,
      xMax: Math.round(pos.xMax * 100) / 100,
      yMin: Math.round(pos.yMin * 100) / 100,
      yMax: Math.round(pos.yMax * 100) / 100,
      zMin,
      zMax,
      area,
      ulpin: makeUlpin(buildingId, floorNumber, unitNumber),
      owner: owners[i % owners.length],
      status: i % 6 === 0 ? 'Vacant' : 'Active',
    };
  });
}

// ---------------------------------------------------------------------------
// SAMPLE OWNERS & GENERATORS
// ---------------------------------------------------------------------------

const sampleOwners = [
  'Dr. Rajesh Kumar', 'Prof. Anita Sharma', 'Mr. Vikram Singh', 'Ms. Priya Patel',
  'Dr. Suresh Mehta', 'Prof. Kavita Gupta', 'Mr. Arjun Reddy', 'Ms. Neha Joshi',
  'Dr. Amit Verma', 'Prof. Sunita Rao', 'Mr. Deepak Nair', 'Ms. Pooja Iyer',
  'Dr. Ramesh Choudhary', 'Prof. Meenakshi Sundaram', 'Mr. Tanmay Kapoor', 'Ms. Ritu Bansal',
];

function createBldgProperties(
  bldgId: string,
  numFloors: number,
  basements: number,
  width: number,
  depth: number,
  fHeight: number = 4,
  groundElev: number = 0
): SiteData['properties'] {
  const props: SiteData['properties'] = [];
  for (let i = -basements; i < numFloors; i++) {
    const label = i < 0 ? `B${Math.abs(i)}` : i === 0 ? 'G' : `F${i}`;
    const zMin = groundElev + i * fHeight;
    const zMax = zMin + fHeight;
    const types = i < 0
      ? ['Parking', 'Parking', 'Utility Corridor', 'Storage', 'Parking', 'Storage']
      : i === 0
        ? ['Commercial', 'Office', 'Commercial', 'Office', 'Commercial', 'Office']
        : ['Classroom', 'Laboratory', 'Office', 'Classroom', 'Laboratory', 'Office'];

    props.push(
      ...generateFloorProperties(
        bldgId,
        i,
        label,
        width,
        depth,
        zMin,
        zMax,
        types,
        sampleOwners.slice(((i + 10) * 3) % sampleOwners.length),
        0
      )
    );
  }
  return props;
}

// Generate properties for all 13 real LPU map buildings
const b025Props = createBldgProperties('B025', 6, 1, 45, 60, 4, 0);
const b026Props = createBldgProperties('B026', 7, 1, 100, 65, 4, 0);
const b027Props = createBldgProperties('B027', 5, 0, 40, 40, 4, 0);
const b028Props = createBldgProperties('B028', 5, 0, 40, 40, 4, 0);
const b029Props = createBldgProperties('B029', 6, 1, 70, 60, 4, 0);
const b030Props = createBldgProperties('B030', 7, 1, 65, 65, 4, 0);
const b037Props = createBldgProperties('B037', 6, 1, 75, 45, 4, 0);
const b036Props = createBldgProperties('B036', 6, 1, 80, 45, 4, 0);
const b035Props = createBldgProperties('B035', 5, 0, 65, 45, 4, 0);
const b034Props = createBldgProperties('B034', 5, 1, 85, 75, 5, 0);
const b033Props = createBldgProperties('B033', 10, 2, 85, 95, 4.5, 0);
const b011Props = createBldgProperties('B011', 3, 0, 55, 50, 4, 0);
const b038Props = createBldgProperties('B038', 6, 1, 110, 65, 4, 0);

// ---------------------------------------------------------------------------
// EXPORTED SITE DATA — REAL LPU MAP LAYOUT
// ---------------------------------------------------------------------------

export const sampleLPUData: SiteData = {
  metadata: {
    siteName: 'Lovely Professional University — Main Academic Quad',
    disclaimer:
      'SAMPLE REFERENCE DATA — NON-OFFICIAL LPU COORDINATES. ' +
      'Building layout matches LPU Phagwara campus blocks ' +
      '(Block 25, 26, 27, 28, Division of Admissions, Chancellory, Block 37, 36, 35, Auditorium, Block 33). ' +
      'Coordinates: 31.2536°N, 75.7037°E.',
    latitude: 31.2536,
    longitude: 75.7037,
    generatedAt: new Date().toISOString(),
    version: '2.0.0-lpu-map',
  },

  parcels: [
    {
      id: 'P001',
      name: 'North Academic Block Complex (LPU Open Audi Rd)',
      description: 'Block 25, 26, 27, 28, Division of Admissions & The Chancellory',
      footprint: [
        [-210, 45], [210, 45], [210, 135], [-210, 135],
      ],
      area: 37800,
      elevation: 0,
      color: '#3b82f6',
    },
    {
      id: 'P002',
      name: 'Diagonal Courtyard & Auditorium Sector',
      description: 'Block 37, 36, 35 & Shanti Devi Mittal Auditorium',
      footprint: [
        [-130, -170], [110, -170], [110, 45], [-130, 45],
      ],
      area: 51600,
      elevation: 0,
      color: '#a855f7',
    },
    {
      id: 'P003',
      name: 'School of Computer Science & Engineering Sector',
      description: 'Block 33 — CS & IT Labs',
      footprint: [
        [125, -170], [210, -170], [210, 45], [125, 45],
      ],
      area: 18275,
      elevation: 0,
      color: '#06b6d4',
    },
    {
      id: 'P004',
      name: 'Campus Services & Nanak Nagri Sector',
      description: 'Lovely Bake Studio, Sub Post Office & STP LPU',
      footprint: [
        [-210, -170], [-130, -170], [-130, 45], [-210, 45],
      ],
      area: 17200,
      elevation: 0,
      color: '#10b981',
    },
    {
      id: 'P005',
      name: 'School of Biosciences Sector (North Top)',
      description: 'School of Biosciences & Research Labs',
      footprint: [
        [-120, 145], [120, 145], [120, 220], [-120, 220],
      ],
      area: 18000,
      elevation: 0,
      color: '#f59e0b',
    },
  ],

  buildings: [
    // -----------------------------------------------------------------------
    // NORTH ACADEMIC COMPLEX (Along LPU Open Audi Rd — Y = 95)
    // -----------------------------------------------------------------------
    {
      id: 'B025',
      name: 'Block 25',
      parcelId: 'P001',
      position: { x: -175, y: 95 },
      width: 45,
      depth: 55,
      totalHeight: 24,
      numberOfFloors: 6,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 1,
      color: '#3b82f6',
    },
    {
      id: 'B026',
      name: 'Block 26 — Central Academic Complex',
      parcelId: 'P001',
      position: { x: -80, y: 95 },
      width: 95,
      depth: 55,
      totalHeight: 28,
      numberOfFloors: 7,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 1,
      color: '#2563eb',
    },
    {
      id: 'B027',
      name: 'Block 27',
      parcelId: 'P001',
      position: { x: -75, y: 20 },
      width: 40,
      depth: 40,
      totalHeight: 20,
      numberOfFloors: 5,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 0,
      color: '#0284c7',
    },
    {
      id: 'B028',
      name: 'Block 28',
      parcelId: 'P001',
      position: { x: 60, y: 20 },
      width: 40,
      depth: 40,
      totalHeight: 20,
      numberOfFloors: 5,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 0,
      color: '#0369a1',
    },
    {
      id: 'B029',
      name: 'Division of Admissions, LPU',
      parcelId: 'P001',
      position: { x: 65, y: 95 },
      width: 70,
      depth: 55,
      totalHeight: 24,
      numberOfFloors: 6,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 1,
      color: '#3b82f6',
    },
    {
      id: 'B030',
      name: 'The Chancellory',
      parcelId: 'P001',
      position: { x: 160, y: 95 },
      width: 65,
      depth: 55,
      totalHeight: 28,
      numberOfFloors: 7,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 1,
      color: '#1d4ed8',
    },

    // -----------------------------------------------------------------------
    // DIAGONAL COURTYARD SECTOR (South of LPU Open Audi Rd)
    // -----------------------------------------------------------------------
    {
      id: 'B037',
      name: 'Block 37',
      parcelId: 'P002',
      position: { x: -75, y: -55 },
      width: 75,
      depth: 45,
      totalHeight: 24,
      numberOfFloors: 6,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 1,
      color: '#a855f7',
    },
    {
      id: 'B036',
      name: 'Block 36',
      parcelId: 'P002',
      position: { x: -75, y: -135 },
      width: 80,
      depth: 45,
      totalHeight: 24,
      numberOfFloors: 6,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 1,
      color: '#8b5cf6',
    },
    {
      id: 'B035',
      name: 'Block 35',
      parcelId: 'P002',
      position: { x: 60, y: -135 },
      width: 65,
      depth: 45,
      totalHeight: 20,
      numberOfFloors: 5,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 0,
      color: '#7c3aed',
    },
    {
      id: 'B034',
      name: 'Shanti Devi Mittal Auditorium',
      parcelId: 'P002',
      position: { x: 60, y: -55 },
      width: 80,
      depth: 65,
      totalHeight: 25,
      numberOfFloors: 5,
      floorHeight: 5,
      groundElevation: 0,
      basementFloors: 1,
      color: '#c084fc',
    },

    // -----------------------------------------------------------------------
    // EAST & WEST SECTORS (Block 33, Biosciences, Lovely Bake Studio)
    // -----------------------------------------------------------------------
    {
      id: 'B033',
      name: 'Block 33 — School of Computer Science & Engineering',
      parcelId: 'P003',
      position: { x: 170, y: -40 },
      width: 75,
      depth: 90,
      totalHeight: 45,
      numberOfFloors: 10,
      floorHeight: 4.5,
      groundElevation: 0,
      basementFloors: 2,
      color: '#06b6d4',
    },
    {
      id: 'B011',
      name: 'Lovely Bake Studio & Services',
      parcelId: 'P004',
      position: { x: -175, y: -125 },
      width: 50,
      depth: 50,
      totalHeight: 12,
      numberOfFloors: 3,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 0,
      color: '#10b981',
    },
    {
      id: 'B038',
      name: 'School of Biosciences',
      parcelId: 'P005',
      position: { x: 0, y: 185 },
      width: 110,
      depth: 55,
      totalHeight: 24,
      numberOfFloors: 6,
      floorHeight: 4,
      groundElevation: 0,
      basementFloors: 1,
      color: '#f59e0b',
    },
  ],

  properties: [
    ...b025Props,
    ...b026Props,
    ...b027Props,
    ...b028Props,
    ...b029Props,
    ...b030Props,
    ...b037Props,
    ...b036Props,
    ...b035Props,
    ...b034Props,
    ...b033Props,
    ...b011Props,
    ...b038Props,
  ],

  undergroundUtilities: [
    {
      id: 'UTL-001',
      type: 'water',
      path: [
        { x: -160, y: 70 },
        { x: -75, y: 70 },
        { x: 0, y: 70 },
        { x: 75, y: 70 },
        { x: 155, y: 70 },
      ],
      depth: 3,
      diameter: 0.5,
      color: '#3b82f6',
      description: 'LPU Open Audi Rd Main Water Grid — connects Block 25, 26, Admissions & Chancellory',
    },
    {
      id: 'UTL-002',
      type: 'electrical',
      path: [
        { x: 0, y: 150 },
        { x: 0, y: 70 },
        { x: 0, y: -20 },
        { x: 0, y: -120 },
      ],
      depth: 2,
      diameter: 0.3,
      color: '#ef4444',
      description: 'North-South High-Voltage Power Line — connects Biosciences, Block 26, Block 37 & Block 35',
    },
  ],
};

export default sampleLPUData;

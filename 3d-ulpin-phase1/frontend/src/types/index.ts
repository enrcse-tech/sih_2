// ============================================================================
// 3D ULPIN Phase 1 — Type Definitions
// All interfaces for the cadastral data model and UI state
// ============================================================================

// ---------------------------------------------------------------------------
// GEOSPATIAL DATA TYPES
// ---------------------------------------------------------------------------

/** A land parcel — the base unit of land ownership */
export interface Parcel {
  id: string;
  name: string;
  description: string;
  /** Footprint vertices as [x, y] in meters relative to site center */
  footprint: [number, number][];
  /** Total area in m² */
  area: number;
  /** Ground elevation in meters */
  elevation: number;
  /** Hex color for rendering */
  color: string;
}

/** A building situated on a parcel */
export interface Building {
  id: string;
  name: string;
  /** Which parcel this building sits on */
  parcelId: string;
  /** Position relative to site center (meters) */
  position: { x: number; y: number };
  /** Building footprint width in meters (X axis) */
  width: number;
  /** Building footprint depth in meters (Y axis) */
  depth: number;
  /** Total above-ground height in meters */
  totalHeight: number;
  /** Number of above-ground floors */
  numberOfFloors: number;
  /** Height of each floor in meters */
  floorHeight: number;
  /** Starting elevation (usually 0) */
  groundElevation: number;
  /** Number of basement levels */
  basementFloors: number;
  /** Hex color for rendering */
  color: string;
}

/** A single floor within a building — Z ranges are ALWAYS computed */
export interface Floor {
  /** Format: "B001-FG", "B001-F01", "B001-FB1" */
  id: string;
  buildingId: string;
  /**
   * Floor number:
   * -2 = B2, -1 = B1, 0 = Ground, 1 = F1, 2 = F2, etc.
   */
  floorNumber: number;
  /** Display label: "B2", "B1", "G", "F1", "F2", etc. */
  label: string;
  /** Bottom of this floor (meters) — computed from building params */
  zMin: number;
  /** Top of this floor (meters) — computed from building params */
  zMax: number;
}

/** An individual property unit (apartment, office, etc.) within a floor */
export interface Property {
  id: string;
  buildingId: string;
  floorId: string;
  floorNumber: number;
  /** Unit identifier, e.g., "U301" */
  unitNumber: string;
  /** Property type: "Residential", "Commercial", "Laboratory", "Parking", "Utility Corridor" */
  type: PropertyType;
  /** Local X bounds within building (meters from building center) */
  xMin: number;
  xMax: number;
  /** Local Y bounds within building (meters from building center) */
  yMin: number;
  yMax: number;
  /** Z bounds — assigned from floor Z ranges */
  zMin: number;
  zMax: number;
  /** Floor area in m² */
  area: number;
  /** Prototype 3D ULPIN — generated deterministically */
  ulpin: string;
  /** Owner name (sample) */
  owner: string;
  /** Status: "Active", "Vacant", "Under Construction" */
  status: string;
}

export type PropertyType =
  | 'Residential'
  | 'Commercial'
  | 'Laboratory'
  | 'Parking'
  | 'Utility Corridor'
  | 'Office'
  | 'Classroom'
  | 'Library'
  | 'Storage';

/** An underground utility line */
export interface UndergroundUtility {
  id: string;
  /** Utility type: "water", "electrical", "sewer", "gas" */
  type: string;
  /** Path points as {x, y} in meters relative to site center */
  path: { x: number; y: number }[];
  /** Depth below surface in meters (positive value) */
  depth: number;
  /** Pipe/conduit diameter in meters */
  diameter: number;
  /** Hex color for rendering */
  color: string;
  /** Description of the utility */
  description: string;
}

// ---------------------------------------------------------------------------
// SITE DATA — Top-level container
// ---------------------------------------------------------------------------

export interface SiteMetadata {
  siteName: string;
  disclaimer: string;
  latitude: number;
  longitude: number;
  generatedAt: string;
  version: string;
}

export interface SiteData {
  metadata: SiteMetadata;
  parcels: Parcel[];
  buildings: Building[];
  properties: Property[];
  undergroundUtilities: UndergroundUtility[];
}

// ---------------------------------------------------------------------------
// UI STATE TYPES
// ---------------------------------------------------------------------------

export interface LayerVisibility {
  parcels: boolean;
  buildings: boolean;
  floors: boolean;
  properties: boolean;
  undergroundUtilities: boolean;
  dem: boolean;
  dsm: boolean;
  lidar: boolean;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// VALIDATION TYPES
// ---------------------------------------------------------------------------

export interface ValidationCheck {
  name: string;
  key: string;
  valid: boolean;
  message: string;
}

export interface ValidationResult {
  geometry: ValidationCheck;
  topology: ValidationCheck;
  overlap: ValidationCheck;
  floorAlignment: ValidationCheck;
  parcelLink: ValidationCheck;
  ulpinUnique: ValidationCheck;
}

// ---------------------------------------------------------------------------
// APP STATE
// ---------------------------------------------------------------------------

export interface AppState {
  siteData: SiteData;
  floors: Record<string, Floor[]>;
  layers: LayerVisibility;
  basemap: 'satellite' | 'streets' | 'dark';
  modelMode: 'architectural' | 'cadastral';
  timeOfDay: 'day' | 'sunset' | 'night';
  selectedBuilding: Building | null;
  selectedFloor: Floor | null;
  selectedProperty: Property | null;
  activityLog: ActivityLogEntry[];
  searchQuery: string;
  cursorPosition: { x: number; y: number; z: number } | null;
}

export type AppAction =
  | { type: 'TOGGLE_LAYER'; layer: keyof LayerVisibility }
  | { type: 'SET_BASEMAP'; basemap: 'satellite' | 'streets' | 'dark' }
  | { type: 'SET_MODEL_MODE'; mode: 'architectural' | 'cadastral' }
  | { type: 'SET_TIME_OF_DAY'; time: 'day' | 'sunset' | 'night' }
  | { type: 'SELECT_BUILDING'; building: Building | null }
  | { type: 'SELECT_FLOOR'; floor: Floor | null }
  | { type: 'SELECT_PROPERTY'; property: Property | null }
  | { type: 'RESET_SELECTION' }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_CURSOR_POSITION'; position: { x: number; y: number; z: number } | null }
  | { type: 'LOG_ACTIVITY'; action: string; detail: string };

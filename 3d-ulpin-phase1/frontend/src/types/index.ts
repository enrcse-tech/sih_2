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
  /** Whether this parcel is vacant (no buildings, no owner) */
  isVacant?: boolean;
  /** Owner info if registered */
  owner?: ParcelOwner;
}

/** Owner information for a parcel */
export interface ParcelOwner {
  name: string;
  contact: string;
  idType: 'Aadhaar' | 'PAN' | 'Passport';
  idNumber: string;
}

/** Registration data for a new building on a vacant parcel */
export interface BuildingRegistration {
  parcelId: string;
  owner: ParcelOwner;
  buildingName: string;
  numberOfFloors: number;
  floorHeight: number;
  width: number;
  depth: number;
  basementFloors: number;
  buildingType: 'Academic' | 'Residential' | 'Commercial' | 'Mixed-Use';
  floorPlanImages: string[];      // base64 data URLs
  buildingDesignImages: string[];  // base64 data URLs
  buildingPhotos: string[];        // base64 data URLs
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
  /** GPS latitude (optional — for real-world map placement) */
  latitude?: number;
  /** GPS longitude (optional — for real-world map placement) */
  longitude?: number;
  /** Whether this building was dynamically registered (not sample data) */
  isRegistered?: boolean;
  /** Reference images from the registration */
  registrationImages?: {
    floorPlans: string[];
    buildingDesigns: string[];
    photos: string[];
  };
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
  /** Utility type: "water", "sewer", "electrical", "gas" */
  type: 'water' | 'sewer' | 'electrical' | 'gas' | string;
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
  /** Pipe material (e.g. "HDPE PN16", "RCC Class NP3") */
  material?: string;
  /** Flow pressure or gravity gradient (e.g. "4.2 bar / 520 LPM", "1:150 Gravity Slope") */
  flowRateOrSlope?: string;
  /** List of building IDs connected to this pipeline */
  connectedBuildingIds?: string[];
  /** Manhole / inspection chamber surface locations */
  manholes?: { x: number; y: number; label: string }[];
  /** Vertical riser stubs connecting underground line to building basements */
  risers?: { x: number; y: number; buildingId: string; height: number }[];
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
// VIEW MODE — Map vs 3D Interior
// ---------------------------------------------------------------------------

export type ViewMode = 'map' | '3d-interior';

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
  viewMode: ViewMode;
  selectedBuilding: Building | null;
  selectedFloor: Floor | null;
  selectedProperty: Property | null;
  selectedParcel: Parcel | null;
  selectedUtility: UndergroundUtility | null;
  undergroundXRay: boolean;
  showRegistrationModal: boolean;
  activityLog: ActivityLogEntry[];
  searchQuery: string;
  cursorPosition: { x: number; y: number; z: number } | null;
}

export type AppAction =
  | { type: 'TOGGLE_LAYER'; layer: keyof LayerVisibility }
  | { type: 'SET_BASEMAP'; basemap: 'satellite' | 'streets' | 'dark' }
  | { type: 'SET_MODEL_MODE'; mode: 'architectural' | 'cadastral' }
  | { type: 'SET_TIME_OF_DAY'; time: 'day' | 'sunset' | 'night' }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SELECT_BUILDING'; building: Building | null }
  | { type: 'SELECT_FLOOR'; floor: Floor | null }
  | { type: 'SELECT_PROPERTY'; property: Property | null }
  | { type: 'SELECT_PARCEL'; parcel: Parcel | null }
  | { type: 'SELECT_UTILITY'; utility: UndergroundUtility | null }
  | { type: 'TOGGLE_UNDERGROUND_XRAY' }
  | { type: 'OPEN_REGISTRATION_MODAL' }
  | { type: 'CLOSE_REGISTRATION_MODAL' }
  | { type: 'REGISTER_BUILDING'; registration: BuildingRegistration; newBuilding: Building; newProperties: Property[]; newFloors: Floor[] }
  | { type: 'RESET_SELECTION' }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_CURSOR_POSITION'; position: { x: number; y: number; z: number } | null }
  | { type: 'LOG_ACTIVITY'; action: string; detail: string };

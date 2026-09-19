// ============================================================================
// 3D ULPIN Phase 1 — App Context
// Centralized state management using React Context + useReducer
// ============================================================================

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import type { AppState, AppAction, LayerVisibility, Property, ActivityLogEntry } from '../types';
import { sampleLPUData } from '../data/sampleLPU';
import { generateAllFloors } from '../services/buildingGenerator';

// ---------------------------------------------------------------------------
// INITIAL STATE
// ---------------------------------------------------------------------------

const initialLayers: LayerVisibility = {
  parcels: true,
  buildings: true,
  floors: true,
  properties: true,
  undergroundUtilities: true,
  dem: false,
  dsm: false,
  lidar: false,
};

const initialFloors = generateAllFloors(sampleLPUData.buildings);

const initialState: AppState = {
  siteData: sampleLPUData,
  floors: initialFloors,
  layers: initialLayers,
  basemap: 'satellite',
  modelMode: 'architectural',
  timeOfDay: 'day',
  viewMode: 'map',
  selectedBuilding: null,
  selectedFloor: null,
  selectedProperty: null,
  selectedParcel: null,
  showRegistrationModal: false,
  activityLog: [
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      action: 'System',
      detail: `Loaded ${sampleLPUData.properties.length} properties across ${sampleLPUData.buildings.length} buildings`,
    },
  ],
  searchQuery: '',
  cursorPosition: null,
};

// ---------------------------------------------------------------------------
// REDUCER
// ---------------------------------------------------------------------------

function appReducer(state: AppState, action: AppAction): AppState {
  const now = new Date().toISOString();
  const newLogEntry = (actionStr: string, detail: string): ActivityLogEntry => ({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now,
    action: actionStr,
    detail,
  });

  switch (action.type) {
    case 'TOGGLE_LAYER': {
      const newLayers = { ...state.layers, [action.layer]: !state.layers[action.layer] };
      return {
        ...state,
        layers: newLayers,
        activityLog: [
          newLogEntry('Layer', `${action.layer} ${newLayers[action.layer] ? 'shown' : 'hidden'}`),
          ...state.activityLog,
        ].slice(0, 50),
      };
    }

    case 'SET_BASEMAP': {
      return {
        ...state,
        basemap: action.basemap,
        activityLog: [
          newLogEntry('Basemap', `Switched ground map to ${action.basemap.toUpperCase()}`),
          ...state.activityLog,
        ].slice(0, 50),
      };
    }

    case 'SET_MODEL_MODE': {
      return {
        ...state,
        modelMode: action.mode,
        activityLog: [
          newLogEntry('3D Render Mode', `Switched building model to ${action.mode.toUpperCase()}`),
          ...state.activityLog,
        ].slice(0, 50),
      };
    }

    case 'SET_TIME_OF_DAY': {
      return {
        ...state,
        timeOfDay: action.time,
        activityLog: [
          newLogEntry('Environment', `Lighting switched to ${action.time.toUpperCase()} mode`),
          ...state.activityLog,
        ].slice(0, 50),
      };
    }

    case 'SET_VIEW_MODE': {
      return {
        ...state,
        viewMode: action.mode,
        activityLog: [
          newLogEntry('View', `Switched to ${action.mode === 'map' ? 'Map View' : '3D Interior View'}`),
          ...state.activityLog,
        ].slice(0, 50),
      };
    }

    case 'SELECT_BUILDING': {
      if (action.building?.id === state.selectedBuilding?.id) {
        // Deselect
        return {
          ...state,
          selectedBuilding: null,
          selectedFloor: null,
          selectedProperty: null,
          activityLog: [
            newLogEntry('Selection', 'Building deselected'),
            ...state.activityLog,
          ].slice(0, 50),
        };
      }
      return {
        ...state,
        selectedBuilding: action.building,
        selectedFloor: null,
        selectedProperty: null,
        activityLog: action.building
          ? [
              newLogEntry('Selection', `Selected building ${action.building.id} (${action.building.name})`),
              ...state.activityLog,
            ].slice(0, 50)
          : state.activityLog,
      };
    }

    case 'SELECT_FLOOR': {
      if (action.floor?.id === state.selectedFloor?.id) {
        // Deselect floor
        return {
          ...state,
          selectedFloor: null,
          selectedProperty: null,
          activityLog: [
            newLogEntry('Selection', 'Floor deselected — showing all floors'),
            ...state.activityLog,
          ].slice(0, 50),
        };
      }
      return {
        ...state,
        selectedFloor: action.floor,
        selectedProperty: null,
        activityLog: action.floor
          ? [
              newLogEntry('Selection', `Selected floor ${action.floor.label} (Z: ${action.floor.zMin}–${action.floor.zMax}m)`),
              ...state.activityLog,
            ].slice(0, 50)
          : state.activityLog,
      };
    }

    case 'SELECT_PROPERTY': {
      if (action.property?.id === state.selectedProperty?.id) {
        return {
          ...state,
          selectedProperty: null,
          activityLog: [
            newLogEntry('Selection', 'Property deselected'),
            ...state.activityLog,
          ].slice(0, 50),
        };
      }

      // Also auto-select the building and floor for this property
      let building = state.selectedBuilding;
      let floor = state.selectedFloor;

      if (action.property) {
        building = state.siteData.buildings.find(b => b.id === action.property!.buildingId) || null;
        const buildingFloors = state.floors[action.property.buildingId] || [];
        floor = buildingFloors.find(f => f.floorNumber === action.property!.floorNumber) || null;
      }

      return {
        ...state,
        selectedBuilding: building,
        selectedFloor: floor,
        selectedProperty: action.property,
        activityLog: action.property
          ? [
              newLogEntry('Selection', `Selected property ${action.property.unitNumber} (${action.property.ulpin})`),
              ...state.activityLog,
            ].slice(0, 50)
          : state.activityLog,
      };
    }

    case 'RESET_SELECTION':
      return {
        ...state,
        selectedBuilding: null,
        selectedFloor: null,
        selectedProperty: null,
        activityLog: [
          newLogEntry('Selection', 'All selections cleared'),
          ...state.activityLog,
        ].slice(0, 50),
      };

    case 'SELECT_PARCEL': {
      return {
        ...state,
        selectedParcel: action.parcel,
        activityLog: action.parcel
          ? [
              newLogEntry('Selection', `Selected parcel ${action.parcel.id} (${action.parcel.name})`),
              ...state.activityLog,
            ].slice(0, 50)
          : state.activityLog,
      };
    }

    case 'OPEN_REGISTRATION_MODAL': {
      return {
        ...state,
        showRegistrationModal: true,
        activityLog: [
          newLogEntry('Registration', 'Opened building registration form'),
          ...state.activityLog,
        ].slice(0, 50),
      };
    }

    case 'CLOSE_REGISTRATION_MODAL': {
      return {
        ...state,
        showRegistrationModal: false,
        selectedParcel: null,
      };
    }

    case 'REGISTER_BUILDING': {
      const { registration, newBuilding, newProperties, newFloors } = action;
      // Update parcel to no longer be vacant
      const updatedParcels = state.siteData.parcels.map(p =>
        p.id === registration.parcelId
          ? { ...p, isVacant: false, owner: registration.owner }
          : p
      );

      return {
        ...state,
        siteData: {
          ...state.siteData,
          parcels: updatedParcels,
          buildings: [...state.siteData.buildings, newBuilding],
          properties: [...state.siteData.properties, ...newProperties],
        },
        floors: {
          ...state.floors,
          [newBuilding.id]: newFloors,
        },
        showRegistrationModal: false,
        selectedParcel: null,
        selectedBuilding: newBuilding,
        activityLog: [
          newLogEntry('Registration', `Registered new building "${newBuilding.name}" (${newBuilding.id}) on parcel ${registration.parcelId} — ${newBuilding.numberOfFloors} floors, ${newProperties.length} units`),
          ...state.activityLog,
        ].slice(0, 50),
      };
    }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

    case 'SET_CURSOR_POSITION':
      return { ...state, cursorPosition: action.position };

    case 'LOG_ACTIVITY':
      return {
        ...state,
        activityLog: [
          newLogEntry(action.action, action.detail),
          ...state.activityLog,
        ].slice(0, 50),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// CONTEXT
// ---------------------------------------------------------------------------

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  /** Properties for the currently selected floor (or all if no floor selected) */
  currentFloorProperties: Property[];
  /** Search-filtered properties */
  filteredProperties: Property[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Log initialization
  useEffect(() => {
    dispatch({
      type: 'LOG_ACTIVITY',
      action: 'System',
      detail: 'Dashboard initialized — Phase 1 Prototype',
    });
  }, []);

  // Compute derived data
  const currentFloorProperties = useMemo(() => {
    if (!state.selectedBuilding) return state.siteData.properties;
    
    let props = state.siteData.properties.filter(
      p => p.buildingId === state.selectedBuilding!.id
    );

    if (state.selectedFloor) {
      props = props.filter(p => p.floorNumber === state.selectedFloor!.floorNumber);
    }

    return props;
  }, [state.selectedBuilding, state.selectedFloor, state.siteData.properties]);

  const filteredProperties = useMemo(() => {
    if (!state.searchQuery.trim()) return [];
    const q = state.searchQuery.toLowerCase().trim();
    return state.siteData.properties.filter(
      p =>
        p.id.toLowerCase().includes(q) ||
        p.ulpin.toLowerCase().includes(q) ||
        p.unitNumber.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.buildingId.toLowerCase().includes(q)
    );
  }, [state.searchQuery, state.siteData.properties]);

  const value = useMemo(
    () => ({ state, dispatch, currentFloorProperties, filteredProperties }),
    [state, dispatch, currentFloorProperties, filteredProperties]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

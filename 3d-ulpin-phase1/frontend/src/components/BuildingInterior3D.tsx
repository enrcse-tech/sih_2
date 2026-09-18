// ============================================================================
// 3D ULPIN Phase 2 — Building Interior 3D View
// Wraps the existing SceneViewer with a "Back to Map" overlay
// Shown when user clicks "Enter 3D Interior" from the map popup
// ============================================================================

import { ArrowLeft, Map as MapIcon, Building2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import SceneViewer from './SceneViewer';

export default function BuildingInterior3D() {
  const { state, dispatch } = useAppContext();

  const handleBackToMap = () => {
    dispatch({ type: 'SET_VIEW_MODE', mode: 'map' });
    dispatch({ type: 'LOG_ACTIVITY', action: 'Navigation', detail: 'Returned to Map View' });
  };

  return (
    <div className="interior-3d-container" id="interior-3d-view">
      {/* Back to Map Floating Button */}
      <div className="interior-back-bar">
        <button className="interior-back-btn" onClick={handleBackToMap}>
          <ArrowLeft size={16} />
          <MapIcon size={14} />
          <span>Back to Map</span>
        </button>

        {state.selectedBuilding && (
          <div className="interior-building-info">
            <Building2 size={14} />
            <span className="interior-building-id">{state.selectedBuilding.id}</span>
            <span className="interior-building-name">{state.selectedBuilding.name}</span>
            <span className="interior-building-floors">
              {state.selectedBuilding.numberOfFloors} Floors · {state.selectedBuilding.totalHeight}m
            </span>
          </div>
        )}
      </div>

      {/* Existing 3D Scene */}
      <SceneViewer />
    </div>
  );
}

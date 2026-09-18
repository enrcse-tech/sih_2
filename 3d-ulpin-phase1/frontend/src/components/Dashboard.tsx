// ============================================================================
// 3D ULPIN Phase 2 — Dashboard Layout
// Master grid layout with conditional Map / 3D Interior views
// ============================================================================

import TopBar from './TopBar';
import LayerControl from './LayerControl';
import MapView from './MapView';
import BuildingInterior3D from './BuildingInterior3D';
import PropertyDetails from './PropertyDetails';
import BottomPanel from './BottomPanel';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const { state } = useAppContext();

  return (
    <div className="dashboard">
      <TopBar />
      {state.viewMode === 'map' ? (
        <>
          {/* Map View — full area, no side panels */}
          <MapView />
          <PropertyDetails />
        </>
      ) : (
        <>
          {/* 3D Interior View — original layout with all panels */}
          <LayerControl />
          <BuildingInterior3D />
          <PropertyDetails />
          <BottomPanel />
        </>
      )}
    </div>
  );
}

// ============================================================================
// 3D ULPIN Phase 1 — Dashboard Layout
// Master grid layout assembling all panels
// ============================================================================

import TopBar from './TopBar';
import LayerControl from './LayerControl';
import SceneViewer from './SceneViewer';
import PropertyDetails from './PropertyDetails';
import BottomPanel from './BottomPanel';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <TopBar />
      <LayerControl />
      <SceneViewer />
      <PropertyDetails />
      <BottomPanel />
    </div>
  );
}

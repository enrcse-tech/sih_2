// ============================================================================
// 3D ULPIN Phase 1 — App Entry Point
// ============================================================================

import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}

export default App;

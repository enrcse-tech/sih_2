// ============================================================================
// 3D ULPIN Phase 1 — Layer Control & Tools (Left Panel)
// Toggle switches for layers + tool buttons
// ============================================================================

import {
  Map, Building2, Layers, Box, Wrench, Mountain, Satellite, Scan,
  MousePointer, Ruler, RotateCcw, CheckCircle, FileUp, Globe, Eye, Sun, Moon, Sunset,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { LayerVisibility } from '../types';
import FloorSelector from './FloorSelector';

interface LayerDef {
  key: keyof LayerVisibility;
  label: string;
  icon: React.ReactNode;
  phase2?: boolean;
}

const layers: LayerDef[] = [
  { key: 'parcels', label: 'Parcels', icon: <Map size={14} /> },
  { key: 'buildings', label: 'Buildings', icon: <Building2 size={14} /> },
  { key: 'floors', label: 'Floors', icon: <Layers size={14} /> },
  { key: 'properties', label: 'Properties', icon: <Box size={14} /> },
  { key: 'undergroundUtilities', label: 'Underground', icon: <Wrench size={14} /> },
  { key: 'dem', label: 'DEM', icon: <Mountain size={14} />, phase2: true },
  { key: 'dsm', label: 'DSM', icon: <Satellite size={14} />, phase2: true },
  { key: 'lidar', label: 'LiDAR', icon: <Scan size={14} />, phase2: true },
];

interface ToolDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  phase2?: boolean;
}

export default function LayerControl() {
  const { state, dispatch } = useAppContext();

  const tools: ToolDef[] = [
    { id: 'select', label: 'Select', icon: <MousePointer size={14} /> },
    { id: 'measure', label: 'Measure', icon: <Ruler size={14} />, phase2: true },
    { id: 'reset', label: 'Reset View', icon: <RotateCcw size={14} />, action: () => {
      dispatch({ type: 'RESET_SELECTION' });
      dispatch({ type: 'LOG_ACTIVITY', action: 'Camera', detail: 'View reset to default position' });
      window.dispatchEvent(new CustomEvent('reset-camera'));
    }},
    { id: 'validate', label: 'Validation', icon: <CheckCircle size={14} />, action: () => {
      dispatch({ type: 'LOG_ACTIVITY', action: 'Validation', detail: 'Running validation on all properties...' });
    }},
    { id: 'import', label: 'Data Import', icon: <FileUp size={14} />, phase2: true },
  ];

  return (
    <div className="left-panel">
      {/* Basemap Section */}
      <div className="panel-section">
        <div className="panel-section-title">
          <Globe size={12} />
          Ground Basemap (Google Maps)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 4 }}>
          <button
            className={`basemap-btn ${state.basemap === 'satellite' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_BASEMAP', basemap: 'satellite' })}
            title="Google Satellite / Hybrid Imagery Basemap"
          >
            <Satellite size={12} />
            <span>Satellite</span>
          </button>
          <button
            className={`basemap-btn ${state.basemap === 'streets' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_BASEMAP', basemap: 'streets' })}
            title="Google Roadmap Basemap"
          >
            <Map size={12} />
            <span>Streets</span>
          </button>
          <button
            className={`basemap-btn ${state.basemap === 'dark' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_BASEMAP', basemap: 'dark' })}
            title="Dark GIS Grid Mode"
          >
            <Eye size={12} />
            <span>Grid</span>
          </button>
        </div>
        
        {/* Real Google Maps Direct Satellite Quick Link */}
        <a
          href="https://www.google.com/maps?q=31.2536,75.7037&z=18&t=k"
          target="_blank"
          rel="noopener noreferrer"
          className="basemap-btn"
          style={{
            marginTop: 6,
            width: '100%',
            justifyContent: 'center',
            gap: 6,
            background: 'rgba(6, 182, 212, 0.12)',
            borderColor: 'var(--accent-cyan)',
            color: 'var(--accent-cyan)',
            textDecoration: 'none',
            fontSize: 11,
            fontWeight: 600,
          }}
          title="Open LPU Phagwara Location on Google Maps"
        >
          📍 Open in Google Maps (31.2536° N, 75.7037° E) ↗
        </a>
      </div>

      {/* Lighting & Environment Section */}
      <div className="panel-section">
        <div className="panel-section-title">
          <Sun size={12} />
          Lighting & Atmosphere
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 4 }}>
          <button
            className={`basemap-btn ${state.timeOfDay === 'day' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TIME_OF_DAY', time: 'day' })}
            title="Bright Direct Sunlight & Sky Reflections"
          >
            <Sun size={12} style={{ color: '#f59e0b' }} />
            <span>Day</span>
          </button>
          <button
            className={`basemap-btn ${state.timeOfDay === 'sunset' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TIME_OF_DAY', time: 'sunset' })}
            title="Golden Hour Sunset & Low-Angle Shadows"
          >
            <Sunset size={12} style={{ color: '#f97316' }} />
            <span>Sunset</span>
          </button>
          <button
            className={`basemap-btn ${state.timeOfDay === 'night' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TIME_OF_DAY', time: 'night' })}
            title="Photorealistic Night Mode with Lit Windows & Streetlamps"
          >
            <Moon size={12} style={{ color: '#a855f7' }} />
            <span>Night</span>
          </button>
        </div>
      </div>

      {/* 3D Building Model Style Section */}
      <div className="panel-section">
        <div className="panel-section-title">
          <Box size={12} />
          3D Building Model Style
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
          <button
            className={`basemap-btn ${state.modelMode === 'architectural' ? 'active' : ''}`}
            style={{ flexDirection: 'row', gap: 6, padding: '6px 8px' }}
            onClick={() => dispatch({ type: 'SET_MODEL_MODE', mode: 'architectural' })}
            title="Detailed Architectural 3D Building Model (Blender Realism)"
          >
            <Building2 size={13} />
            <span>Blender 3D</span>
          </button>
          <button
            className={`basemap-btn ${state.modelMode === 'cadastral' ? 'active' : ''}`}
            style={{ flexDirection: 'row', gap: 6, padding: '6px 8px' }}
            onClick={() => dispatch({ type: 'SET_MODEL_MODE', mode: 'cadastral' })}
            title="Transparent Cadastral Volumetric Wireframe"
          >
            <Box size={13} />
            <span>Wireframe</span>
          </button>
        </div>
      </div>

      {/* Layers Section */}
      <div className="panel-section">
        <div className="panel-section-title">
          <Layers size={12} />
          Layers
        </div>
        {layers.map((layer) => (
          <div key={layer.key} className="layer-item-container">
            <div
              className="layer-toggle"
              onClick={() => {
                if (!layer.phase2) {
                  dispatch({ type: 'TOGGLE_LAYER', layer: layer.key });
                }
              }}
              title={layer.phase2 ? 'Available in Phase 2' : `Toggle ${layer.label}`}
            >
              <div className={`layer-toggle-label ${layer.phase2 ? 'disabled' : ''}`}>
                {layer.icon}
                <span>{layer.label}</span>
                {layer.phase2 && (
                  <span style={{ fontSize: 9, color: 'var(--accent-amber)', fontWeight: 600 }}>P2</span>
                )}
              </div>
              <div
                className={`toggle-switch ${state.layers[layer.key] ? 'active' : ''} ${
                  layer.phase2 ? 'disabled' : ''
                }`}
                style={layer.phase2 ? { opacity: 0.3 } : {}}
              />
            </div>
            {layer.key === 'undergroundUtilities' && state.layers.undergroundUtilities && (
              <div
                className="underground-subpanel animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* X-Ray Ground Toggle */}
                <div
                  className="underground-xray-toggle"
                  onClick={() => dispatch({ type: 'TOGGLE_UNDERGROUND_XRAY' })}
                  title="Toggle Subterranean Transparent Ground"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-main)' }}>
                    <Eye size={12} style={{ color: state.undergroundXRay ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                    Subsurface X-Ray Ground
                  </span>
                  <span className={`badge ${state.undergroundXRay ? 'badge-active' : ''}`} style={{ fontSize: 9, padding: '1px 6px' }}>
                    {state.undergroundXRay ? 'ON' : 'OFF'}
                  </span>
                </div>

                {/* Subterranean Network Legend */}
                <div className="utility-legend-list">
                  <div className="utility-legend-item">
                    <span className="utility-legend-dot" style={{ background: '#0284c7', boxShadow: '0 0 6px #38bdf8' }} />
                    <div className="utility-legend-info">
                      <span className="utility-legend-title" style={{ color: '#38bdf8' }}>💧 Water Supply</span>
                      <span className="utility-legend-desc">Pressurized Mains (2.2m)</span>
                    </div>
                  </div>
                  <div className="utility-legend-item">
                    <span className="utility-legend-dot" style={{ background: '#ea580c', boxShadow: '0 0 6px #f97316' }} />
                    <div className="utility-legend-info">
                      <span className="utility-legend-title" style={{ color: '#fb923c' }}>☣️ Sewage System</span>
                      <span className="utility-legend-desc">Gravity to STP (3.8m)</span>
                    </div>
                  </div>
                  <div className="utility-legend-item">
                    <span className="utility-legend-dot" style={{ background: '#ef4444', boxShadow: '0 0 6px #f87171' }} />
                    <div className="utility-legend-info">
                      <span className="utility-legend-title" style={{ color: '#f87171' }}>⚡ 11kV Power Grid</span>
                      <span className="utility-legend-desc">Armored Ducts (1.8m)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tools Section */}
      <div className="panel-section">
        <div className="panel-section-title">
          <MousePointer size={12} />
          Tools
        </div>
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-btn ${tool.id === 'select' ? 'active' : ''} ${tool.phase2 ? 'disabled' : ''}`}
            onClick={tool.action}
            title={tool.phase2 ? 'Available in Phase 2' : tool.label}
            disabled={tool.phase2}
          >
            {tool.icon}
            <span>{tool.label}</span>
            {tool.phase2 && (
              <span style={{ fontSize: 9, color: 'var(--accent-amber)', marginLeft: 'auto' }}>P2</span>
            )}
          </button>
        ))}
      </div>

      {/* Floor Selector (shows when building is selected) */}
      {state.selectedBuilding && (
        <div className="panel-section animate-fade-in">
          <FloorSelector />
        </div>
      )}
    </div>
  );
}

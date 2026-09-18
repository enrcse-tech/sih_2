// ============================================================================
// 3D ULPIN Phase 1 — Redesigned Bottom Panel (Collapsible GIS Dock)
// Tabbed data tables for Parcels, Floor Plan, Validation, Activity Log & Google Map
// ============================================================================

import { useState, useMemo } from 'react';
import { ExternalLink, MapPin, Satellite, Map as MapIcon, ChevronUp, ChevronDown, CheckCircle, Table, Activity, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { validateAllProperties } from '../services/validationService';

type Tab = 'parcels' | 'floorplan' | 'validation' | 'log' | 'googlemap';

export default function BottomPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('parcels');
  const [expanded, setExpanded] = useState(false);
  const [mapType, setMapType] = useState<'k' | 'm'>('k'); // k = satellite, m = roadmap
  const { state, currentFloorProperties } = useAppContext();
  const { siteData, floors, selectedFloor, selectedBuilding, activityLog } = state;

  // Compute validation summary
  const validationSummary = useMemo(() => {
    return validateAllProperties(
      siteData.properties,
      floors,
      siteData.buildings,
      siteData.parcels
    );
  }, [siteData, floors]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'parcels', label: 'Parcels', icon: <Table size={13} />, count: siteData.parcels.length },
    { id: 'floorplan', label: 'Floor Plan', icon: <Table size={13} />, count: selectedFloor ? currentFloorProperties.length : undefined },
    { id: 'validation', label: 'Validation', icon: <CheckCircle size={13} /> },
    { id: 'log', label: 'Activity Log', icon: <Activity size={13} />, count: activityLog.length },
    { id: 'googlemap', label: 'Google Map Center', icon: <Globe size={13} /> },
  ];

  return (
    <div className={`bottom-panel ${expanded ? 'expanded' : ''}`}>
      {/* Tabs & Drawer Toggle */}
      <div className="bottom-tabs">
        <div className="bottom-tab-group">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`bottom-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (!expanded) setExpanded(true);
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{ opacity: 0.7, fontSize: 11 }}>({tab.count})</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Expand / Collapse Button */}
        <button
          className="pip-action-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-cyan)', padding: '4px 10px' }}
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse Bottom Data Dock' : 'Expand Data Dock'}
        >
          <span>{expanded ? 'Collapse Data Dock' : 'Expand Data Table'}</span>
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Content Area */}
      <div className="bottom-content">
        {/* Parcels Tab */}
        {activeTab === 'parcels' && (
          <table className="mini-table">
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Name</th>
                <th>Area (m²)</th>
                <th>Buildings Sited</th>
                <th>Ground Elevation</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {siteData.parcels.map((parcel) => {
                const buildingCount = siteData.buildings.filter((b) => b.parcelId === parcel.id).length;
                return (
                  <tr key={parcel.id}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {parcel.id}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{parcel.name}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>
                      {parcel.area.toLocaleString()} m²
                    </td>
                    <td>{buildingCount} Buildings</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{parcel.elevation}m ASL</td>
                    <td style={{ fontSize: 11, color: 'var(--text-sub)' }}>{parcel.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Floor Plan Tab */}
        {activeTab === 'floorplan' && (
          <>
            {!selectedFloor ? (
              <div style={{ color: 'var(--text-sub)', fontSize: 12, padding: '12px 0', textAlign: 'center' }}>
                {selectedBuilding
                  ? 'Select a floor from the left panel (Floor Selector) to view its 3D property units.'
                  : 'Select a building on the map and choose a floor to inspect the floor plan.'}
              </div>
            ) : (
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Type</th>
                    <th>Area (m²)</th>
                    <th>X Range</th>
                    <th>Y Range</th>
                    <th>Z Elevation</th>
                    <th>Prototype 3D ULPIN</th>
                    <th>Owner</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFloorProperties.map((prop) => {
                    const isSelected = state.selectedProperty?.id === prop.id;
                    return (
                      <tr
                        key={prop.id}
                        onClick={() => {
                          dispatch({ type: 'SELECT_PROPERTY', property: prop });
                          window.dispatchEvent(new CustomEvent('fly-to-property', { detail: prop }));
                        }}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(6, 182, 212, 0.15)' : undefined,
                          transition: 'background 0.15s ease',
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
                          {prop.unitNumber} {isSelected ? '●' : ''}
                        </td>
                        <td>
                          <span className={`type-badge ${prop.type.toLowerCase().replace(' ', '-')}`}>
                            {prop.type}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{prop.area.toFixed(1)}</td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                          {prop.xMin.toFixed(1)}–{prop.xMax.toFixed(1)}m
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                          {prop.yMin.toFixed(1)}–{prop.yMax.toFixed(1)}m
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                          {prop.zMin.toFixed(1)}–{prop.zMax.toFixed(1)}m
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent-cyan)' }}>
                          {prop.ulpin}
                        </td>
                        <td style={{ fontSize: 11 }}>{prop.owner}</td>
                        <td>
                          <span style={{
                            color: prop.status === 'Active' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                            fontSize: 11,
                            fontWeight: 700,
                          }}>
                            {prop.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div>
            <div style={{ display: 'flex', gap: 32, marginBottom: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {validationSummary.valid}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Valid Units</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: validationSummary.issues > 0 ? 'var(--accent-rose)' : 'var(--text-sub)' }}>
                  {validationSummary.issues}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Spatial Issues</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)' }}>
                  {validationSummary.total}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Total 3D Units</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {validationSummary.total > 0
                    ? ((validationSummary.valid / validationSummary.total) * 100).toFixed(0)
                    : 0}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Pass Rate</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', borderTop: '1px solid var(--border-glass)', paddingTop: 8 }}>
              Automated 3D Cadastral Validation checks 6 topology parameters: 3D Geometry Bounding, Polygon Enclosure, Non-overlapping 3D Volumes, Floor Elevation Alignment, Parcel Linking & ULPIN Uniqueness.
            </div>
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'log' && (
          <div>
            {activityLog.map((entry) => (
              <div key={entry.id} className="activity-entry" style={{ display: 'flex', gap: 12, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11 }}>
                <span style={{ color: 'var(--text-sub)', fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                  {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, minWidth: 80 }}>{entry.action}</span>
                <span style={{ color: 'var(--text-muted)' }}>{entry.detail}</span>
              </div>
            ))}
          </div>
        )}

        {/* Google Map Tab */}
        {activeTab === 'googlemap' && (
          <div style={{ display: 'flex', gap: 16, height: '100%', alignItems: 'stretch' }}>
            <div style={{ flex: 1, position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-glass)', minHeight: 140 }}>
              <iframe
                title="LPU Google Map Full"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=31.2536,75.7037+(Lovely+Professional+University)&t=${mapType}&z=17&ie=UTF8&iwloc=&output=embed`}
              />
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, background: 'rgba(15,23,42,0.85)', padding: 4, borderRadius: 8, backdropFilter: 'blur(8px)' }}>
                <button
                  className={`tool-btn ${mapType === 'k' ? 'active' : ''}`}
                  style={{ padding: '3px 10px', fontSize: 11 }}
                  onClick={() => setMapType('k')}
                >
                  <Satellite size={12} /> Satellite
                </button>
                <button
                  className={`tool-btn ${mapType === 'm' ? 'active' : ''}`}
                  style={{ padding: '3px 10px', fontSize: 11 }}
                  onClick={() => setMapType('m')}
                >
                  <MapIcon size={12} /> Map
                </button>
              </div>
            </div>
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={15} /> Lovely Professional University
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                Jalandhar - Delhi G.T. Road, Phagwara, Punjab 144411
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: 'var(--bg-card)', padding: 8, borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                <div><span style={{ color: 'var(--text-sub)' }}>Lat:</span> 31.2536° N</div>
                <div><span style={{ color: 'var(--text-sub)' }}>Lon:</span> 75.7037° E</div>
                <div><span style={{ color: 'var(--text-sub)' }}>Elevation:</span> 234m</div>
                <div><span style={{ color: 'var(--text-sub)' }}>EPSG:</span> 4326/32643</div>
              </div>
              <a
                href="https://www.google.com/maps/@31.2536,75.7037,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn primary"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 'auto', fontSize: 11, padding: '7px 12px' }}
              >
                <ExternalLink size={12} /> Open in Google Maps App
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

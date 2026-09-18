// ============================================================================
// 3D ULPIN Phase 1 — Redesigned Top Bar
// Sleek floating glass bar with logo, global search, live stats & controls
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Box, Layers, Building2, Map as MapIcon, Globe2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function TopBar() {
  const { state, dispatch, filteredProperties } = useAppContext();
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const totalProps = state.siteData.properties.length;
  const totalBuildings = state.siteData.buildings.length;
  const totalParcels = state.siteData.parcels.length;

  return (
    <div className="topbar">
      {/* Brand Logo */}
      <div className="topbar-logo">
        <div className="topbar-logo-icon">3D</div>
        <div>
          <span style={{ color: 'var(--accent-cyan)' }}>3D ULPIN</span> GIS{' '}
          <span style={{ color: 'var(--text-sub)', fontWeight: 500, fontSize: 11, marginLeft: 4 }}>
            LPU Campus
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div ref={searchRef} style={{ position: 'relative' }}>
        <div className="topbar-search">
          <Search size={15} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by Room Unit (e.g. U301), ULPIN, Owner, Type..."
            value={state.searchQuery}
            onChange={(e) => {
              dispatch({ type: 'SET_SEARCH', query: e.target.value });
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
        </div>

        {/* Dropdown Results */}
        {showResults && state.searchQuery.trim() && (
          <div className="search-results animate-fade-in">
            {filteredProperties.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                No 3D properties found matching "{state.searchQuery}"
              </div>
            ) : (
              filteredProperties.slice(0, 8).map((prop) => (
                <div
                  key={prop.id}
                  className="search-result-item"
                  onClick={() => {
                    dispatch({ type: 'SELECT_PROPERTY', property: prop });
                    setShowResults(false);
                    dispatch({ type: 'SET_SEARCH', query: '' });
                    window.dispatchEvent(new CustomEvent('fly-to-property', { detail: prop }));
                  }}
                >
                  <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    Unit {prop.unitNumber}
                  </span>
                  <span style={{ color: 'var(--text-sub)' }}>
                    {prop.buildingId} · Floor {prop.floorNumber >= 0 ? `F${prop.floorNumber}` : `B${Math.abs(prop.floorNumber)}`}
                  </span>
                  <span className={`type-badge ${prop.type.toLowerCase().replace(' ', '-')}`}>
                    {prop.type}
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent-cyan)' }}>
                    {prop.ulpin.slice(0, 18)}...
                  </span>
                </div>
              ))
            )}
            {filteredProperties.length > 8 && (
              <div style={{ padding: '8px', fontSize: 11, color: 'var(--text-sub)', textAlign: 'center' }}>
                +{filteredProperties.length - 8} more units found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Stats & Status Badges */}
      <div className="topbar-info">
        <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
            <Layers size={13} style={{ color: 'var(--accent-cyan)' }} /> {totalParcels} Parcels
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
            <Building2 size={13} style={{ color: 'var(--accent-emerald)' }} /> {totalBuildings} Buildings
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
            <Box size={13} style={{ color: 'var(--accent-amber)' }} /> {totalProps} 3D Units
          </span>
        </div>

        <a
          href="https://www.google.com/maps?q=31.2536,75.7037&z=18&t=k"
          target="_blank"
          rel="noopener noreferrer"
          className="topbar-coords"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          title="Click to open LPU Phagwara Campus on Google Maps Satellite"
        >
          <MapPin size={12} style={{ color: 'var(--accent-cyan)' }} />
          {state.cursorPosition
            ? `X: ${state.cursorPosition.x.toFixed(1)}m  Y: ${state.cursorPosition.y.toFixed(1)}m`
            : `31.2536° N, 75.7037° E ↗`
          }
        </a>

        <button
          className={`topbar-view-toggle ${state.viewMode === 'map' ? 'map-active' : 'interior-active'}`}
          onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: state.viewMode === 'map' ? '3d-interior' : 'map' })}
          title={state.viewMode === 'map' ? 'Switch to 3D Interior View' : 'Switch to Map View'}
        >
          {state.viewMode === 'map' ? <Globe2 size={13} /> : <MapIcon size={13} />}
          <span>{state.viewMode === 'map' ? 'Map View' : '3D Interior'}</span>
        </button>

        <div className="topbar-status">
          <div className="topbar-status-dot" />
          Prototype Live
        </div>
      </div>
    </div>
  );
}

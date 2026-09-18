// ============================================================================
// 3D ULPIN Phase 1 — Floor Selector
// Vertical menu showing all floors for the selected building.
// Floor list is GENERATED from building parameters, never hardcoded.
// ============================================================================

import { Layers, Box } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getFloorColor } from '../services/buildingGenerator';

export default function FloorSelector() {
  const { state, dispatch } = useAppContext();
  const { selectedBuilding, selectedFloor, selectedProperty, floors, siteData } = state;

  if (!selectedBuilding) return null;

  // Get floors for this building — GENERATED, not hardcoded
  const buildingFloors = floors[selectedBuilding.id] || [];

  // Sort floors from highest to lowest for display
  const sortedFloors = [...buildingFloors].sort((a, b) => b.floorNumber - a.floorNumber);

  // Count properties per floor
  const propCounts: Record<string, number> = {};
  for (const floor of buildingFloors) {
    propCounts[floor.id] = siteData.properties.filter(
      (p) => p.buildingId === selectedBuilding.id && p.floorNumber === floor.floorNumber
    ).length;
  }

  // Add placeholder roof entry
  const allEntries = [
    { id: 'roof', label: 'RF', floorNumber: 999, isPlaceholder: true },
    ...sortedFloors.map((f) => ({ ...f, isPlaceholder: false })),
  ];

  return (
    <>
      <div className="panel-section-title">
        <Layers size={12} />
        Floors — {selectedBuilding.name}
      </div>
      <div className="floor-selector">
        {allEntries.map((entry) => {
          const isActive = selectedFloor?.id === entry.id;
          const count = entry.isPlaceholder ? 0 : propCounts[entry.id] || 0;
          const hasData = count > 0;

          // Get properties on this floor if active
          const floorProperties = isActive && !entry.isPlaceholder
            ? siteData.properties.filter(
                (p) => p.buildingId === selectedBuilding.id && p.floorNumber === entry.floorNumber
              )
            : [];

          return (
            <div key={entry.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                className={`floor-btn ${isActive ? 'active' : ''} ${
                  !hasData && !entry.isPlaceholder ? '' : ''
                } ${entry.isPlaceholder ? 'no-data' : ''}`}
                onClick={() => {
                  if (entry.isPlaceholder) return;
                  const floorObj = buildingFloors.find((f) => f.id === entry.id) || null;
                  dispatch({ type: 'SELECT_FLOOR', floor: floorObj });
                }}
                style={{
                  borderLeft: isActive
                    ? `3px solid ${getFloorColor(entry.floorNumber)}`
                    : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: entry.isPlaceholder ? 'var(--text-muted)' : getFloorColor(entry.floorNumber),
                      opacity: entry.isPlaceholder ? 0.3 : hasData ? 1 : 0.4,
                      flexShrink: 0,
                    }}
                  />
                  <span>{entry.label}</span>
                </div>
                {hasData && (
                  <span className="floor-btn-badge">{count}</span>
                )}
              </div>

              {/* Property Unit Chips under active floor */}
              {isActive && floorProperties.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  padding: '6px 8px 8px 18px',
                  background: 'rgba(6, 182, 212, 0.04)',
                  borderLeft: '2px dashed var(--accent-cyan)',
                  marginBottom: 4,
                  borderRadius: '0 0 8px 8px',
                }}>
                  <div style={{ width: '100%', fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Box size={10} /> Click unit to inspect:
                  </div>
                  {floorProperties.map((prop) => {
                    const isPropSelected = selectedProperty?.id === prop.id;
                    return (
                      <button
                        key={prop.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: 'SELECT_PROPERTY', property: prop });
                          window.dispatchEvent(new CustomEvent('fly-to-property', { detail: prop }));
                        }}
                        style={{
                          padding: '3px 7px',
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: isPropSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)',
                          background: isPropSelected ? 'var(--accent-cyan)' : 'rgba(15,23,42,0.6)',
                          color: isPropSelected ? '#000000' : 'var(--text-main)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title={`Select Unit ${prop.unitNumber} (${prop.type})`}
                      >
                        {prop.unitNumber}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}


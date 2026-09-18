// ============================================================================
// 3D ULPIN Phase 1 — Redesigned Property Details (Floating Right Card)
// Displays selected property attributes, Prototype 3D ULPIN, and computed validation
// ============================================================================

import { useMemo, useState } from 'react';
import { Box, Eye, CheckCircle, FileText, Building2, Copy, Check, MapPin, Layers, Video } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getFloorForProperty, getPropertyTypeColor } from '../services/buildingGenerator';
import { validateProperty } from '../services/validationService';

export default function PropertyDetails() {
  const { state, dispatch } = useAppContext();
  const { selectedProperty, selectedFloor, floors, siteData } = state;
  const [copied, setCopied] = useState(false);

  // Compute spatial validation checks
  const validation = useMemo(() => {
    if (!selectedProperty) return null;

    const floor = getFloorForProperty(selectedProperty, floors);
    const sameFloorProps = siteData.properties.filter(
      (p) => p.buildingId === selectedProperty.buildingId && p.floorNumber === selectedProperty.floorNumber
    );

    return validateProperty(
      selectedProperty,
      floor,
      sameFloorProps,
      siteData.buildings,
      siteData.parcels,
      siteData.properties
    );
  }, [selectedProperty, floors, siteData]);

  const handleCopyULPIN = () => {
    if (!selectedProperty) return;
    navigator.clipboard.writeText(selectedProperty.ulpin);
    setCopied(true);
    dispatch({ type: 'LOG_ACTIVITY', action: 'ULPIN', detail: `Copied ULPIN ${selectedProperty.ulpin} to clipboard` });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedProperty) {
    return (
      <div className="right-panel">
        <div className="property-empty">
          <div className="property-empty-icon">
            <Building2 size={48} strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', marginBottom: 6 }}>
              Select a 3D Property Unit
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-sub)' }}>
              Click any colored 3D unit or building on the map to view its <strong>Prototype 3D ULPIN</strong>, floor coordinates, ownership & spatial validation.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const building = siteData.buildings.find((b) => b.id === selectedProperty.buildingId);
  const typeColor = getPropertyTypeColor(selectedProperty.type);

  const validationChecks = validation
    ? [
        validation.geometry,
        validation.topology,
        validation.overlap,
        validation.floorAlignment,
        validation.parcelLink,
        validation.ulpinUnique,
      ]
    : [];

  return (
    <div className="right-panel">
      {/* Header */}
      <div className="panel-section animate-slide-in">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Box size={18} style={{ color: 'var(--accent-cyan)' }} />
              Unit {selectedProperty.unitNumber}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>{selectedProperty.id}</div>
          </div>
          <span
            className={`type-badge ${selectedProperty.type.toLowerCase().replace(' ', '-')}`}
            style={{ background: `${typeColor}25`, color: typeColor, border: `1px solid ${typeColor}44` }}
          >
            {selectedProperty.type}
          </span>
        </div>

        {/* Prototype 3D ULPIN Box */}
        <div className="ulpin-card">
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent-cyan)', marginBottom: 6 }}>
            Prototype 3D ULPIN Code
          </div>
          <div className="ulpin-code">{selectedProperty.ulpin}</div>
          <button
            className="action-btn"
            style={{ marginTop: 8, padding: '4px 10px', fontSize: 11, borderRadius: 14, background: 'rgba(6, 182, 212, 0.15)', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
            onClick={handleCopyULPIN}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied ULPIN!' : 'Copy ULPIN Code'}
          </button>
          <div className="ulpin-disclaimer">
            ⚠️ Non-Official Prototype ULPIN format — computed deterministically for LPU 3D Cadastral demo.
          </div>
        </div>
      </div>

      {/* Real Google Maps Location & Spatial Attributes */}
      <div className="panel-section animate-slide-in" style={{ animationDelay: '0.04s' }}>
        <div className="panel-section-title">
          <Building2 size={12} /> Spatial Location & Owner
        </div>
        <div className="detail-row">
          <span className="detail-label">Building</span>
          <span className="detail-value" style={{ color: 'var(--accent-cyan)' }}>{building?.name || selectedProperty.buildingId}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Google Maps Coords</span>
          <span className="detail-value" style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-emerald)', fontSize: 11 }}>
            {((siteData.metadata.latitude || 31.2536) + (building?.position.y || 0) * 0.000009).toFixed(6)}° N,{' '}
            {((siteData.metadata.longitude || 75.7037) + (building?.position.x || 0) * 0.0000105).toFixed(6)}° E
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Campus Address</span>
          <span className="detail-value" style={{ fontSize: 11, fontFamily: 'Inter' }}>
            LPU Academic Quad, Phagwara, Punjab 144411
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Floor Level</span>
          <span className="detail-value">
            {selectedFloor?.label || `Floor ${selectedProperty.floorNumber}`} (Z: {selectedProperty.zMin.toFixed(1)}–{selectedProperty.zMax.toFixed(1)}m)
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Owner / Allottee</span>
          <span className="detail-value" style={{ fontFamily: 'Inter', color: 'var(--text-main)' }}>
            {selectedProperty.owner}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Occupancy Status</span>
          <span
            className="detail-value"
            style={{
              color: selectedProperty.status === 'Active' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              fontFamily: 'Inter',
            }}
          >
            ● {selectedProperty.status}
          </span>
        </div>

        {/* Real Google Maps Direct Action Link */}
        <div style={{ marginTop: 10 }}>
          <a
            href={`https://www.google.com/maps?q=${((siteData.metadata.latitude || 31.2536) + (building?.position.y || 0) * 0.000009).toFixed(6)},${((siteData.metadata.longitude || 75.7037) + (building?.position.x || 0) * 0.0000105).toFixed(6)}&z=19&t=k`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.15)',
              borderColor: 'var(--accent-emerald)',
              color: 'var(--accent-emerald)',
              textDecoration: 'none',
              fontSize: 11,
              borderRadius: 6,
              padding: '6px 12px',
            }}
          >
            <MapPin size={13} /> Open Pin in Real Google Maps Satellite ↗
          </a>
        </div>
      </div>

      {/* Geometry Dimensions */}
      <div className="panel-section animate-slide-in" style={{ animationDelay: '0.08s' }}>
        <div className="panel-section-title">
          <Layers size={12} /> 3D Volume & Dimensions
        </div>
        <div className="detail-row">
          <span className="detail-label">Floor Area</span>
          <span className="detail-value" style={{ color: 'var(--accent-emerald)' }}>{selectedProperty.area.toFixed(1)} m²</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">3D Volume</span>
          <span className="detail-value">
            {(selectedProperty.area * (selectedProperty.zMax - selectedProperty.zMin)).toFixed(1)} m³
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">X × Y × Z Bounds</span>
          <span className="detail-value" style={{ fontSize: 11 }}>
            {(selectedProperty.xMax - selectedProperty.xMin).toFixed(1)}m ×{' '}
            {(selectedProperty.yMax - selectedProperty.yMin).toFixed(1)}m ×{' '}
            {(selectedProperty.zMax - selectedProperty.zMin).toFixed(1)}m
          </span>
        </div>
      </div>

      {/* Computed Spatial Validation */}
      <div className="panel-section animate-slide-in" style={{ animationDelay: '0.12s' }}>
        <div className="panel-section-title">
          <CheckCircle size={12} /> Spatial Validation Checks
        </div>
        {validationChecks.map((check) => (
          <div key={check.key} className="validation-item" title={check.message}>
            <div className={`validation-icon ${check.valid ? 'valid' : 'invalid'}`}>
              {check.valid ? '✓' : '✗'}
            </div>
            <span className="validation-name">{check.name}</span>
            <span className={`validation-status ${check.valid ? 'valid' : 'invalid'}`}>
              {check.valid ? 'PASSED' : 'FAILED'}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="panel-section animate-slide-in" style={{ animationDelay: '0.16s' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            className="action-btn primary"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('start-walkthrough'));
            }}
          >
            <Video size={14} /> Start 3D Building Walkthrough Tour
          </button>
          <button
            className="action-btn"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('fly-to-property', { detail: selectedProperty }));
              dispatch({ type: 'LOG_ACTIVITY', action: 'Camera', detail: `Focused 3D camera on Unit ${selectedProperty.unitNumber}` });
            }}
          >
            <Eye size={14} /> Fly 3D Camera to Unit
          </button>
          <button
            className="action-btn"
            onClick={() => {
              const report = {
                title: '3D ULPIN Spatial Certificate — Prototype',
                generatedAt: new Date().toISOString(),
                ulpin: selectedProperty.ulpin,
                property: selectedProperty,
                validation: validation,
                disclaimer: 'SAMPLE REFERENCE DATA ONLY',
              };
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `3d-ulpin-certificate-${selectedProperty.unitNumber}.json`;
              a.click();
              URL.revokeObjectURL(url);
              dispatch({ type: 'LOG_ACTIVITY', action: 'Export', detail: `Downloaded 3D ULPIN certificate for Unit ${selectedProperty.unitNumber}` });
            }}
          >
            <FileText size={14} /> Download 3D ULPIN Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3D ULPIN Phase 2 — Real-World Map View (Mapbox GL JS)
// Full interactive map with 3D building extrusions at real GPS coordinates
// ============================================================================

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { Source, Layer, Popup, NavigationControl, ScaleControl } from '@vis.gl/react-mapbox';
import type { MapRef, MapMouseEvent } from '@vis.gl/react-mapbox';
import { Building2, Eye, EyeOff, Compass, Globe2, ArrowRight } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useAppContext } from '../context/AppContext';
import { buildingFootprints, parcelBoundaries, emptyParcelBoundaries, LPU_CENTER, DEFAULT_ZOOM } from '../data/buildingGeoJSON';
import type { BuildingGeoProperties, EmptyParcelGeoProperties } from '../data/buildingGeoJSON';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// ---------------------------------------------------------------------------
// MAP STYLES
// ---------------------------------------------------------------------------

const MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/dark-v11',
  dark: 'mapbox://styles/mapbox/navigation-night-v1',
} as const;

// ---------------------------------------------------------------------------
// MAIN MAP VIEW COMPONENT
// ---------------------------------------------------------------------------

export default function MapView() {
  const { state, dispatch } = useAppContext();
  const mapRef = useRef<MapRef>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingGeoProperties | null>(null);
  const [popupInfo, setPopupInfo] = useState<{
    lng: number;
    lat: number;
    building: BuildingGeoProperties;
  } | null>(null);
  const [vacantPopup, setVacantPopup] = useState<{
    lng: number;
    lat: number;
    parcel: EmptyParcelGeoProperties;
  } | null>(null);
  const [showParcels, setShowParcels] = useState(true);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('satellite');

  // -------------------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------------------

  const onBuildingClick = useCallback((e: MapMouseEvent) => {
    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const props = feature.properties as BuildingGeoProperties;

    // Find the matching building from our site data
    const building = state.siteData.buildings.find(b => b.id === props.buildingId);
    if (!building) return;

    // Select this building
    dispatch({ type: 'SELECT_BUILDING', building });

    // Compute center of the building polygon for popup
    const coords = (feature.geometry as GeoJSON.Polygon).coordinates[0];
    const lngAvg = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
    const latAvg = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

    setPopupInfo({
      lng: lngAvg,
      lat: latAvg,
      building: props,
    });

    // Fly to the building
    mapRef.current?.flyTo({
      center: [lngAvg, latAvg],
      zoom: 18,
      pitch: 60,
      bearing: -20,
      duration: 1500,
    });

    dispatch({
      type: 'LOG_ACTIVITY',
      action: 'Map',
      detail: `Clicked building ${props.buildingId} (${props.name}) on map`,
    });
  }, [state.siteData.buildings, dispatch]);

  const onBuildingHover = useCallback((e: MapMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const props = e.features[0].properties as BuildingGeoProperties;
      setHoveredBuilding(props);
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      }
    }
  }, []);

  const onBuildingLeave = useCallback(() => {
    setHoveredBuilding(null);
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = '';
    }
  }, []);

  const enterInteriorView = useCallback(() => {
    if (state.selectedBuilding) {
      dispatch({ type: 'SET_VIEW_MODE', mode: '3d-interior' });
    }
  }, [state.selectedBuilding, dispatch]);

  // Listen for fly-to-property events from search
  useEffect(() => {
    const handler = (e: Event) => {
      const prop = (e as CustomEvent).detail;
      const buildingGeo = buildingFootprints.features.find(
        f => f.properties.buildingId === prop.buildingId
      );
      if (buildingGeo) {
        const coords = buildingGeo.geometry.coordinates[0];
        const lngAvg = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
        const latAvg = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
        mapRef.current?.flyTo({
          center: [lngAvg, latAvg],
          zoom: 18.5,
          pitch: 55,
          duration: 1200,
        });
      }
    };
    window.addEventListener('fly-to-property', handler);
    return () => window.removeEventListener('fly-to-property', handler);
  }, []);

  // -------------------------------------------------------------------------
  // BUILDING COUNT BY PROPERTIES FOR POPUP
  // -------------------------------------------------------------------------

  const getBuildingStats = (buildingId: string) => {
    const props = state.siteData.properties.filter(p => p.buildingId === buildingId);
    const activeCount = props.filter(p => p.status === 'Active').length;
    const vacantCount = props.filter(p => p.status === 'Vacant').length;
    return { total: props.length, active: activeCount, vacant: vacantCount };
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="map-view-container" id="map-view">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: LPU_CENTER[0],
          latitude: LPU_CENTER[1],
          zoom: DEFAULT_ZOOM,
          pitch: 50,
          bearing: -15,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLES[mapStyle]}
        interactiveLayerIds={['buildings-3d', 'buildings-outline', 'empty-parcels-fill']}
        onClick={(e: MapMouseEvent) => {
          // Check if clicked on an empty parcel
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const layerId = feature.layer?.id;
            if (layerId === 'empty-parcels-fill') {
              const props = feature.properties as unknown as EmptyParcelGeoProperties;
              const coords = (feature.geometry as GeoJSON.Polygon).coordinates[0];
              const lngAvg = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
              const latAvg = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
              setVacantPopup({ lng: lngAvg, lat: latAvg, parcel: props });
              setPopupInfo(null);
              mapRef.current?.flyTo({ center: [lngAvg, latAvg], zoom: 17.5, pitch: 45, duration: 1200 });
              dispatch({ type: 'LOG_ACTIVITY', action: 'Map', detail: `Clicked vacant parcel ${props.id} (${props.name})` });
              return;
            }
          }
          onBuildingClick(e);
        }}
        onMouseMove={onBuildingHover}
        onMouseLeave={onBuildingLeave}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.2 }}
        fog={{
          color: '#0a0f1a',
          'high-color': '#0c1929',
          'horizon-blend': 0.08,
          'space-color': '#070d1a',
          'star-intensity': 0.4,
        }}
      >
        {/* Terrain Source for 3D */}
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {/* Navigation Controls */}
        <NavigationControl position="bottom-right" showCompass showZoom visualizePitch />
        <ScaleControl position="bottom-left" />

        {/* Parcel Boundaries */}
        {showParcels && (
          <Source id="parcels" type="geojson" data={parcelBoundaries}>
            <Layer
              id="parcels-fill"
              type="fill"
              paint={{
                'fill-color': ['get', 'color'],
                'fill-opacity': 0.08,
              }}
            />
            <Layer
              id="parcels-outline"
              type="line"
              paint={{
                'line-color': ['get', 'color'],
                'line-width': 2,
                'line-opacity': 0.6,
                'line-dasharray': [3, 2],
              }}
            />
            <Layer
              id="parcels-label"
              type="symbol"
              layout={{
                'text-field': ['get', 'name'],
                'text-size': 11,
                'text-anchor': 'center',
                'text-max-width': 12,
              }}
              paint={{
                'text-color': '#94a3b8',
                'text-halo-color': '#0a0f1a',
                'text-halo-width': 1.5,
              }}
            />
          </Source>
        )}

        {/* 3D Building Extrusions */}
        <Source id="buildings-custom" type="geojson" data={buildingFootprints}>
          {/* Solid 3D extrusion */}
          <Layer
            id="buildings-3d"
            type="fill-extrusion"
            paint={{
              'fill-extrusion-color': [
                'case',
                ['==', ['get', 'buildingId'], state.selectedBuilding?.id ?? ''],
                '#38bdf8',
                ['get', 'color'],
              ],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': [
                'case',
                ['==', ['get', 'buildingId'], state.selectedBuilding?.id ?? ''],
                0.9,
                hoveredBuilding
                  ? ['case',
                      ['==', ['get', 'buildingId'], hoveredBuilding.buildingId],
                      0.85,
                      0.7,
                    ]
                  : 0.7,
              ],
            }}
          />

          {/* Building outline on ground */}
          <Layer
            id="buildings-outline"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'buildingId'], state.selectedBuilding?.id ?? ''],
                '#38bdf8',
                '#06b6d4',
              ],
              'line-width': [
                'case',
                ['==', ['get', 'buildingId'], state.selectedBuilding?.id ?? ''],
                3,
                1.5,
              ],
              'line-opacity': 0.8,
            }}
          />

          {/* Building labels */}
          <Layer
            id="buildings-label"
            type="symbol"
            layout={{
              'text-field': ['concat', ['get', 'buildingId'], '\n', ['get', 'name']],
              'text-size': 11,
              'text-anchor': 'center',
              'text-max-width': 10,
              'text-offset': [0, -1.2],
            }}
            paint={{
              'text-color': '#ffffff',
              'text-halo-color': '#020617',
              'text-halo-width': 2.5,
            }}
          />
        </Source>

        {/* Empty / Vacant Parcel Polygons */}
        <Source id="empty-parcels" type="geojson" data={emptyParcelBoundaries}>
          <Layer
            id="empty-parcels-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.12,
            }}
          />
          <Layer
            id="empty-parcels-outline"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 3,
              'line-opacity': 0.85,
              'line-dasharray': [4, 3],
            }}
          />
          <Layer
            id="empty-parcels-label"
            type="symbol"
            layout={{
              'text-field': ['concat', '📍 ', ['get', 'name'], '\nCLICK TO REGISTER'],
              'text-size': 12,
              'text-anchor': 'center',
              'text-max-width': 14,
            }}
            paint={{
              'text-color': '#eab308',
              'text-halo-color': '#0a0f1a',
              'text-halo-width': 2,
            }}
          />
        </Source>

        {/* Building Info Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            className="building-popup"
            maxWidth="320px"
          >
            <div className="popup-content">
              <div className="popup-header">
                <Building2 size={16} />
                <span className="popup-building-id">{popupInfo.building.buildingId}</span>
                <span className="popup-building-name">{popupInfo.building.name}</span>
              </div>

              <div className="popup-stats">
                <div className="popup-stat">
                  <span className="popup-stat-value">{popupInfo.building.floors}</span>
                  <span className="popup-stat-label">Floors</span>
                </div>
                <div className="popup-stat">
                  <span className="popup-stat-value">{popupInfo.building.height}m</span>
                  <span className="popup-stat-label">Height</span>
                </div>
                <div className="popup-stat">
                  <span className="popup-stat-value">{getBuildingStats(popupInfo.building.buildingId).total}</span>
                  <span className="popup-stat-label">Units</span>
                </div>
                <div className="popup-stat">
                  <span className="popup-stat-value">{popupInfo.building.basementFloors}</span>
                  <span className="popup-stat-label">Basements</span>
                </div>
              </div>

              <div className="popup-unit-bar">
                <div className="popup-unit-active" style={{
                  width: `${(getBuildingStats(popupInfo.building.buildingId).active / getBuildingStats(popupInfo.building.buildingId).total) * 100}%`
                }} />
              </div>
              <div className="popup-unit-legend">
                <span>🟢 {getBuildingStats(popupInfo.building.buildingId).active} Active</span>
                <span>⚪ {getBuildingStats(popupInfo.building.buildingId).vacant} Vacant</span>
              </div>

              <button className="popup-enter-btn" onClick={enterInteriorView}>
                <span>Enter 3D Interior</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </Popup>
        )}

        {/* Vacant Parcel Popup */}
        {vacantPopup && (
          <Popup
            longitude={vacantPopup.lng}
            latitude={vacantPopup.lat}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setVacantPopup(null)}
            className="building-popup vacant-parcel-popup"
            maxWidth="280px"
          >
            <div className="popup-content">
              <div className="popup-header">
                <span style={{ fontSize: 16 }}>📍</span>
                <span className="popup-building-name">{vacantPopup.parcel.name}</span>
              </div>
              <div className="popup-stats">
                <div className="popup-stat">
                  <span className="popup-stat-value">{vacantPopup.parcel.area.toLocaleString()}</span>
                  <span className="popup-stat-label">Area (m²)</span>
                </div>
                <div className="popup-stat">
                  <span className="popup-stat-value" style={{ color: '#eab308' }}>Vacant</span>
                  <span className="popup-stat-label">Status</span>
                </div>
              </div>
              <button
                className="popup-register-btn"
                onClick={() => {
                  const parcel = state.siteData.parcels.find(p => p.id === vacantPopup.parcel.id);
                  if (parcel) {
                    dispatch({ type: 'SELECT_PARCEL', parcel });
                    dispatch({ type: 'OPEN_REGISTRATION_MODAL' });
                    setVacantPopup(null);
                  }
                }}
              >
                🏗️ Register New Building
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating Map Controls Panel */}
      <div className="map-controls-panel">
        <div className="map-controls-title">
          <Globe2 size={14} />
          <span>Map View</span>
        </div>

        {/* Map Style Switcher */}
        <div className="map-style-switcher">
          {Object.keys(MAP_STYLES).map((key) => (
            <button
              key={key}
              className={`map-style-btn ${mapStyle === key ? 'active' : ''}`}
              onClick={() => setMapStyle(key as keyof typeof MAP_STYLES)}
            >
              {key === 'satellite' ? '🛰️' : key === 'streets' ? '🌙' : '🗺️'}
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            </button>
          ))}
        </div>

        {/* Toggle Parcels */}
        <button
          className="map-toggle-btn"
          onClick={() => setShowParcels(!showParcels)}
        >
          {showParcels ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>Parcel Boundaries</span>
        </button>

        {/* Reset View */}
        <button
          className="map-toggle-btn"
          onClick={() => {
            mapRef.current?.flyTo({
              center: LPU_CENTER,
              zoom: DEFAULT_ZOOM,
              pitch: 50,
              bearing: -15,
              duration: 1500,
            });
            setPopupInfo(null);
            dispatch({ type: 'RESET_SELECTION' });
          }}
        >
          <Compass size={14} />
          <span>Reset View</span>
        </button>
      </div>

      {/* Floating Building Legend */}
      <div className="map-legend">
        <div className="map-legend-title">Buildings</div>
        {buildingFootprints.features.slice(0, 6).map(f => (
          <div key={f.properties.buildingId} className="map-legend-item">
            <div
              className="map-legend-swatch"
              style={{ backgroundColor: f.properties.color }}
            />
            <span className="map-legend-id">{f.properties.buildingId}</span>
            <span className="map-legend-name">{f.properties.name.slice(0, 20)}</span>
          </div>
        ))}
        <div className="map-legend-more">+{buildingFootprints.features.length - 6} more</div>
      </div>

      {/* Hover Tooltip */}
      {hoveredBuilding && !popupInfo && (
        <div className="map-hover-tooltip">
          <Building2 size={12} />
          <span>{hoveredBuilding.buildingId} — {hoveredBuilding.name}</span>
          <span className="map-hover-floors">{hoveredBuilding.floors}F · {hoveredBuilding.height}m</span>
        </div>
      )}
    </div>
  );
}

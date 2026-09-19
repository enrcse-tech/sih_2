// ============================================================================
// 3D ULPIN Phase 1 — Scene Viewer (react-three-fiber)
// Main 3D visualization: parcels, buildings, floors, properties, utilities
// ============================================================================

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Grid, Edges } from '@react-three/drei';
import { MapPin, ExternalLink, Satellite, Map as MapIcon, X, Play, Pause, SkipForward, Video, Box } from 'lucide-react';
import * as THREE from 'three';
import { useAppContext } from '../context/AppContext';
import { getFloorColor, getPropertyTypeColor } from '../services/buildingGenerator';
import type { Property, Building, Parcel, UndergroundUtility, Floor } from '../types';

// ---------------------------------------------------------------------------
// REAL HIGH-RESOLUTION AERIAL SATELLITE PHOTOGRAPHY TEXTURE LOADER
// Fetches real satellite tiles for LPU Phagwara (31.2536° N, 75.7037° E)
// ---------------------------------------------------------------------------

const textureCache: Record<string, THREE.Texture> = {};

function useRealSatelliteTexture(mode: 'satellite' | 'streets' | 'dark') {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (mode === 'dark') {
      setTexture(null);
      return;
    }

    if (textureCache[mode]) {
      setTexture(textureCache[mode]);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = mode === 'satellite' ? '#1b2a47' : '#090d16';
    ctx.fillRect(0, 0, 2048, 2048);

    // Exact Google Maps tile coordinates for LPU Phagwara (31.2536°N, 75.7037°E) at Zoom 17
    const zoom = 17;
    const centerX = 93098;
    const centerY = 54316;

    let loadedCount = 0;
    const gridRadius = 2; // 5x5 grid = 25 tiles
    const totalTiles = (gridRadius * 2 + 1) * (gridRadius * 2 + 1);
    const tileSize = 2048 / (gridRadius * 2 + 1);

    for (let dy = -gridRadius; dy <= gridRadius; dy++) {
      for (let dx = -gridRadius; dx <= gridRadius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Google Maps Satellite / Roadmap Server
        const lyrs = mode === 'satellite' ? 'y' : 'm'; // 'y' = Google Hybrid Satellite + Roads
        const tileUrl = `https://mt1.google.com/vt/lyrs=${lyrs}&x=${x}&y=${y}&z=${zoom}`;

        const renderPosX = (dx + gridRadius) * tileSize;
        const renderPosY = (dy + gridRadius) * tileSize;

        img.onload = () => {
          ctx.drawImage(img, renderPosX, renderPosY, tileSize, tileSize);
          loadedCount++;

          if (loadedCount === totalTiles) {
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.needsUpdate = true;
            textureCache[mode] = tex;
            setTexture(tex);
          }
        };

        img.onerror = () => {
          // Fallback to ArcGIS if CORS restricts Google Tile directly
          const fallbackUrl = mode === 'satellite'
            ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/16/${27159 + dy}/${46547 + dx}`
            : `https://tile.openstreetmap.org/16/${46547 + dx}/${27159 + dy}.png`;

          const fbImg = new Image();
          fbImg.crossOrigin = 'anonymous';
          fbImg.onload = () => {
            ctx.drawImage(fbImg, renderPosX, renderPosY, tileSize, tileSize);
            loadedCount++;
            if (loadedCount === totalTiles) {
              const tex = new THREE.CanvasTexture(canvas);
              tex.needsUpdate = true;
              textureCache[mode] = tex;
              setTexture(tex);
            }
          };
          fbImg.onerror = () => {
            loadedCount++;
            if (loadedCount === totalTiles) {
              const tex = new THREE.CanvasTexture(canvas);
              textureCache[mode] = tex;
              setTexture(tex);
            }
          };
          fbImg.src = fallbackUrl;
        };

        img.src = tileUrl;
      }
    }
  }, [mode]);

  return texture;
}

// ---------------------------------------------------------------------------
// GROUND PLANE + GRID
// ---------------------------------------------------------------------------

function GroundPlane() {
  const { state } = useAppContext();
  const texture = useRealSatelliteTexture(state.basemap);

  return (
    <group>
      {state.basemap === 'dark' ? (
        <Grid
          args={[550, 550]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#334155"
          fadeDistance={400}
          position={[0, -0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      ) : (
        <Grid
          args={[550, 550]}
          cellSize={10}
          cellThickness={0.3}
          cellColor={state.basemap === 'satellite' ? '#0ea5e9' : '#0284c7'}
          sectionSize={50}
          sectionThickness={0.6}
          sectionColor={state.basemap === 'satellite' ? '#38bdf8' : '#38bdf8'}
          fadeDistance={450}
          position={[0, 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}
      {/* Ground fill with Real Satellite Photography / Sleek Dark Slate Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[550, 550]} />
        <meshStandardMaterial
          color={state.basemap === 'dark' ? '#090d16' : '#0f172a'}
          map={texture || undefined}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {/* Sleek Minimal Compass Markers */}
      {[
        { text: 'NORTH (GT Road / NH-44)', pos: [0, 0.5, -230] as [number, number, number] },
        { text: 'SOUTH', pos: [0, 0.5, 230] as [number, number, number] },
        { text: 'EAST', pos: [230, 0.5, 0] as [number, number, number] },
        { text: 'WEST', pos: [-230, 0.5, 0] as [number, number, number] },
      ].map(({ text, pos }) => (
        <Text
          key={text}
          position={pos}
          fontSize={3.2}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
          letterSpacing={0.1}
        >
          {text}
        </Text>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// PARCEL MESH — thin extruded footprint
// ---------------------------------------------------------------------------

function ParcelMesh({ parcel }: { parcel: Parcel }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    parcel.footprint.forEach(([x, y], i) => {
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
    s.closePath();
    return s;
  }, [parcel.footprint]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.3, bevelEnabled: false }]} />
        <meshStandardMaterial
          color={parcel.color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Outline */}
      <Line
        points={[...parcel.footprint.map(([x, y]) => [x, 0.5, -y] as [number, number, number]),
                 [parcel.footprint[0][0], 0.5, -parcel.footprint[0][1]]]}
        color={parcel.color}
        lineWidth={2}
        opacity={0.6}
        transparent
      />
      {/* Label */}
      <Text
        position={[
          parcel.footprint.reduce((sum, [x]) => sum + x, 0) / parcel.footprint.length,
          1,
          -parcel.footprint.reduce((sum, [, y]) => sum + y, 0) / parcel.footprint.length,
        ]}
        fontSize={4}
        color={parcel.color}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {parcel.id} — {parcel.name}
      </Text>
    </group>
  );
}

// ---------------------------------------------------------------------------
// EMPTY PARCEL MESH — pulsing vacant plot with registration prompt
// ---------------------------------------------------------------------------

function EmptyParcelMesh({ parcel, onClick }: { parcel: Parcel; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Pulsing glow animation
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const t = Math.sin(clock.elapsedTime * 2) * 0.5 + 0.5;
      (glowRef.current.material as THREE.MeshStandardMaterial).opacity = 0.08 + t * 0.12;
    }
  });

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    parcel.footprint.forEach(([x, y], i) => {
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
    s.closePath();
    return s;
  }, [parcel.footprint]);

  const centerX = parcel.footprint.reduce((sum, [x]) => sum + x, 0) / parcel.footprint.length;
  const centerZ = -parcel.footprint.reduce((sum, [, y]) => sum + y, 0) / parcel.footprint.length;

  return (
    <group>
      {/* Pulsing fill */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: false }]} />
        <meshStandardMaterial
          color={parcel.color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dashed outline */}
      <Line
        points={[...parcel.footprint.map(([x, y]) => [x, 0.6, -y] as [number, number, number]),
                 [parcel.footprint[0][0], 0.6, -parcel.footprint[0][1]]]}
        color={parcel.color}
        lineWidth={3}
        opacity={0.9}
        transparent
        dashed
        dashSize={4}
        gapSize={3}
      />

      {/* Clickable center zone */}
      <mesh
        ref={meshRef}
        position={[centerX, 0.3, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color={parcel.color} transparent opacity={0.0} side={THREE.DoubleSide} />
      </mesh>

      {/* Parcel ID + Name */}
      <Text
        position={[centerX, 2, centerZ]}
        fontSize={4}
        color={parcel.color}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
        outlineWidth={0.12}
        outlineColor="#000000"
      >
        {parcel.id} — {parcel.name}
      </Text>

      {/* VACANT label */}
      <Text
        position={[centerX, 5, centerZ]}
        fontSize={3.2}
        color="#eab308"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.14}
        outlineColor="#000000"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        📍 VACANT — CLICK TO REGISTER
      </Text>

      {/* Corner markers */}
      {parcel.footprint.map(([x, y], i) => (
        <mesh key={`corner-${i}`} position={[x, 1, -y]}>
          <boxGeometry args={[1.5, 2, 1.5]} />
          <meshStandardMaterial
            color={parcel.color}
            emissive={parcel.color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// ANIMATED ROOFTOP HVAC FAN
// ---------------------------------------------------------------------------

function AnimatedRooftopFan({ position, isTransparent }: { position: [number, number, number]; isTransparent: boolean }) {
  const fanRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 7.5;
    }
  });

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[1.4, 1.4, 1.2, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.1} roughness={0.7} transparent={isTransparent} opacity={isTransparent ? 0.12 : 1.0} />
      </mesh>
      <group ref={fanRef} position={[0, 0.65, 0]}>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, idx) => (
          <mesh key={idx} rotation={[0, rot, 0]}>
            <boxGeometry args={[1.2, 0.05, 0.28]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.1} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// PROCEDURAL 3D CAMPUS TREES (HIGH REALISM LANDSCAPE)
// ---------------------------------------------------------------------------

function CampusTrees() {
  const treePositions = useMemo(() => {
    const pos: [number, number, number, 'pine' | 'oak'][] = [];
    const seed = [
      [-165, 0, -85], [-155, 0, -25], [-145, 0, 35], [-135, 0, 85],
      [145, 0, -115], [155, 0, -45], [165, 0, 25], [175, 0, 95],
      [-85, 0, -145], [-25, 0, -155], [35, 0, -165], [85, 0, -155],
      [-75, 0, 135], [15, 0, 145], [75, 0, 135], [125, 0, 125],
      [-55, 0, -25], [45, 0, 15], [-25, 0, 55], [25, 0, -75],
      [-115, 0, -55], [115, 0, 45], [-95, 0, 75], [95, 0, -85],
    ];
    seed.forEach(([x, y, z], i) => {
      pos.push([x, y, z, i % 2 === 0 ? 'pine' : 'oak']);
    });
    return pos;
  }, []);

  return (
    <group>
      {treePositions.map(([x, y, z, type], i) => (
        <group key={`tree-${i}`} position={[x, y, z]}>
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.25, 0.45, 3.6, 8]} />
            <meshStandardMaterial color="#381a08" roughness={0.95} />
          </mesh>
          {type === 'pine' ? (
            <group position={[0, 3.6, 0]}>
              <mesh position={[0, 0, 0]}>
                <coneGeometry args={[2.2, 3.8, 8]} />
                <meshStandardMaterial color="#064e3b" roughness={0.75} />
              </mesh>
              <mesh position={[0, 1.8, 0]}>
                <coneGeometry args={[1.7, 3.2, 8]} />
                <meshStandardMaterial color="#047857" roughness={0.75} />
              </mesh>
              <mesh position={[0, 3.4, 0]}>
                <coneGeometry args={[1.2, 2.2, 8]} />
                <meshStandardMaterial color="#10b981" roughness={0.75} />
              </mesh>
            </group>
          ) : (
            <mesh position={[0, 4.6, 0]}>
              <dodecahedronGeometry args={[2.4, 1]} />
              <meshStandardMaterial color="#15803d" roughness={0.85} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3D CAMPUS STREETLIGHTS (GLOWING NIGHT ILLUMINATION — OPTIMIZED 60 FPS)
// ---------------------------------------------------------------------------

function CampusStreetlights({ isNight }: { isNight: boolean }) {
  const lampPositions: [number, number, number][] = useMemo(() => [
    [-115, 0, -65], [-115, 0, 0], [-115, 0, 65],
    [115, 0, -65], [115, 0, 0], [115, 0, 65],
    [-65, 0, -115], [0, 0, -115], [65, 0, -115],
    [-65, 0, 115], [0, 0, 115], [65, 0, 115],
  ], []);

  return (
    <group>
      {lampPositions.map(([x, y, z], i) => (
        <group key={`lamp-${i}`} position={[x, y, z]}>
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 7, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.1} roughness={0.7} />
          </mesh>
          <mesh position={[0.6, 6.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 1.4, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.1} />
          </mesh>
          <mesh position={[1.2, 6.6, 0]}>
            <sphereGeometry args={[0.35, 10, 10]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={isNight ? 2.5 : 0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// DETAILED ARCHITECTURAL 3D BUILDING MODEL (OPEN3D / BLENDER REALISM)
// ---------------------------------------------------------------------------

function DetailedArchitecturalBuilding({ building, isSelected, onClick }: {
  building: Building;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { state, dispatch } = useAppContext();
  const isThisBuildingSelected = state.selectedBuilding?.id === building.id;
  const targetFloorNum = (isThisBuildingSelected && state.selectedFloor)
    ? state.selectedFloor.floorNumber
    : (isThisBuildingSelected && state.selectedProperty)
      ? state.selectedProperty.floorNumber
      : undefined;

  const totalH = building.totalHeight;
  const numFloors = building.numberOfFloors;
  const fHeight = building.floorHeight;
  const groundElev = building.groundElevation || 0;
  const buildingFloors = state.floors[building.id] || [];

  const isRoofTransparent = targetFloorNum !== undefined;

  const handleFloorClick = (floorIdx: number, e: any) => {
    e.stopPropagation();
    if (!isThisBuildingSelected) {
      dispatch({ type: 'SELECT_BUILDING', building });
    }
    const targetFloor = buildingFloors.find((f) => f.floorNumber === floorIdx) || null;
    dispatch({ type: 'SELECT_FLOOR', floor: targetFloor });
  };

  const isNightMode = state.timeOfDay === 'night' || state.timeOfDay === 'sunset';

  return (
    <group position={[building.position.x, groundElev, -building.position.y]}>
      {/* Exterior Facade Corner Spotlights in Night Mode */}
      {isNightMode && (
        <group position={[0, totalH * 0.4, building.depth / 2 + 1]}>
          <pointLight color="#38bdf8" intensity={18} distance={totalH * 0.9} decay={2} />
        </group>
      )}

      {/* Ground Terrace Podium Base for Elevated Buildings (Jet Black Base) */}
      {groundElev > 0 && (
        <group position={[0, -groundElev / 2, 0]}>
          <mesh>
            <boxGeometry args={[building.width + 8, groundElev, building.depth + 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
            <Edges color="#1e293b" />
          </mesh>
          {/* Plaza Terrace Entrance Steps */}
          <mesh position={[0, -groundElev / 4, building.depth / 2 + 5]}>
            <boxGeometry args={[building.width * 0.5, groundElev / 2, 4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* Solid Structural Core / Elevator & Utility Shaft (Obsidian Black Core) */}
      <mesh position={[0, totalH / 2, 0]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <boxGeometry args={[building.width * 0.94, totalH, building.depth * 0.94]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.6}
          metalness={0.4}
          transparent={isRoofTransparent}
          opacity={isRoofTransparent ? 0.3 : 1.0}
        />
      </mesh>

      {/* Building Footprint Ring (Glows Cyan when selected) */}
      {isSelected && (
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[building.width + 2, 0.4, building.depth + 2]} />
          <meshStandardMaterial color="#06b6d4" transparent opacity={0.15} />
          <Edges color="#06b6d4" lineWidth={3} />
        </mesh>
      )}

      {/* Structural Floor Slabs & Color Accent Trim Bands (Black Outer Trim) */}
      {Array.from({ length: numFloors + 1 }).map((_, i) => {
        const slabColor = getFloorColor(i === 0 ? 0 : i - 1);
        const isSlabSelected = targetFloorNum !== undefined && (i === targetFloorNum || i === targetFloorNum + 1);
        const isUpperSlab = targetFloorNum !== undefined && i > targetFloorNum + 1;
        return (
          <group key={`slab-${i}`} position={[0, i * fHeight, 0]}>
            {/* Reinforced Concrete Slab Plate (Jet Black Framing) */}
            <mesh>
              <boxGeometry args={[building.width + 1.2, 0.5, building.depth + 1.2]} />
              <meshStandardMaterial
                color={isSlabSelected ? '#38bdf8' : '#0f172a'}
                roughness={0.3}
                metalness={0.6}
                transparent={isUpperSlab}
                opacity={isUpperSlab ? 0.15 : 1.0}
              />
            </mesh>

            {/* Color Accent Trim Band */}
            {i < numFloors && (
              <mesh position={[0, 0.35, 0]}>
                <boxGeometry args={[building.width + 1.4, 0.2, building.depth + 1.4]} />
                <meshStandardMaterial
                  color={slabColor}
                  roughness={0.2}
                  metalness={0.8}
                  transparent={isUpperSlab}
                  opacity={isUpperSlab ? 0.15 : 1.0}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Solid Vertical Corner Columns with LED Architectural Light Strips (Matte Jet Black Outer) */}
      {[
        [-building.width / 2, -building.depth / 2],
        [building.width / 2, -building.depth / 2],
        [-building.width / 2, building.depth / 2],
        [building.width / 2, building.depth / 2],
      ].map(([cx, cz], i) => (
        <group key={`col-${i}`} position={[cx, totalH / 2, cz]}>
          {/* Concrete Column (Matte Jet Black Outer) */}
          <mesh>
            <boxGeometry args={[1.2, totalH, 1.2]} />
            <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Glowing LED Strip Accent */}
          <mesh position={[cx > 0 ? 0.65 : -0.65, 0, cz > 0 ? 0.65 : -0.65]}>
            <boxGeometry args={[0.15, totalH, 0.15]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={isSelected ? 1.0 : isNightMode ? 0.7 : 0.4}
            />
          </mesh>
        </group>
      ))}

      {/* High-Reflectivity Mirror Ash Silver Interior Glass Facades & Lit Window Panels */}
      {Array.from({ length: numFloors }).map((_, floorIdx) => {
        const floorY = floorIdx * fHeight + fHeight / 2;
        const floorLabelText = floorIdx === 0 ? 'G (Ground)' : `F${floorIdx}`;
        const isFloorSelected = targetFloorNum === floorIdx;
        const isUpperFloor = targetFloorNum !== undefined && floorIdx > targetFloorNum;
        const facadeOpacity = isUpperFloor ? 0.12 : 1.0;
        const facadeTransparent = isUpperFloor;
        const isLitWindow = isNightMode && (floorIdx % 2 === 0 || isFloorSelected);

        const facadeColor = isFloorSelected
          ? '#38bdf8'
          : isLitWindow
            ? '#fde047'
            : '#cbd5e1'; // Mirror Silver Ash

        const facadeEmissive = isFloorSelected
          ? '#38bdf8'
          : isLitWindow
            ? '#fde047'
            : '#94a3b8'; // Reflective Silver Ash Glow

        const emissiveIntensity = isFloorSelected
          ? 0.95
          : isLitWindow
            ? 0.65
            : isUpperFloor
              ? 0.02
              : 0.25;

        return (
          <group key={`facade-${floorIdx}`} position={[0, floorY, 0]}>
            {/* North & South Mirror Ash Silver Glass Facades */}
            <mesh
              position={[0, 0, building.depth / 2 + 0.08]}
              onClick={(e) => handleFloorClick(floorIdx, e)}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'default'; }}
            >
              <planeGeometry args={[building.width - 1.4, fHeight - 0.6]} />
              <meshStandardMaterial
                color={facadeColor}
                emissive={facadeEmissive}
                emissiveIntensity={emissiveIntensity}
                roughness={0.85}
                metalness={0.05}
                side={THREE.DoubleSide}
                transparent={facadeTransparent}
                opacity={facadeOpacity}
              />
            </mesh>
            <mesh
              position={[0, 0, -building.depth / 2 - 0.08]}
              rotation={[0, Math.PI, 0]}
              onClick={(e) => handleFloorClick(floorIdx, e)}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'default'; }}
            >
              <planeGeometry args={[building.width - 1.4, fHeight - 0.6]} />
              <meshStandardMaterial
                color={facadeColor}
                emissive={facadeEmissive}
                emissiveIntensity={emissiveIntensity}
                roughness={0.85}
                metalness={0.05}
                side={THREE.DoubleSide}
                transparent={facadeTransparent}
                opacity={facadeOpacity}
              />
            </mesh>

            {/* East & West Mirror Ash Silver Glass Facades */}
            <mesh
              position={[building.width / 2 + 0.08, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              onClick={(e) => handleFloorClick(floorIdx, e)}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'default'; }}
            >
              <planeGeometry args={[building.depth - 1.4, fHeight - 0.6]} />
              <meshStandardMaterial
                color={facadeColor}
                emissive={facadeEmissive}
                emissiveIntensity={emissiveIntensity}
                roughness={0.85}
                metalness={0.05}
                side={THREE.DoubleSide}
                transparent={facadeTransparent}
                opacity={facadeOpacity}
              />
            </mesh>
            <mesh
              position={[-building.width / 2 - 0.08, 0, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              onClick={(e) => handleFloorClick(floorIdx, e)}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'default'; }}
            >
              <planeGeometry args={[building.depth - 1.4, fHeight - 0.6]} />
              <meshStandardMaterial
                color={facadeColor}
                emissive={facadeEmissive}
                emissiveIntensity={emissiveIntensity}
                roughness={0.85}
                metalness={0.05}
                side={THREE.DoubleSide}
                transparent={facadeTransparent}
                opacity={facadeOpacity}
              />
            </mesh>

            {/* Pure Black Vertical Window Mullion Grid Fins */}
            {!isUpperFloor && [-building.width * 0.25, 0, building.width * 0.25].map((mx, idx) => (
              <mesh key={`mullion-n-${idx}`} position={[mx, 0, building.depth / 2 + 0.12]}>
                <boxGeometry args={[0.2, fHeight - 0.6, 0.15]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.05} />
              </mesh>
            ))}

            {/* Highlight bounding box outline when ONLY this floor is selected */}
            {isFloorSelected && (
              <mesh>
                <boxGeometry args={[building.width + 1.8, fHeight + 0.2, building.depth + 1.8]} />
                <meshStandardMaterial color="#38bdf8" transparent opacity={0.25} />
                <Edges color="#38bdf8" lineWidth={3} />
              </mesh>
            )}

            {/* 3D Floor Level Badge Label on Building Facade Edge (Rendered ONLY when this building is selected) */}
            {isThisBuildingSelected && (
              <Text
                position={[building.width / 2 + 2.8, 0, 0]}
                fontSize={isFloorSelected ? 3.0 : 2.2}
                color={isFloorSelected ? '#38bdf8' : isUpperFloor ? '#475569' : '#cbd5e1'}
                anchorX="left"
                anchorY="middle"
                outlineWidth={isFloorSelected ? 0.16 : 0.08}
                outlineColor={isFloorSelected ? '#0369a1' : '#000000'}
                onClick={(e) => handleFloorClick(floorIdx, e)}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'default'; }}
              >
                {isFloorSelected ? `▶ ${floorLabelText} [SELECTED]` : floorLabelText}
              </Text>
            )}
          </group>
        );
      })}

      {/* Realistic Rooftop Mechanical Complex, Animated Fans & Helipads (Black Outer Structure) */}
      <group position={[0, totalH, 0]}>
        {/* Parapet Railing */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[building.width + 0.6, 0.8, building.depth + 0.6]} />
          <meshStandardMaterial
            color="#020617"
            roughness={0.7}
            metalness={0.1}
            transparent={isRoofTransparent}
            opacity={isRoofTransparent ? 0.12 : 1.0}
          />
        </mesh>
        {/* Elevator Mechanical Penthouse Core */}
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[building.width * 0.35, 4.8, building.depth * 0.35]} />
          <meshStandardMaterial
            color="#090d16"
            roughness={0.7}
            metalness={0.1}
            transparent={isRoofTransparent}
            opacity={isRoofTransparent ? 0.12 : 1.0}
          />
          {!isRoofTransparent && <Edges color="#38bdf8" />}
        </mesh>

        {/* Animated Rooftop HVAC Cooling Fan */}
        <AnimatedRooftopFan position={[building.width * 0.25, 1.4, building.depth * 0.2]} isTransparent={isRoofTransparent} />

        {/* Solar Panels Grid */}
        <mesh position={[-building.width * 0.22, 0.9, -building.depth * 0.2]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[building.width * 0.35, 0.15, building.depth * 0.35]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.6}
            metalness={0.1}
            transparent={isRoofTransparent}
            opacity={isRoofTransparent ? 0.12 : 1.0}
          />
        </mesh>

        {/* Rooftop Helipad for High-Rise Towers (B001 & B007) */}
        {(building.id === 'B001' || building.id === 'B007') && (
          <group position={[0, 0.15, 0]}>
            {/* Octagonal Pad Surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[building.width * 0.28, building.width * 0.28, 0.2, 8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.5} />
              <Edges color="#f59e0b" lineWidth={2} />
            </mesh>
            {/* Yellow Safety Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
              <ringGeometry args={[building.width * 0.22, building.width * 0.24, 32]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} side={THREE.DoubleSide} />
            </mesh>
            {/* 'H' Emblem */}
            <Text
              position={[0, 0.16, 0]}
              fontSize={building.width * 0.24}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
              fontWeight={900}
            >
              H
            </Text>
            {/* Red Aviation Light Markers */}
            {Array.from({ length: 8 }).map((_, li) => {
              const ang = (li * Math.PI) / 4;
              const rx = Math.sin(ang) * (building.width * 0.26);
              const rz = Math.cos(ang) * (building.width * 0.26);
              return (
                <mesh key={`heli-light-${li}`} position={[rx, 0.25, rz]}>
                  <sphereGeometry args={[0.3, 12, 12]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.4} />
                </mesh>
              );
            })}
          </group>
        )}
      </group>

      {/* Ground Floor Entrance Portico Canopy & Glass Doors */}
      <group position={[0, 0, building.depth / 2 + 3]}>
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[building.width * 0.45, 0.5, 6]} />
          <meshStandardMaterial color="#06b6d4" metalness={0.1} roughness={0.6} />
        </mesh>
        <mesh position={[-building.width * 0.2, 1.75, 2.5]}>
          <cylinderGeometry args={[0.3, 0.3, 3.5, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.1} />
        </mesh>
        <mesh position={[building.width * 0.2, 1.75, 2.5]}>
          <cylinderGeometry args={[0.3, 0.3, 3.5, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.1} />
        </mesh>
        {/* Glass Entrance Doors */}
        <mesh position={[0, 1.6, -2.8]}>
          <boxGeometry args={[building.width * 0.25, 3.2, 0.2]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.7} metalness={0.05} transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Building Label & Height Badge — ONLY shown when building is selected */}
      {isSelected && (
        <Text
          position={[0, totalH + 5, 0]}
          fontSize={3.6}
          color="#06b6d4"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.16}
          outlineColor="#020617"
        >
          {`${building.id} — ${building.name} (${numFloors} Floors, ${totalH}m)`}
        </Text>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// BUILDING WIREFRAME — shows full building envelope
// ---------------------------------------------------------------------------

function BuildingWireframe({ building, isSelected, onClick }: {
  building: Building;
  isSelected: boolean;
  onClick: () => void;
}) {
  const totalH = building.totalHeight + (building.basementFloors * building.floorHeight);
  const baseZ = -building.basementFloors * building.floorHeight;

  return (
    <group position={[building.position.x, baseZ + totalH / 2, -building.position.y]}>
      <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <boxGeometry args={[building.width, totalH, building.depth]} />
        <meshStandardMaterial
          color={isSelected ? '#06b6d4' : building.color}
          transparent
          opacity={isSelected ? 0.08 : 0.04}
          wireframe={false}
        />
        <Edges color={isSelected ? '#06b6d4' : building.color} />
      </mesh>
      {/* Building Label — ONLY when selected */}
      {isSelected && (
        <Text
          position={[0, totalH / 2 + 2, 0]}
          fontSize={3}
          color="#06b6d4"
          anchorX="center"
          anchorY="bottom"
        >
          {building.id} — {building.name}
        </Text>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// FLOOR SLAB
// ---------------------------------------------------------------------------

function FloorSlab({ building, floor, isSelected }: {
  building: Building;
  floor: Floor;
  isSelected: boolean;
}) {
  const color = getFloorColor(floor.floorNumber);
  const centerY = (floor.zMin + floor.zMax) / 2;
  const height = floor.zMax - floor.zMin;

  return (
    <group position={[building.position.x, centerY, -building.position.y]}>
      <mesh>
        <boxGeometry args={[building.width - 0.5, height - 0.2, building.depth - 0.5]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.2 : 0.06}
        />
      </mesh>
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(building.width - 0.5, height - 0.2, building.depth - 0.5)]} />
          <lineBasicMaterial color={color} opacity={0.8} transparent />
        </lineSegments>
      )}
      {/* Floor label on the side */}
      <Text
        position={[building.width / 2 + 1, 0, 0]}
        fontSize={1.5}
        color={isSelected ? color : '#64748b'}
        anchorX="left"
        anchorY="middle"
      >
        {floor.label}
      </Text>
    </group>
  );
}

// ---------------------------------------------------------------------------
// PROPERTY VOLUME — individual 3D box for each property
// ---------------------------------------------------------------------------

function PropertyVolume({ property, building, isSelected, isHovered, onSelect, onHover }: {
  property: Property;
  building: Building;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const typeColor = getPropertyTypeColor(property.type);

  // Property position: building position + property local offset
  const centerX = building.position.x + (property.xMin + property.xMax) / 2;
  const centerY = (property.zMin + property.zMax) / 2;
  const centerZ = -(building.position.y + (property.yMin + property.yMax) / 2);

  const width = property.xMax - property.xMin;
  const height = property.zMax - property.zMin;
  const depth = property.yMax - property.yMin;

  // Animation scaling on hover / selection
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.05 : isHovered ? 1.03 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }
  });

  const color = isSelected ? '#38bdf8' : isHovered ? '#22d3ee' : typeColor;
  const opacity = isSelected ? 0.9 : isHovered ? 0.8 : 0.7;

  const handleUnitClick = (e: any) => {
    e.stopPropagation();
    onSelect();
    window.dispatchEvent(new CustomEvent('fly-to-property', { detail: property }));
  };

  return (
    <group position={[centerX, centerY, centerZ]}>
      {/* Solid Clickable 3D Property Volume Box */}
      <mesh
        ref={meshRef}
        onClick={handleUnitClick}
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onHover(false); document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? '#0284c7' : isHovered ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : isHovered ? 0.3 : 0}
          transparent
          opacity={opacity}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Glowing Edge Outlines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width + 0.05, height + 0.05, depth + 0.05)]} />
        <lineBasicMaterial
          color={isSelected ? '#38bdf8' : isHovered ? '#22d3ee' : typeColor}
          opacity={isSelected ? 1 : 0.6}
          transparent
          linewidth={isSelected ? 3 : 1}
        />
      </lineSegments>

      {/* Always-visible Clickable 3D Unit Badge Label */}
      <Text
        position={[0, height / 2 + 0.6, 0]}
        fontSize={isSelected ? 1.8 : 1.4}
        color={isSelected ? '#38bdf8' : isHovered ? '#22d3ee' : '#ffffff'}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.12}
        outlineColor="#000000"
        onClick={handleUnitClick}
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onHover(false); document.body.style.cursor = 'default'; }}
      >
        {`[ ${property.unitNumber} ]`}
      </Text>

      {/* Selection Outer Glow Box */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[width + 0.4, height + 0.4, depth + 0.4]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// UNDERGROUND UTILITY PIPE
// ---------------------------------------------------------------------------

function UtilityPipe({ utility }: { utility: UndergroundUtility }) {
  const points = useMemo(() => {
    return utility.path.map(
      (p) => new THREE.Vector3(p.x, -utility.depth, -p.y)
    );
  }, [utility]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false), [points]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, utility.diameter / 2, 8, false]} />
        <meshStandardMaterial
          color={utility.color}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Label at start */}
      <Text
        position={[points[0].x, points[0].y + 1.5, points[0].z]}
        fontSize={1.5}
        color={utility.color}
        anchorX="center"
        anchorY="bottom"
      >
        {utility.type.toUpperCase()} — {utility.depth}m depth
      </Text>
    </group>
  );
}

// ---------------------------------------------------------------------------
// CAMERA CONTROLLER WITH 3D WALKTHROUGH ORBIT ANIMATION
// ---------------------------------------------------------------------------

function CameraController({ isWalkthrough, isPaused, walkthroughTarget }: {
  isWalkthrough?: boolean;
  isPaused?: boolean;
  walkthroughTarget?: { x: number; y: number; z: number; radius: number };
}) {
  const { camera } = useThree();
  const { state } = useAppContext();
  const controlsRef = useRef<any>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    // Initial Camera View
    camera.position.set(140, 90, 140);
    camera.lookAt(0, 10, 0);
  }, [camera]);

  // Push camera to selected building automatically when selected Building changes
  useEffect(() => {
    if (state.selectedBuilding && !isWalkthrough) {
      const bldg = state.selectedBuilding;
      const camDist = Math.max(bldg.width, bldg.depth) * 0.9;
      camera.position.set(
        bldg.position.x + camDist,
        bldg.totalHeight * 0.7 + 10,
        -bldg.position.y + camDist
      );
      if (controlsRef.current) {
        controlsRef.current.target.set(
          bldg.position.x,
          bldg.totalHeight * 0.45,
          -bldg.position.y
        );
        controlsRef.current.update();
      }
    }
  }, [state.selectedBuilding, isWalkthrough, camera]);

  const tempPos = useRef(new THREE.Vector3());
  const tempTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (isWalkthrough && !isPaused && walkthroughTarget) {
      angleRef.current += delta * 0.35; // smooth 360 orbit
      const r = walkthroughTarget.radius;
      const x = walkthroughTarget.x + Math.sin(angleRef.current) * r;
      const z = walkthroughTarget.z + Math.cos(angleRef.current) * r;
      const y = walkthroughTarget.y + 14;

      camera.position.lerp(tempPos.current.set(x, y, z), 0.05);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(
          tempTarget.current.set(walkthroughTarget.x, walkthroughTarget.y, walkthroughTarget.z),
          0.05
        );
        controlsRef.current.update();
      }
    }
  });

  // Listen for camera reset, fly-to-property, and fly-to-building events
  useEffect(() => {
    const handleReset = () => {
      camera.position.set(140, 90, 140);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 10, 0);
        controlsRef.current.update();
      }
    };

    const handleFlyTo = (e: Event) => {
      const prop = (e as CustomEvent).detail as Property;
      if (prop) {
        const bldg = state.siteData.buildings.find((b) => b.id === prop.buildingId);
        const groundElev = bldg?.groundElevation || 0;
        const bldgX = bldg ? bldg.position.x : 0;
        const bldgZ = bldg ? -bldg.position.y : 0;

        const propCenterX = bldgX + (prop.xMin + prop.xMax) / 2;
        const propCenterY = groundElev + (prop.zMin + prop.zMax) / 2;
        const propCenterZ = bldgZ - (prop.yMin + prop.yMax) / 2;

        const bldgSize = bldg ? Math.max(bldg.width, bldg.depth) : 40;
        const safeCamDist = bldgSize * 1.25 + 25; // Safe external distance in open space

        // Position camera safely outside in open air elevated above unit
        camera.position.set(
          propCenterX + safeCamDist * 0.65,
          propCenterY + 16,
          propCenterZ + safeCamDist * 0.65
        );
        if (controlsRef.current) {
          controlsRef.current.target.set(propCenterX, propCenterY, propCenterZ);
          controlsRef.current.update();
        }
      }
    };

    const handleFlyToBuilding = (e: Event) => {
      const bldg = (e as CustomEvent).detail as Building;
      if (bldg) {
        const camDist = Math.max(bldg.width, bldg.depth) * 1.35 + 20;
        camera.position.set(
          bldg.position.x + camDist,
          bldg.totalHeight * 0.75 + 15,
          -bldg.position.y + camDist
        );
        if (controlsRef.current) {
          controlsRef.current.target.set(
            bldg.position.x,
            bldg.totalHeight * 0.45,
            -bldg.position.y
          );
          controlsRef.current.update();
        }
      }
    };

    window.addEventListener('reset-camera', handleReset);
    window.addEventListener('fly-to-property', handleFlyTo);
    window.addEventListener('fly-to-building', handleFlyToBuilding);
    return () => {
      window.removeEventListener('reset-camera', handleReset);
      window.removeEventListener('fly-to-property', handleFlyTo);
      window.removeEventListener('fly-to-building', handleFlyToBuilding);
    };
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      minDistance={5}
      maxDistance={450}
      maxPolarAngle={Math.PI / 2.05}
      target={[0, 10, 0]}
    />
  );
}

// ---------------------------------------------------------------------------
// SCENE CONTENT
// ---------------------------------------------------------------------------

function SceneContent({ isWalkthrough, isPaused, walkthroughTarget }: {
  isWalkthrough?: boolean;
  isPaused?: boolean;
  walkthroughTarget?: { x: number; y: number; z: number; radius: number };
}) {
  const { state, dispatch } = useAppContext();
  const { siteData, layers, floors, selectedBuilding, selectedFloor, selectedProperty } = state;
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // Determine which properties to show (Optimized for smooth 60 FPS scrolling)
  const visibleProperties = useMemo(() => {
    if (!layers.properties) return [];

    let props = siteData.properties;

    if (selectedBuilding) {
      props = props.filter((p) => p.buildingId === selectedBuilding.id);
      if (selectedFloor) {
        props = props.filter((p) => p.floorNumber === selectedFloor.floorNumber);
      }
      return props;
    }

    // When in campus overview mode (no building selected), render selected property only
    if (selectedProperty) {
      return props.filter((p) => p.id === selectedProperty.id);
    }

    return [];
  }, [siteData.properties, layers.properties, selectedBuilding, selectedFloor, selectedProperty]);

  const getBuildingForProperty = useCallback(
    (prop: Property) => siteData.buildings.find((b) => b.id === prop.buildingId),
    [siteData.buildings]
  );

  const handleBuildingClick = (building: Building) => {
    dispatch({ type: 'SELECT_BUILDING', building });
    window.dispatchEvent(new CustomEvent('fly-to-building', { detail: building }));
  };

  const isNight = state.timeOfDay === 'night';
  const isSunset = state.timeOfDay === 'sunset';

  return (
    <>
      {/* Dynamic Lighting & HDRI Sky Environment Map */}
      <ambientLight intensity={isNight ? 0.25 : isSunset ? 0.45 : 0.6} />
      <directionalLight
        position={isNight ? [0, 180, 0] : isSunset ? [220, 50, 150] : [120, 160, 80]}
        intensity={isNight ? 0.15 : isSunset ? 1.8 : 1.4}
        color={isNight ? '#1e1b4b' : isSunset ? '#f97316' : '#fffbeb'}
      />
      <directionalLight
        position={[-80, 60, -80]}
        intensity={isNight ? 0.1 : isSunset ? 0.3 : 0.4}
        color={isNight ? '#312e81' : '#64748b'}
      />
      {/* Environment HDRI removed — plain lighting only, no reflections */}

      {/* Ground */}
      <GroundPlane />

      {/* 3D Campus Landscape Trees */}
      <CampusTrees />

      {/* 3D Streetlights with Night Illumination */}
      <CampusStreetlights isNight={isNight || isSunset} />

      {/* Parcels (non-vacant) */}
      {layers.parcels &&
        siteData.parcels.filter(p => !p.isVacant).map((parcel) => (
          <ParcelMesh key={parcel.id} parcel={parcel} />
        ))}

      {/* Empty / Vacant Parcels */}
      {layers.parcels &&
        siteData.parcels.filter(p => p.isVacant).map((parcel) => (
          <EmptyParcelMesh
            key={parcel.id}
            parcel={parcel}
            onClick={() => {
              dispatch({ type: 'SELECT_PARCEL', parcel });
              dispatch({ type: 'OPEN_REGISTRATION_MODAL' });
            }}
          />
        ))}

      {/* Buildings */}
      {layers.buildings &&
        siteData.buildings.map((building) =>
          state.modelMode === 'architectural' ? (
            <DetailedArchitecturalBuilding
              key={building.id}
              building={building}
              isSelected={selectedBuilding?.id === building.id}
              onClick={() => handleBuildingClick(building)}
            />
          ) : (
            <BuildingWireframe
              key={building.id}
              building={building}
              isSelected={selectedBuilding?.id === building.id}
              onClick={() => handleBuildingClick(building)}
            />
          )
        )}

      {/* Floor Slabs */}
      {layers.floors &&
        selectedBuilding &&
        (floors[selectedBuilding.id] || []).map((floor) => (
          <FloorSlab
            key={floor.id}
            building={selectedBuilding}
            floor={floor}
            isSelected={selectedFloor?.id === floor.id}
          />
        ))}

      {/* Properties */}
      {visibleProperties.map((prop) => {
        const building = getBuildingForProperty(prop);
        if (!building) return null;
        return (
          <PropertyVolume
            key={prop.id}
            property={prop}
            building={building}
            isSelected={selectedProperty?.id === prop.id}
            isHovered={hoveredProperty === prop.id}
            onSelect={() => dispatch({ type: 'SELECT_PROPERTY', property: prop })}
            onHover={(h) => setHoveredProperty(h ? prop.id : null)}
          />
        );
      })}

      {/* Underground Utilities */}
      {layers.undergroundUtilities &&
        siteData.undergroundUtilities.map((util) => (
          <UtilityPipe key={util.id} utility={util} />
        ))}

      {/* Camera */}
      <CameraController
        isWalkthrough={isWalkthrough}
        isPaused={isPaused}
        walkthroughTarget={walkthroughTarget}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// MAIN SCENE VIEWER
// ---------------------------------------------------------------------------

export default function SceneViewer() {
  const { state, dispatch } = useAppContext();
  const [showPipMap, setShowPipMap] = useState(false);
  const [mapType, setMapType] = useState<'k' | 'm'>('k');

  // Walkthrough State
  const [isWalkthrough, setIsWalkthrough] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWalkthroughFloorIdx, setCurrentWalkthroughFloorIdx] = useState(0);

  const activeBldg = state.selectedBuilding || state.siteData.buildings[0];

  // Auto-iterate floors during 3D walkthrough
  useEffect(() => {
    if (!isWalkthrough || isPaused || !activeBldg) return;

    const bldgFloors = state.floors[activeBldg.id] || [];
    if (bldgFloors.length === 0) return;

    const interval = setInterval(() => {
      setCurrentWalkthroughFloorIdx((prevIdx) => {
        const nextIdx = (prevIdx + 1) % bldgFloors.length;
        dispatch({ type: 'SELECT_FLOOR', floor: bldgFloors[nextIdx] });
        return nextIdx;
      });
    }, 3600);

    return () => clearInterval(interval);
  }, [isWalkthrough, isPaused, activeBldg, state.floors, dispatch]);

  // Listen for custom start-walkthrough event
  useEffect(() => {
    const handleStartWalkthrough = () => {
      setIsWalkthrough(true);
      setIsPaused(false);
      setCurrentWalkthroughFloorIdx(0);
      dispatch({ type: 'LOG_ACTIVITY', action: 'Walkthrough', detail: 'Started 3D Building Orbit & Floor Tour' });
    };
    window.addEventListener('start-walkthrough', handleStartWalkthrough);
    return () => window.removeEventListener('start-walkthrough', handleStartWalkthrough);
  }, [dispatch]);

  const walkthroughTarget = useMemo(() => {
    if (!activeBldg) return undefined;
    const bldgFloors = state.floors[activeBldg.id] || [];
    const currentFloorObj = bldgFloors[currentWalkthroughFloorIdx];
    const floorY = currentFloorObj
      ? (currentFloorObj.zMin + currentFloorObj.zMax) / 2
      : activeBldg.totalHeight / 2;
    const radius = Math.max(activeBldg.width, activeBldg.depth) * 1.35;
    return {
      x: activeBldg.position.x,
      y: floorY,
      z: -activeBldg.position.y,
      radius,
    };
  }, [activeBldg, state.floors, currentWalkthroughFloorIdx]);

  return (
    <div className="scene-container">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [140, 90, 140], fov: 50, near: 0.1, far: 2000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#080b13');
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <SceneContent
          isWalkthrough={isWalkthrough}
          isPaused={isPaused}
          walkthroughTarget={walkthroughTarget}
        />
      </Canvas>

      {/* Floating Walkthrough HUD Bar (Top Center) */}
      {isWalkthrough && activeBldg && (
        <div className="walkthrough-hud animate-fade-in">
          <div className="walkthrough-hud-title">
            <Video size={15} style={{ color: 'var(--accent-emerald)' }} />
            <span>3D Walkthrough: <strong style={{ color: 'var(--accent-cyan)' }}>{activeBldg.name}</strong></span>
          </div>

          <div className="walkthrough-hud-badge">
            Level: {state.selectedFloor?.label || `Floor ${currentWalkthroughFloorIdx + 1}`}
          </div>

          <div className="walkthrough-hud-controls">
            <button
              className="pip-action-btn"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume 3D Tour' : 'Pause 3D Tour'}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>

            <button
              className="pip-action-btn"
              onClick={() => {
                const bldgFloors = state.floors[activeBldg.id] || [];
                const nextIdx = (currentWalkthroughFloorIdx + 1) % bldgFloors.length;
                setCurrentWalkthroughFloorIdx(nextIdx);
                dispatch({ type: 'SELECT_FLOOR', floor: bldgFloors[nextIdx] });
              }}
              title="Next Floor"
            >
              <SkipForward size={14} />
            </button>

            <button
              className="action-btn"
              style={{ padding: '4px 10px', fontSize: 11, background: 'rgba(244, 63, 94, 0.2)', borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
              onClick={() => {
                setIsWalkthrough(false);
                dispatch({ type: 'LOG_ACTIVITY', action: 'Walkthrough', detail: 'Exited 3D Walkthrough mode' });
              }}
            >
              <X size={12} /> Exit Tour
            </button>
          </div>
        </div>
      )}

      {/* Floating Property Units Quick Selector Pill Bar (Top Center) */}
      {!isWalkthrough && state.selectedBuilding && (
        <div className="property-quick-bar animate-fade-in" style={{
          position: 'absolute',
          top: 130,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glass)',
          borderRadius: 20,
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          maxWidth: 'min(700px, calc(100vw - 640px))',
          overflowX: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            <Box size={13} />
            {state.selectedFloor ? `Floor ${state.selectedFloor.label} Units:` : `${state.selectedBuilding.name} Units:`}
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', overflowX: 'auto', padding: '2px 0' }}>
            {(state.selectedFloor
              ? state.siteData.properties.filter(p => p.buildingId === state.selectedBuilding!.id && p.floorNumber === state.selectedFloor!.floorNumber)
              : state.siteData.properties.filter(p => p.buildingId === state.selectedBuilding!.id)
            ).slice(0, 12).map((prop) => {
              const isSelected = state.selectedProperty?.id === prop.id;
              const typeColor = getPropertyTypeColor(prop.type);
              return (
                <button
                  key={prop.id}
                  onClick={() => {
                    dispatch({ type: 'SELECT_PROPERTY', property: prop });
                    window.dispatchEvent(new CustomEvent('fly-to-property', { detail: prop }));
                  }}
                  style={{
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 12,
                    border: isSelected ? `1.5px solid ${typeColor}` : '1px solid rgba(255,255,255,0.15)',
                    background: isSelected ? typeColor : 'rgba(30, 41, 59, 0.75)',
                    color: isSelected ? '#000000' : 'var(--text-main)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Select Unit ${prop.unitNumber} (${prop.type}) — Fly Camera`}
                >
                  {prop.unitNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Map Toggle Button */}
      <button
        className={`pip-toggle-btn ${showPipMap ? 'active' : ''}`}
        onClick={() => setShowPipMap(!showPipMap)}
        title="Toggle Floating 2D Google Map PIP"
      >
        <MapPin size={14} />
        <span>{showPipMap ? 'Hide Map PIP' : '🗺️ Google Map PIP'}</span>
      </button>

      {/* Floating PIP Google Map Window */}
      {showPipMap && (
        <div className="pip-map-window animate-fade-in">
          <div className="pip-map-header">
            <div className="pip-map-title">
              <MapPin size={12} /> Live Google Maps — LPU
            </div>
            <div className="pip-map-actions">
              <button
                className="pip-action-btn"
                onClick={() => setMapType(mapType === 'k' ? 'm' : 'k')}
                title={mapType === 'k' ? 'Switch to Street Map' : 'Switch to Satellite'}
              >
                {mapType === 'k' ? <Satellite size={12} /> : <MapIcon size={12} />}
              </button>
              <button
                className="pip-action-btn"
                onClick={() => setShowPipMap(false)}
                title="Close Map PIP"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          <iframe
            title="LPU Floating Google Map"
            width="100%"
            height="220"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=31.2536,75.7037+(Lovely+Professional+University)&t=${mapType}&z=17&ie=UTF8&iwloc=&output=embed`}
          />
          <div className="pip-map-footer">
            <span>31.2536° N, 75.7037° E</span>
            <a
              href="https://www.google.com/maps/@31.2536,75.7037,17z"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              Google Maps <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}

      <div className="scene-overlay">
        Sample Reference Data — Non-Official LPU Coordinates
      </div>
    </div>
  );
}

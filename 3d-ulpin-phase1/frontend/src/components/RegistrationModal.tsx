// ============================================================================
// 3D ULPIN — Registration Modal
// Premium dark glassmorphism modal for registering new buildings on vacant parcels
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Edges, Environment } from '@react-three/drei';
import { X, Upload, User, Building2, Layers, Image, ChevronRight, Loader2, Check, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';
import { useAppContext } from '../context/AppContext';
import { generateBuildingFromRegistration, getFloorColor } from '../services/buildingGenerator';
import type { BuildingRegistration, ParcelOwner } from '../types';

// ---------------------------------------------------------------------------
// MINI 3D BUILDING PREVIEW
// ---------------------------------------------------------------------------

function MiniBuilding({ floors, floorHeight, width, depth, basements, color }: {
  floors: number;
  floorHeight: number;
  width: number;
  depth: number;
  basements: number;
  color: string;
}) {
  const totalH = floors * floorHeight;
  const scale = 60 / Math.max(width, depth, totalH);
  const scaledW = width * scale;
  const scaledD = depth * scale;
  const scaledFH = floorHeight * scale;
  const scaledTotalH = totalH * scale;

  return (
    <group scale={[1, 1, 1]}>
      {/* Core */}
      <mesh position={[0, scaledTotalH / 2, 0]}>
        <boxGeometry args={[scaledW * 0.94, scaledTotalH, scaledD * 0.94]} />
        <meshStandardMaterial color="#090d16" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Floor slabs */}
      {Array.from({ length: floors + 1 }).map((_, i) => {
        const slabColor = getFloorColor(i === 0 ? 0 : i - 1);
        return (
          <group key={`slab-${i}`} position={[0, i * scaledFH, 0]}>
            <mesh>
              <boxGeometry args={[scaledW + 0.8, 0.3, scaledD + 0.8]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
            </mesh>
            {i < floors && (
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[scaledW + 1, 0.15, scaledD + 1]} />
                <meshStandardMaterial color={slabColor} roughness={0.2} metalness={0.8} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Corner columns */}
      {[
        [-scaledW / 2, -scaledD / 2],
        [scaledW / 2, -scaledD / 2],
        [-scaledW / 2, scaledD / 2],
        [scaledW / 2, scaledD / 2],
      ].map(([cx, cz], i) => (
        <group key={`col-${i}`} position={[cx, scaledTotalH / 2, cz]}>
          <mesh>
            <boxGeometry args={[0.8, scaledTotalH, 0.8]} />
            <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[cx > 0 ? 0.45 : -0.45, 0, cz > 0 ? 0.45 : -0.45]}>
            <boxGeometry args={[0.1, scaledTotalH, 0.1]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Glass facades */}
      {Array.from({ length: floors }).map((_, floorIdx) => {
        const floorY = floorIdx * scaledFH + scaledFH / 2;
        return (
          <group key={`facade-${floorIdx}`} position={[0, floorY, 0]}>
            <mesh position={[0, 0, scaledD / 2 + 0.05]}>
              <planeGeometry args={[scaledW - 0.8, scaledFH - 0.4]} />
              <meshStandardMaterial
                color="#cbd5e1"
                emissive="#94a3b8"
                emissiveIntensity={0.25}
                roughness={0.02}
                metalness={0.96}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0, -scaledD / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[scaledW - 0.8, scaledFH - 0.4]} />
              <meshStandardMaterial
                color="#cbd5e1"
                emissive="#94a3b8"
                emissiveIntensity={0.25}
                roughness={0.02}
                metalness={0.96}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[scaledW / 2 + 0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[scaledD - 0.8, scaledFH - 0.4]} />
              <meshStandardMaterial
                color="#cbd5e1"
                emissive="#94a3b8"
                emissiveIntensity={0.25}
                roughness={0.02}
                metalness={0.96}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-scaledW / 2 - 0.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[scaledD - 0.8, scaledFH - 0.4]} />
              <meshStandardMaterial
                color="#cbd5e1"
                emissive="#94a3b8"
                emissiveIntensity={0.25}
                roughness={0.02}
                metalness={0.96}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* Rooftop */}
      <group position={[0, scaledTotalH, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[scaledW + 0.4, 0.5, scaledD + 0.4]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[scaledW * 0.35, 2.5, scaledD * 0.35]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
          <Edges color={color} />
        </mesh>
      </group>

      {/* Basement indicator */}
      {basements > 0 && (
        <mesh position={[0, -(basements * scaledFH) / 2, 0]}>
          <boxGeometry args={[scaledW + 2, basements * scaledFH, scaledD + 2]} />
          <meshStandardMaterial color="#1e293b" transparent opacity={0.3} />
          <Edges color="#475569" />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, scaledTotalH + 4, 0]}
        fontSize={2.5}
        color={color}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        {`${floors}F · ${width}×${depth}m`}
      </Text>
    </group>
  );
}

function MiniPreviewScene({ floors, floorHeight, width, depth, basements, color }: {
  floors: number;
  floorHeight: number;
  width: number;
  depth: number;
  basements: number;
  color: string;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [45, 35, 45], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[30, 50, 20]} intensity={1.2} color="#fffbeb" />
      <Environment preset="city" />
      <MiniBuilding
        floors={floors}
        floorHeight={floorHeight}
        width={width}
        depth={depth}
        basements={basements}
        color={color}
      />
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={2.5}
        minDistance={20}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}

// ---------------------------------------------------------------------------
// FILE UPLOAD ZONE
// ---------------------------------------------------------------------------

function FileUploadZone({ label, icon, files, onFilesChange, accept }: {
  label: string;
  icon: React.ReactNode;
  files: string[];
  onFilesChange: (files: string[]) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: string[] = [];
    let loaded = 0;
    const total = Math.min(fileList.length, 5);

    for (let i = 0; i < total; i++) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newFiles.push(e.target.result as string);
          loaded++;
          if (loaded === total) {
            onFilesChange([...files, ...newFiles]);
          }
        }
      };
      reader.readAsDataURL(fileList[i]);
    }
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="reg-upload-zone-wrapper">
      <div className="reg-upload-label">{icon} {label}</div>
      <div
        className={`reg-upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept || 'image/*'}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <Upload size={20} />
        <span>Drag & drop or click to upload</span>
        <span className="reg-upload-hint">Max 5 files · JPG, PNG, PDF</span>
      </div>
      {files.length > 0 && (
        <div className="reg-upload-previews">
          {files.map((file, i) => (
            <div key={i} className="reg-upload-thumb">
              <img src={file} alt={`Upload ${i + 1}`} />
              <button className="reg-upload-remove" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN REGISTRATION MODAL
// ---------------------------------------------------------------------------

export default function RegistrationModal() {
  const { state, dispatch } = useAppContext();
  const parcel = state.selectedParcel;

  // Form state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Owner fields
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [ownerIdType, setOwnerIdType] = useState<ParcelOwner['idType']>('Aadhaar');
  const [ownerIdNumber, setOwnerIdNumber] = useState('');

  // Building fields
  const [buildingName, setBuildingName] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState(5);
  const [floorHeight, setFloorHeight] = useState(4);
  const [buildingWidth, setBuildingWidth] = useState(50);
  const [buildingDepth, setBuildingDepth] = useState(40);
  const [basementFloors, setBasementFloors] = useState(1);
  const [buildingType, setBuildingType] = useState<BuildingRegistration['buildingType']>('Academic');

  // Image uploads
  const [floorPlanImages, setFloorPlanImages] = useState<string[]>([]);
  const [buildingDesignImages, setBuildingDesignImages] = useState<string[]>([]);
  const [buildingPhotos, setBuildingPhotos] = useState<string[]>([]);

  const typeColors: Record<string, string> = {
    'Academic': '#3b82f6',
    'Residential': '#8b5cf6',
    'Commercial': '#f59e0b',
    'Mixed-Use': '#06b6d4',
  };

  const isStep1Valid = ownerName.trim() && ownerContact.trim() && ownerIdNumber.trim();
  const isStep2Valid = buildingName.trim() && numberOfFloors >= 1 && buildingWidth >= 10 && buildingDepth >= 10;

  const handleGenerate = useCallback(() => {
    if (!parcel) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate analysis progress
    const steps = [
      { progress: 15, delay: 400 },
      { progress: 35, delay: 800 },
      { progress: 55, delay: 1200 },
      { progress: 75, delay: 1600 },
      { progress: 90, delay: 2000 },
      { progress: 100, delay: 2400 },
    ];

    steps.forEach(({ progress, delay }) => {
      setTimeout(() => setGenerationProgress(progress), delay);
    });

    setTimeout(() => {
      const registration: BuildingRegistration = {
        parcelId: parcel.id,
        owner: {
          name: ownerName,
          contact: ownerContact,
          idType: ownerIdType,
          idNumber: ownerIdNumber,
        },
        buildingName,
        numberOfFloors,
        floorHeight,
        width: buildingWidth,
        depth: buildingDepth,
        basementFloors,
        buildingType,
        floorPlanImages,
        buildingDesignImages,
        buildingPhotos,
      };

      const { building, properties, floors } = generateBuildingFromRegistration(
        registration,
        parcel,
        state.siteData.buildings.length,
      );

      dispatch({
        type: 'REGISTER_BUILDING',
        registration,
        newBuilding: building,
        newProperties: properties,
        newFloors: floors,
      });

      setIsGenerating(false);
      setIsComplete(true);
    }, 2800);
  }, [parcel, ownerName, ownerContact, ownerIdType, ownerIdNumber, buildingName, numberOfFloors, floorHeight, buildingWidth, buildingDepth, basementFloors, buildingType, floorPlanImages, buildingDesignImages, buildingPhotos, state.siteData.buildings.length, dispatch]);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_REGISTRATION_MODAL' });
  };

  if (!parcel) return null;

  if (isComplete) {
    return (
      <div className="reg-overlay" onClick={handleClose}>
        <div className="reg-modal reg-modal-success" onClick={e => e.stopPropagation()}>
          <div className="reg-success-content">
            <div className="reg-success-icon">
              <Check size={48} />
            </div>
            <h2>Building Registered Successfully!</h2>
            <p>
              <strong>{buildingName}</strong> has been generated on <strong>{parcel.name}</strong> with {numberOfFloors} floors and {(numberOfFloors + basementFloors) * 6} property units.
            </p>
            <p className="reg-success-hint">The 3D building is now visible on the campus. Click it to explore floors and units.</p>
            <button className="reg-btn reg-btn-primary" onClick={handleClose}>
              <Building2 size={16} /> View in 3D Scene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-overlay" onClick={handleClose}>
      <div className="reg-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="reg-header">
          <div className="reg-header-info">
            <Building2 size={20} style={{ color: parcel.color }} />
            <div>
              <h2>Register New Building</h2>
              <span className="reg-parcel-badge" style={{ background: `${parcel.color}25`, color: parcel.color, border: `1px solid ${parcel.color}44` }}>
                {parcel.id} — {parcel.name}
              </span>
            </div>
          </div>
          <button className="reg-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="reg-steps">
          {[
            { num: 1, label: 'Owner Details', icon: <User size={14} /> },
            { num: 2, label: 'Building Design', icon: <Building2 size={14} /> },
            { num: 3, label: 'Upload Images', icon: <Image size={14} /> },
            { num: 4, label: '3D Preview', icon: <Layers size={14} /> },
          ].map(({ num, label, icon }) => (
            <div
              key={num}
              className={`reg-step ${step === num ? 'active' : ''} ${step > num ? 'completed' : ''}`}
              onClick={() => { if (num < step || (num === 2 && isStep1Valid) || (num === 3 && isStep2Valid) || num <= step) setStep(num as 1 | 2 | 3 | 4); }}
            >
              <div className="reg-step-circle">
                {step > num ? <Check size={12} /> : icon}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="reg-body">
          {/* STEP 1: Owner Details */}
          {step === 1 && (
            <div className="reg-step-content animate-slide-in">
              <div className="reg-section-title">
                <User size={16} /> Owner / Developer Information
              </div>

              <div className="reg-form-grid">
                <div className="reg-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                  />
                </div>
                <div className="reg-field">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={ownerContact}
                    onChange={e => setOwnerContact(e.target.value)}
                  />
                </div>
                <div className="reg-field">
                  <label>ID Type *</label>
                  <select value={ownerIdType} onChange={e => setOwnerIdType(e.target.value as ParcelOwner['idType'])}>
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>
                <div className="reg-field">
                  <label>ID Number *</label>
                  <input
                    type="text"
                    placeholder={ownerIdType === 'Aadhaar' ? 'XXXX XXXX XXXX' : ownerIdType === 'PAN' ? 'ABCDE1234F' : 'A1234567'}
                    value={ownerIdNumber}
                    onChange={e => setOwnerIdNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="reg-nav">
                <div />
                <button
                  className="reg-btn reg-btn-primary"
                  disabled={!isStep1Valid}
                  onClick={() => setStep(2)}
                >
                  Next: Building Design <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Building Design */}
          {step === 2 && (
            <div className="reg-step-content animate-slide-in">
              <div className="reg-section-title">
                <Building2 size={16} /> Building Configuration
              </div>

              <div className="reg-form-grid">
                <div className="reg-field reg-field-full">
                  <label>Building Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Innovation Research Centre"
                    value={buildingName}
                    onChange={e => setBuildingName(e.target.value)}
                  />
                </div>
                <div className="reg-field">
                  <label>Building Type *</label>
                  <select value={buildingType} onChange={e => setBuildingType(e.target.value as BuildingRegistration['buildingType'])}>
                    <option value="Academic">Academic</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed-Use">Mixed-Use</option>
                  </select>
                </div>
                <div className="reg-field">
                  <label>Number of Floors * ({numberOfFloors})</label>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={numberOfFloors}
                    onChange={e => setNumberOfFloors(Number(e.target.value))}
                  />
                  <div className="reg-range-labels"><span>1</span><span>15</span></div>
                </div>
                <div className="reg-field">
                  <label>Floor Height ({floorHeight}m)</label>
                  <input
                    type="range"
                    min={3}
                    max={6}
                    step={0.5}
                    value={floorHeight}
                    onChange={e => setFloorHeight(Number(e.target.value))}
                  />
                  <div className="reg-range-labels"><span>3m</span><span>6m</span></div>
                </div>
                <div className="reg-field">
                  <label>Width ({buildingWidth}m)</label>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    value={buildingWidth}
                    onChange={e => setBuildingWidth(Number(e.target.value))}
                  />
                  <div className="reg-range-labels"><span>15m</span><span>120m</span></div>
                </div>
                <div className="reg-field">
                  <label>Depth ({buildingDepth}m)</label>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    value={buildingDepth}
                    onChange={e => setBuildingDepth(Number(e.target.value))}
                  />
                  <div className="reg-range-labels"><span>15m</span><span>100m</span></div>
                </div>
                <div className="reg-field">
                  <label>Basement Floors ({basementFloors})</label>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    value={basementFloors}
                    onChange={e => setBasementFloors(Number(e.target.value))}
                  />
                  <div className="reg-range-labels"><span>0</span><span>3</span></div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="reg-stats-row">
                <div className="reg-stat">
                  <span className="reg-stat-value">{numberOfFloors * floorHeight}m</span>
                  <span className="reg-stat-label">Total Height</span>
                </div>
                <div className="reg-stat">
                  <span className="reg-stat-value">{buildingWidth * buildingDepth}m²</span>
                  <span className="reg-stat-label">Footprint</span>
                </div>
                <div className="reg-stat">
                  <span className="reg-stat-value">{(numberOfFloors + basementFloors) * 6}</span>
                  <span className="reg-stat-label">Total Units</span>
                </div>
                <div className="reg-stat">
                  <span className="reg-stat-value" style={{ color: typeColors[buildingType] }}>{buildingType}</span>
                  <span className="reg-stat-label">Type</span>
                </div>
              </div>

              <div className="reg-nav">
                <button className="reg-btn reg-btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button
                  className="reg-btn reg-btn-primary"
                  disabled={!isStep2Valid}
                  onClick={() => setStep(3)}
                >
                  Next: Upload Images <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Image Uploads */}
          {step === 3 && (
            <div className="reg-step-content animate-slide-in">
              <div className="reg-section-title">
                <Image size={16} /> Upload Reference Images
              </div>
              <div className="reg-upload-note">
                <AlertTriangle size={14} />
                Upload floor plans, building designs, and exterior photos. These will be analyzed to match the 3D model.
              </div>

              <FileUploadZone
                label="Floor Plans & Layouts"
                icon={<Layers size={14} />}
                files={floorPlanImages}
                onFilesChange={setFloorPlanImages}
              />
              <FileUploadZone
                label="Building Design / Elevation Drawings"
                icon={<Building2 size={14} />}
                files={buildingDesignImages}
                onFilesChange={setBuildingDesignImages}
              />
              <FileUploadZone
                label="Building Exterior Photos"
                icon={<Image size={14} />}
                files={buildingPhotos}
                onFilesChange={setBuildingPhotos}
              />

              <div className="reg-nav">
                <button className="reg-btn reg-btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button
                  className="reg-btn reg-btn-primary"
                  onClick={() => setStep(4)}
                >
                  Next: 3D Preview <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: 3D Preview & Generate */}
          {step === 4 && (
            <div className="reg-step-content animate-slide-in">
              <div className="reg-section-title">
                <Layers size={16} /> Live 3D Building Preview
              </div>

              <div className="reg-preview-container">
                <MiniPreviewScene
                  floors={numberOfFloors}
                  floorHeight={floorHeight}
                  width={buildingWidth}
                  depth={buildingDepth}
                  basements={basementFloors}
                  color={typeColors[buildingType] || '#06b6d4'}
                />
              </div>

              {/* Summary */}
              <div className="reg-summary">
                <div className="reg-summary-row">
                  <span>Owner</span>
                  <strong>{ownerName}</strong>
                </div>
                <div className="reg-summary-row">
                  <span>Building</span>
                  <strong>{buildingName || 'Unnamed'}</strong>
                </div>
                <div className="reg-summary-row">
                  <span>Configuration</span>
                  <strong>{numberOfFloors}F + {basementFloors}B · {buildingWidth}×{buildingDepth}m · {buildingType}</strong>
                </div>
                <div className="reg-summary-row">
                  <span>Images</span>
                  <strong>{floorPlanImages.length + buildingDesignImages.length + buildingPhotos.length} uploaded</strong>
                </div>
                <div className="reg-summary-row">
                  <span>Parcel</span>
                  <strong style={{ color: parcel.color }}>{parcel.id} — {parcel.name}</strong>
                </div>
              </div>

              {/* Generation Progress */}
              {isGenerating && (
                <div className="reg-progress">
                  <div className="reg-progress-bar">
                    <div className="reg-progress-fill" style={{ width: `${generationProgress}%` }} />
                  </div>
                  <div className="reg-progress-text">
                    <Loader2 size={14} className="reg-spinner" />
                    {generationProgress < 30 && 'Analyzing uploaded images...'}
                    {generationProgress >= 30 && generationProgress < 60 && 'Matching floor plans to 3D model...'}
                    {generationProgress >= 60 && generationProgress < 85 && 'Generating property units & ULPINs...'}
                    {generationProgress >= 85 && 'Finalizing 3D building model...'}
                  </div>
                </div>
              )}

              <div className="reg-nav">
                <button className="reg-btn reg-btn-secondary" onClick={() => setStep(3)} disabled={isGenerating}>Back</button>
                <button
                  className="reg-btn reg-btn-generate"
                  onClick={handleGenerate}
                  disabled={isGenerating || !isStep1Valid || !isStep2Valid}
                >
                  {isGenerating ? (
                    <><Loader2 size={16} className="reg-spinner" /> Generating...</>
                  ) : (
                    <><Building2 size={16} /> Analyze & Generate 3D Building</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

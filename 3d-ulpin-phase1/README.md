# 3D ULPIN — Phase 1 Prototype

> **3D Unique Land Parcel Identification Number (ULPIN) System**
> Prototype cadastral dashboard for vertical property mapping

⚠️ **DISCLAIMER**: This is a prototype demonstration application. All coordinates, property data, and ULPIN identifiers are sample/reference data and do not represent official government records.

---

## Features (Phase 1)

- **3D Visualization** — Buildings, floors, and properties rendered as interactive 3D volumes using Three.js
- **40 Sample Properties** — Distributed across 2 buildings, 10 floors, with realistic types and dimensions
- **Prototype ULPIN Generation** — Deterministic format: `3D-IN-{BUILDING}-{FLOOR}-{UNIT}`
- **Computed Validation** — 6 real checks: Geometry, Topology, Overlap, Floor Alignment, Parcel Link, ULPIN Uniqueness
- **Floor Isolation** — Select a floor to view only its properties
- **Layer Controls** — Toggle visibility of parcels, buildings, floors, properties, underground utilities
- **Property Selection** — Click any property volume to view full details
- **Search** — Filter properties by ID, ULPIN, type, or owner
- **Report Export** — Download property reports as JSON
- **Activity Logging** — All user interactions are tracked

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS v4 |
| 3D Engine | Three.js via @react-three/fiber |
| 3D Helpers | @react-three/drei |
| Icons | lucide-react |

**No API keys required.**

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Sample Data

| Entity | Count | Details |
|--------|-------|---------|
| Parcels | 3 | Main Campus, Sports Complex, Research Block |
| Buildings | 2 | B001 (7 floors), B002 (3 floors) |
| Properties | 40 | Residential, Commercial, Lab, Office, etc. |
| Underground | 2 | Water main, Electrical conduit |

**Location**: LPU (Lovely Professional University) area — Sample coordinates only.

## Usage

1. **Pan/Zoom/Rotate** — Use mouse to navigate the 3D scene
2. **Click a Building** — Shows floor selector in left panel
3. **Click a Floor** — Isolates that floor's properties
4. **Click a Property** — Shows details + ULPIN + validation in right panel
5. **Toggle Layers** — Show/hide different data layers
6. **Search** — Find properties by ID, ULPIN, type
7. **Generate Report** — Download property data as JSON

## Project Structure

```
frontend/src/
├── types/index.ts           — TypeScript interfaces
├── data/sampleLPU.ts        — Sample dataset (40 properties)
├── services/
│   ├── buildingGenerator.ts — Procedural floor generation
│   └── validationService.ts — Computed validation checks
├── context/AppContext.tsx    — Centralized state management
├── components/
│   ├── Dashboard.tsx        — Grid layout
│   ├── TopBar.tsx           — Title, search, status
│   ├── SceneViewer.tsx      — Three.js 3D scene
│   ├── LayerControl.tsx     — Layer toggles + tools
│   ├── FloorSelector.tsx    — Vertical floor menu
│   ├── PropertyDetails.tsx  — Property info + ULPIN + validation
│   └── BottomPanel.tsx      — Data tables + activity log
└── index.css                — Dark theme styles
```

## License

Prototype — For demonstration purposes only.

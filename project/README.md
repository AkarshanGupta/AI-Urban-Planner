## Urban Planning AI Studio

An interactive smart‑city design and analytics playground. Build and explore a 3D city, toggle planning layers, design infrastructure on a drag‑drop grid, view GIS maps, and get AI‑assisted suggestions and analytics.

### Features
- **Dual views**: 3D city (Three.js via `@react-three/fiber` + `@react-three/drei`) and **GIS Map** (`leaflet`) with quick switcher
 - **Dual views**: 3D city (Three.js via `@react-three/fiber` + `@react-three/drei`) and **GIS Map** (`maplibre-gl`) with quick switcher and 2D/3D toggle
- **Layer controls**: toggle zoning, infrastructure, green spaces, and utilities in the 3D view
- **Planning workflows** (left control panel tabs):
  - **City Generator**: tune demographics and environment; simulate city generation
  - **Infrastructure Designer**: place roads, hospitals, schools, airports on an 8×8 grid; optional traffic/utilities overlays
  - **Green Space Architect**: plan parks, biodiversity, native species; environmental analysis toggles
  - **Predictive Dashboard**: charts, timeline, climate risk assessment, and key metrics
- **AI assistance**: ask for road network suggestions or analytics using OpenAI or Google Gemini (configurable via env)
- **Export & import**: save the city scene as GLB (fallback to JSON), export a PDF snapshot report, reopen saved JSON projects
- **Dark mode** and modern Tailwind UI components

### Tech stack
- **Build**: Vite + React 19 + TypeScript
- **UI**: Tailwind CSS, Lucide icons
- **3D**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Charts**: Recharts
- **Maps**: MapLibre GL + OpenStreetMap tiles (2D/3D tilt/rotate)
- **AI**: OpenAI Chat Completions (via fetch) and Google Generative AI (Gemini)

### Getting started
1. Ensure Node.js 18+ is installed
2. Install dependencies

```bash
cd project
npm install
```

3. Start the dev server

```bash
npm run dev
```

4. Open the app at the URL shown in the terminal (typically `http://localhost:5173`).

### Scripts
- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview the production build
- `npm run lint`: run ESLint

### Environment variables (optional, for AI)
Create a `.env` file in `project/` to enable AI features:

```env
# OpenAI
VITE_OPENAI_API_KEY=sk-...
# Optional; defaults to "gpt-5" if not provided
VITE_OPENAI_MODEL=gpt-4o

# Google Gemini
VITE_GEMINI_API_KEY=...
# Optional; defaults to "gemini-1.5-flash" if not provided
VITE_GEMINI_MODEL=gemini-1.5-flash
```

Notes:
- Keys are used client‑side in this demo for convenience. For production, route requests through a secure backend.
- If no keys are set, the UI will still work; AI sections will show a helpful message.

### Using the app
- **Switch views**: Bottom‑right buttons toggle between 3D City and GIS Map.
- **3D controls**: zoom in/out, reset view, toggle animation; layer visibility via the left overlay.
- **Control panel**: left sidebar tabs for generator, infrastructure (with drag‑drop grid), green spaces, and analytics.
- **Save/Export/Open**: top‑bar buttons to save GLB/JSON, export a PDF report, and open a previously saved JSON.

### Project structure (high level)
```
project/
  src/
    components/
      CityVisualization.tsx      # 3D scene wrapper and controls
      GISMap.tsx                 # Leaflet map view
      ControlPanel.tsx           # Left sidebar with tabs
      planning/                  # Feature tabs (Generator, Infrastructure, etc.)
      visualization/             # 3D scene parts (CityScene, Layers, Traffic)
      ui/                        # Reusable UI widgets
    context/PlanningContext.tsx  # Global state (city data, layers, placements)
    lib/gpt.ts                   # OpenAI client (browser fetch)
    lib/gemini.ts                # Google Gemini client
```

### GIS tiles
The map uses OpenStreetMap tiles via the default Leaflet tile layer and requires no API key.

### Build & preview
```bash
npm run build
npm run preview
```

### License
This project is **All Rights Reserved**.

Copyright (c) 2025 Gupta Akarshan Anand. See `LICENSE` for details.

### Acknowledgements
- OpenStreetMap contributors (map tiles)
- Three.js, react‑three‑fiber, drei
- Recharts, Leaflet, Tailwind, Lucide



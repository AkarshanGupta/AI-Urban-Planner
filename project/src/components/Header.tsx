import React, { useRef } from 'react';
import { Building, Sun, Moon, Download, Save, FolderOpen, HelpCircle } from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { GLTFExporter } from 'three-stdlib';
import { jsPDF } from 'jspdf';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode }) => {
  const { cityData, viewLayers, placements, updateCityData, clearPlacements, addPlacement } = usePlanning();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = async () => {
    // Export current Three.js scene as GLB file
    try {
      const exporter = new GLTFExporter();
      const scene = (usePlanning as any).prototype?.threeScene ? null : null; // placeholder to keep types quiet
    } catch {}
    const scene = (usePlanning as any) ? null : null;
    try {
      // read live scene reference from context
      const { threeScene } = usePlanning();
      if (!threeScene) {
        console.warn('3D scene not ready; exporting project JSON instead.');
        const payload = {
          version: 1,
          savedAt: new Date().toISOString(),
          cityData,
          viewLayers,
          placements,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'urban-planning-project.json';
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const exporter = new GLTFExporter();
      exporter.parse(
        threeScene,
        (gltf) => {
          const arrayBuffer = (gltf as ArrayBuffer) || new TextEncoder().encode(JSON.stringify(gltf)).buffer;
          const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'city-scene.glb';
          a.click();
          URL.revokeObjectURL(url);
        },
        { binary: true }
      );
    } catch (err) {
      console.error('GLB export failed; falling back to project JSON', err);
      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        cityData,
        viewLayers,
        placements,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'urban-planning-project.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleExport = () => {
    // Export a simple PDF report snapshot
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const y0 = 40;
    doc.setFontSize(16);
    doc.text('Urban Planning AI Studio - City Report', 40, y0);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, y0 + 20);
    doc.text(`Grid: ${cityData.size} x ${cityData.size}`, 40, y0 + 40);
    doc.text(`Population: ${cityData.population.toLocaleString()}`, 40, y0 + 60);
    doc.text(`Density: ${cityData.populationDensity}/km²`, 40, y0 + 80);
    doc.text(`Climate: ${cityData.climate} | Terrain: ${cityData.terrain}`, 40, y0 + 100);
    doc.text(`Avg Income: $${cityData.averageIncome} | Age Diversity: ${cityData.ageDiversity}`, 40, y0 + 120);
    doc.text(`Placements (${placements.length}): ${placements.map(p => `${p.type}@${p.x},${p.y}`).join(' | ').slice(0, 500)}`, 40, y0 + 160, { maxWidth: 515 });
    doc.save('city-report.pdf');
  };

  const handleOpenClick = () => fileInputRef.current?.click();

  const handleOpenFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.cityData) {
        updateCityData(data.cityData);
      }
      if (Array.isArray(data.placements)) {
        clearPlacements();
        data.placements.forEach((p: any) => {
          if (typeof p?.x === 'number' && typeof p?.y === 'number' && typeof p?.type === 'string') {
            addPlacement({ id: p.id || `${p.type}-${p.x}-${p.y}`, type: p.type, x: p.x, y: p.y });
          }
        });
      }
      // Optionally could restore viewLayers; keep current user toggles if missing
    } catch (err) {
      console.error('Failed to open project file', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Urban Planning AI Studio
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligent City Design & Analysis Platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleOpenFile} />
          <button onClick={handleOpenClick} className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
            <FolderOpen className="h-4 w-4" />
            <span className="text-sm font-medium">Open Project</span>
          </button>
          
          <button onClick={handleSave} className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
            <Save className="h-4 w-4" />
            <span className="text-sm font-medium">Save</span>
          </button>
          
          <button onClick={handleExport} className="flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CityData {
  size: number;
  population: number;
  populationDensity: number;
  averageIncome: number;
  ageDiversity: number;
  climate: string;
  terrain: string;
  environmentalRisk: number;
}

interface ViewLayers {
  zoning: boolean;
  infrastructure: boolean;
  greenspace: boolean;
  utilities: boolean;
}

interface PlanningState {
  cityData: CityData;
  viewLayers: ViewLayers;
  isGenerating: boolean;
  placements: GridItem[];
  threeScene: any | null;
}

interface PlanningContextType extends PlanningState {
  updateCityData: (data: Partial<CityData>) => void;
  toggleLayer: (layerId: string) => void;
  generateCity: () => void;
  addPlacement: (item: GridItem) => void;
  removePlacementAt: (x: number, y: number) => void;
  clearPlacements: () => void;
  setThreeScene: (scene: any | null) => void;
}

export interface GridItem {
  id: string;
  type: string; // 'road' | 'hospital' | 'school' | 'airport'
  x: number; // 0..GRID_SIZE-1
  y: number; // 0..GRID_SIZE-1
}

export const PLACEMENT_GRID_SIZE = 8;

const initialState: PlanningState = {
  cityData: {
    size: 20,
    population: 250000,
    populationDensity: 2500,
    averageIncome: 75000,
    ageDiversity: 65,
    climate: 'temperate',
    terrain: 'flat',
    environmentalRisk: 25,
  },
  viewLayers: {
    zoning: true,
    infrastructure: true,
    greenspace: false,
    utilities: false,
  },
  isGenerating: false,
  placements: [],
  threeScene: null,
};

type PlanningAction =
  | { type: 'UPDATE_CITY_DATA'; payload: Partial<CityData> }
  | { type: 'TOGGLE_LAYER'; payload: string }
  | { type: 'START_GENERATION' }
  | { type: 'END_GENERATION' }
  | { type: 'ADD_PLACEMENT'; payload: GridItem }
  | { type: 'REMOVE_PLACEMENT_AT'; payload: { x: number; y: number } }
  | { type: 'CLEAR_PLACEMENTS' }
  | { type: 'SET_THREE_SCENE'; payload: any | null };

const planningReducer = (state: PlanningState, action: PlanningAction): PlanningState => {
  switch (action.type) {
    case 'UPDATE_CITY_DATA':
      return {
        ...state,
        cityData: { ...state.cityData, ...action.payload },
      };
    case 'TOGGLE_LAYER':
      return {
        ...state,
        viewLayers: {
          ...state.viewLayers,
          [action.payload]: !state.viewLayers[action.payload as keyof ViewLayers],
        },
      };
    case 'START_GENERATION':
      return { ...state, isGenerating: true };
    case 'END_GENERATION':
      return { ...state, isGenerating: false };
    case 'ADD_PLACEMENT': {
      const existing = state.placements.find(p => p.x === action.payload.x && p.y === action.payload.y);
      const nextPlacements = existing
        ? state.placements.map(p => (p.x === action.payload.x && p.y === action.payload.y ? action.payload : p))
        : [...state.placements, action.payload];
      return { ...state, placements: nextPlacements };
    }
    case 'REMOVE_PLACEMENT_AT': {
      return {
        ...state,
        placements: state.placements.filter(p => !(p.x === action.payload.x && p.y === action.payload.y)),
      };
    }
    case 'CLEAR_PLACEMENTS':
      return { ...state, placements: [] };
    case 'SET_THREE_SCENE':
      return { ...state, threeScene: action.payload };
    default:
      return state;
  }
};

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within PlanningProvider');
  }
  return context;
};

export const PlanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(planningReducer, initialState);

  // Auto-update city metrics based on parameters
  useEffect(() => {
    const timer = setInterval(() => {
      if (!state.isGenerating) {
        // Simulate real-time city metrics updates
        const populationGrowth = Math.random() * 1000 - 500;
        if (Math.abs(populationGrowth) > 100) {
          dispatch({ 
            type: 'UPDATE_CITY_DATA', 
            payload: { 
              population: Math.max(50000, state.cityData.population + populationGrowth)
            }
          });
        }
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(timer);
  }, [state.cityData.population, state.isGenerating]);

  const updateCityData = (data: Partial<CityData>) => {
    dispatch({ type: 'UPDATE_CITY_DATA', payload: data });
  };

  const toggleLayer = (layerId: string) => {
    dispatch({ type: 'TOGGLE_LAYER', payload: layerId });
  };

  const generateCity = async () => {
    dispatch({ type: 'START_GENERATION' });
    
    // Simulate city generation process with realistic timing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate AI-generated improvements
    const improvements = {
      populationDensity: Math.min(state.cityData.populationDensity * 1.1, 50000),
      environmentalRisk: Math.max(state.cityData.environmentalRisk * 0.9, 0),
    };
    
    dispatch({ type: 'UPDATE_CITY_DATA', payload: improvements });
    
    dispatch({ type: 'END_GENERATION' });
  };

  const addPlacement = (item: GridItem) => {
    dispatch({ type: 'ADD_PLACEMENT', payload: item });
  };

  const removePlacementAt = (x: number, y: number) => {
    dispatch({ type: 'REMOVE_PLACEMENT_AT', payload: { x, y } });
  };

  const clearPlacements = () => {
    dispatch({ type: 'CLEAR_PLACEMENTS' });
  };

  const setThreeScene = (scene: any | null) => {
    dispatch({ type: 'SET_THREE_SCENE', payload: scene });
  };

  const value: PlanningContextType = {
    ...state,
    updateCityData,
    toggleLayer,
    generateCity,
    addPlacement,
    removePlacementAt,
    clearPlacements,
    setThreeScene,
  };

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
};
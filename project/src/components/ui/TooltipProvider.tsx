import React, { createContext, useContext, useState } from 'react';

interface TooltipContextType {
  showTooltip: (content: string, x: number, y: number) => void;
  hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within TooltipProvider');
  }
  return context;
};

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  const showTooltip = (content: string, x: number, y: number) => {
    setTooltip({ content, x, y });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </TooltipContext.Provider>
  );
};
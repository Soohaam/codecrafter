"use client";

import React, { useEffect, useRef } from 'react';
import { useSimulation } from '@/components/simulation/SimulationContext';
import LaserBeams from './LaserBeams';
import DraggableFigure from './DraggableFigure';
import { cn } from '@/lib/utils';
import { URL } from 'url';
import forest1 from '../../../public/forest.jpg';
import building1 from '../../../public/building.jpg';
import { url } from 'inspector';

const SimulationArea: React.FC = () => {
  const { 
    activeFigures, 
    figures, 
    background, 
    alarmActive 
  } = useSimulation();
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Apply alarm effect when alarm is active
  useEffect(() => {
    if (containerRef.current) {
      if (alarmActive) {
        containerRef.current.classList.add('animate-alarm-flash');
      } else {
        containerRef.current.classList.remove('animate-alarm-flash');
      }
    }
  }, [alarmActive]);
  
  return (
    <div 
      id="simulation-container"
      ref={containerRef}
      className={cn(
        "relative w-full h-[500px] rounded-lg overflow-hidden border border-border",
        `bg-${background} bg-cover bg-center`
      )}
      style={{
        backgroundImage: background == 'forest' ? `url(/forest.jpg)` : `url(/building.jpg)`,
      }}
    >
      {/* Semi-transparent overlay for better visibility */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Render laser beams */}
      <LaserBeams alarmActive={alarmActive} />
      
      {/* Render active figures */}
      {Array.from(activeFigures.entries()).map(([figureId, position]) => {
        const figure = figures.find(f => f.id === figureId);
        if (!figure) return null;
        
        return (
          <DraggableFigure 
            key={figureId}
            figure={figure}
            position={position}
          />
        );
      })}
      
      {/* Road or path, depending on background */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0",
          background == 'forest' ? `url(/forest.jpg)` : `url(/building.jpg)`
                                   
        )}
      />
      
      {/* Help text for empty state */}
      {activeFigures.size === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/20 backdrop-blur-sm z-10">
          <div className="text-center p-6 max-w-xs">
            <h3 className="text-xl font-medium mb-2">Laser Security Simulation</h3>
            <p className="mb-4">Select figures from the controls below and drag them across the laser field to test the security system.</p>
            <div className="text-sm opacity-75">Cross the red laser beams to trigger detection events</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationArea;
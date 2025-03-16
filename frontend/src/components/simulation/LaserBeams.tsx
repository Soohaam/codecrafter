"use client";

import React, { useState, useEffect } from 'react';

interface LaserBeamsProps {
  alarmActive: boolean;
}

const LaserBeams: React.FC<LaserBeamsProps> = ({ alarmActive }) => {
  // Positions for the 6 laser beams - evenly spaced for consistent sizing reference
  const beamPositions = [100, 160, 220, 280, 340, 400];
  const laserX = 400; // X position of all lasers
  const beamSpacing = beamPositions[1] - beamPositions[0]; // Calculate consistent spacing
  const [pulseStates, setPulseStates] = useState<boolean[]>(beamPositions.map(() => false));
  
  // Create randomized pulse effect
  useEffect(() => {
    const pulseIntervals = beamPositions.map((_, index) => {
      return setInterval(() => {
        setPulseStates(prev => {
          const newStates = [...prev];
          newStates[index] = !newStates[index];
          return newStates;
        });
      }, 800 + Math.random() * 500); // Random intervals for more realistic effect
    });
    
    return () => {
      pulseIntervals.forEach(interval => clearInterval(interval));
    };
  }, []);
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {beamPositions.map((y, index) => {
        const isPulsing = pulseStates[index];
        return (
          <div 
            key={`laser-${index}`}
            className="absolute flex items-center"
            style={{
              left: `${laserX}px`,
              top: `${y}px`,
              width: '100%',
              height: '1px',
              transform: 'translateY(-50%)',
            }}
          >
            {/* The actual laser beam */}
            <div 
              className="h-0.5 bg-red-600 w-full"
              style={{
                opacity: isPulsing || alarmActive ? 0.9 : 0.7,
                boxShadow: `0 0 ${isPulsing || alarmActive ? '8px 3px' : '4px 2px'} rgba(255, 0, 0, 0.8)`,
                transition: 'opacity 0.2s, box-shadow 0.3s',
              }}
            />
            
            {/* Laser beam particle effect */}
            {(isPulsing || alarmActive) && (
              <div className="absolute left-0 top-0 w-full h-full">
                <div 
                  className="animate-pulse-fast absolute bg-red-500/50 w-full h-0.5"
                  style={{
                    filter: 'blur(1px)',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
      
      {/* Vertical line connecting all laser points */}
      <div 
        className="absolute w-0.5 bg-gray-400/30"
        style={{
          left: `${laserX}px`,
          top: `${beamPositions[0]}px`,
          height: `${beamPositions[beamPositions.length-1] - beamPositions[0]}px`,
        }}
      />
      
      {/* Laser emitter box */}
      <div 
        className="absolute w-6 h-82 bg-gray-800 rounded-md"
        style={{
          left: `${laserX - 12}px`, 
          top: `${beamPositions[0] - 10}px`,
        }}
      >
        {beamPositions.map((y, index) => (
          <div 
            key={`emitter-${index}`}
            className={`absolute w-2 h-2 rounded-full ${pulseStates[index] || alarmActive ? 'bg-red-600' : 'bg-red-800'}`}
            style={{
              left: '8px',
              top: `${y - beamPositions[0] + 10}px`,
              boxShadow: pulseStates[index] || alarmActive ? '0 0 8px 2px rgba(255, 0, 0, 0.7)' : '0 0 3px rgba(255, 0, 0, 0.5)',
              transition: 'background-color 0.2s, box-shadow 0.2s',
            }}
          />
        ))}
      </div>
      
      {/* Info panel showing the beam spacing */}
      <div className="absolute left-2 top-2 p-2 bg-black/70 text-white text-xs rounded">
        <span className="block">Laser grid: {beamSpacing}px spacing</span>
        <span className="block text-xs text-gray-300 mt-1">6 beams total · {beamPositions[beamPositions.length-1] - beamPositions[0]}px coverage</span>
      </div>
    </div>
  );
};

export default LaserBeams;
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '@/components/simulation/SimulationContext';
import { Figure } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface DraggableFigureProps {
  figure: Figure;
  position: { x: number; y: number };
}

const DraggableFigure: React.FC<DraggableFigureProps> = ({ figure, position }) => {
  const { moveFigure, selectedFigure, selectFigure } = useSimulation();
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const figureRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedFigure === figure.id;
  
  // Laser beam constants from LaserBeams.tsx
  const BEAM_POSITIONS = [100, 160, 220, 280, 340, 400];
  const BEAM_SPACING = BEAM_POSITIONS[1] - BEAM_POSITIONS[0];
  
  // Scale figure based on beam spacing - make sure humans are tall enough to cross multiple beams
  const getScaledDimensions = () => {
    let width = figure.width;
    let height = figure.height;
    
    // Calculate scale factors based on beams
    if (figure.type === 'human') {
      // A human should be 3-4 beams high
      const targetHeight = BEAM_SPACING * 3.5;
      const scale = targetHeight / figure.height;
      height = targetHeight;
      width = figure.width * scale;
    } else if (figure.type === 'large-animal') {
      // Large animals should be 2-3 beams high
      const targetHeight = BEAM_SPACING * 3.5;
      const scale = targetHeight / figure.height;
      height = targetHeight;
      width = figure.width * scale;
    } else if (figure.type === 'small-animal') {
      // Small animals should be about 1 beam high
      const targetHeight = BEAM_SPACING * 0.8;
      const scale = targetHeight / figure.height;
      height = targetHeight;
      width = figure.width * scale;
    } else if (figure.type === 'vehicle') {
      // Vehicles should be about 1.5 beams high
      const targetHeight = BEAM_SPACING * 3;
      const scale = targetHeight / figure.height;
      height = targetHeight;
      width = figure.width * scale;
    }
    
    return { width, height };
  };
  
  const { width, height } = getScaledDimensions();
  
  // Get ground level based on figure type
  const getGroundLevel = () => {
    const container = document.getElementById('simulation-container');
    if (!container) return 400; // Default fallback
    
    const containerHeight = container.getBoundingClientRect().height;
    
    // Position ground animals on the "road" at the bottom
    if (figure.type === 'small-animal' || figure.type === 'large-animal' || figure.type === 'vehicle') {
      // Adjust height based on scaled figure size to ensure feet/wheels are on the ground
      return containerHeight - height - 10;
    }
    
    // Humans can move a bit higher than ground animals but still have restrictions
    if (figure.type === 'human') {
      return containerHeight - height - 20;
    }
    
    // Default position (for flying objects if added later)
    return position.y;
  };
  
  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = figureRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      selectFigure(figure.id);
    }
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const container = document.getElementById('simulation-container');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          
          // Calculate new position relative to the container
          const newX = e.clientX - containerRect.left - offset.x;
          
          // For Y position: use ground level for ground animals, restricted movement for humans
          const groundLevel = getGroundLevel();
          
          // Ensure the figure stays within bounds
          const boundedX = Math.max(0, Math.min(newX, containerRect.width - width));
          
          // Move the figure - horizontal movement for all, vertical movement restricted by type
          moveFigure(figure.id, boundedX, groundLevel);
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset, figure, moveFigure, selectFigure, width, height]);
  
  // Calculate the transform based on speed for a slight animation effect
  const getTransform = () => {
    if (isDragging) {
      return `scale(1.05)`;
    }
    return 'scale(1)';
  };
  
  // Get highlight style for selected figure
  const getHighlightStyle = () => {
    if (isSelected) {
      return {
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.8), 0 0 10px rgba(0, 0, 0, 0.1)'
      };
    }
    return {};
  };
  
  // Get threat level color
  const getThreatLevelColor = () => {
    switch (figure.threatLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-orange-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Set initial position at ground level when component mounts
  useEffect(() => {
    if (!isDragging) {
      const groundLevel = getGroundLevel();
      if (position.y !== groundLevel) {
        moveFigure(figure.id, position.x, groundLevel);
      }
    }
  // Only run once on mount and when position.x changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figure.id, position.x, height]);
  
  // Calculate how many beams this figure would cross
  const getBeamsCrossedText = () => {
    // How many beams can this figure cross based on its height
    const potentialBeamsCrossed = Math.max(1, Math.round(height / BEAM_SPACING));
    return `${potentialBeamsCrossed} beam${potentialBeamsCrossed > 1 ? 's' : ''} crossed`;
  };
  
  return (
    <div
      ref={figureRef}
      className={cn(
        "absolute figure cursor-move select-none transition-transform",
        isDragging ? "z-50" : "z-20"
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: getTransform(),
        ...getHighlightStyle()
      }}
      onMouseDown={handleMouseDown}
    >
      <img 
        src={figure.imageUrl} 
        alt={figure.name}
        className="w-full h-full object-contain"
        draggable="false"
      />
      
      {/* Threat level indicator */}
      <div 
        className={cn(
          "absolute -bottom-2 -right-2 w-4 h-4 rounded-full border-2 border-white",
          getThreatLevelColor()
        )}
      />
      
      {/* Name label and beam info that appears on hover or when selected */}
      <div 
        className={cn(
          "absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 transition-opacity",
          (isSelected || isDragging) && "opacity-100"
        )}
      >
        <div className="font-medium">{figure.name}</div>
        <div className="text-xs text-gray-300">{getBeamsCrossedText()}</div>
      </div>
    </div>
  );
};

export default DraggableFigure;
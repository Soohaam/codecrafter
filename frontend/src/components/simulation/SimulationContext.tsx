"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Figure, LogEntry, Background, FigureType } from '@/types/simulation';
import { toast } from "sonner";

interface SimulationContextType {
  figures: Figure[];
  activeFigures: Map<string, { x: number; y: number; crossedLasers: boolean }>;
  logs: LogEntry[];
  background: Background;
  alarmActive: boolean;
  selectedFigure: string | null;
  
  setBackground: (bg: Background) => void;
  addFigure: (figureId: string, x: number, y: number) => void;
  removeFigure: (figureId: string) => void;
  moveFigure: (figureId: string, x: number, y: number) => void;
  selectFigure: (figureId: string | null) => void;
  clearLogs: () => void;
  resetSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Center position of the laser beams
const LASER_X_POSITION = 400;
// Positions of each of the 6 laser beams (y coordinates)
const LASER_POSITIONS = [100, 160, 220, 280, 340, 400];

// Sample figures data
const AVAILABLE_FIGURES: Figure[] = [
  {
    id: 'rabbit',
    type: 'small-animal',
    name: 'Rabbit',
    width: 30,
    height: 20,
    legs: 4,
    speed: 10,
    threatLevel: 'low',
    imageUrl: 'figures/Transparent-White-Bunny-Rabbit-PNG.png'
  },
  {
    id: 'squirrel',
    type: 'small-animal',
    name: 'Squirrel',
    width: 25,
    height: 30,
    legs: 4,
    speed: 8,
    threatLevel: 'low',
    imageUrl: 'figures/Scrat-PNG-Transparent.png'
  },
  {
    id: 'deer',
    type: 'large-animal',
    name: 'Deer',
    width: 60,
    height: 80,
    legs: 4,
    speed: 15,
    threatLevel: 'medium',
    imageUrl: 'figures/Deer-Download-PNG.png'
  },
  {
    id: 'bear',
    type: 'large-animal',
    name: 'Bear',
    width: 80,
    height: 100,
    legs: 4,
    speed: 12,
    threatLevel: 'high',
    imageUrl: 'figures/American-Black-Bear-PNG-Clipart.png'
  },
  {
    id: 'human',
    type: 'human',
    name: 'Human',
    width: 40,
    height: 90,
    legs: 2,
    speed: 5,
    threatLevel: 'medium',
    imageUrl: 'figures/Human-People-PNG.png'
  },
  {
    id: 'soldier',
    type: 'human',
    name: 'Soldier',
    width: 45,
    height: 90,
    legs: 2,
    speed: 7,
    threatLevel: 'high',
    imageUrl: 'figures/Soldier-PNG-Transparent.png'
  },
  {
    id: 'car',
    type: 'vehicle',
    name: 'Car',
    width: 90,
    height: 50,
    legs: 0,
    speed: 25,
    threatLevel: 'medium',
    imageUrl: 'figures/Car-PNG-Clipart.png'
  },
  {
    id: 'truck',
    type: 'vehicle',
    name: 'Truck',
    width: 120,
    height: 70,
    legs: 0,
    speed: 20,
    threatLevel: 'high',
    imageUrl: 'figures/Cargo-Truck-PNG-Transparent-Image.png'
  },
];

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [figures] = useState<Figure[]>(AVAILABLE_FIGURES);
  const [activeFigures, setActiveFigures] = useState<Map<string, { x: number; y: number; crossedLasers: boolean }>>(new Map());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [background, setBackground] = useState<Background>('forest');
  const [alarmActive, setAlarmActive] = useState(false);
  const [selectedFigure, setSelectedFigure] = useState<string | null>(null);
  
  // Sound effects
  const alarmSound = typeof Audio !== 'undefined' ? new Audio('sounds/alarm.mp3') : null;
  const laserSound = typeof Audio !== 'undefined' ? new Audio('sounds/preview.mp3') : null;
  
  const selectFigure = useCallback((figureId: string | null) => {
    setSelectedFigure(figureId);
  }, []);

  const addFigure = useCallback((figureId: string, x: number, y: number) => {
    setActiveFigures(prev => {
      const newMap = new Map(prev);
      newMap.set(figureId, { x, y, crossedLasers: false });
      return newMap;
    });
  }, []);

  const removeFigure = useCallback((figureId: string) => {
    setActiveFigures(prev => {
      const newMap = new Map(prev);
      newMap.delete(figureId);
      return newMap;
    });
  }, []);

  const moveFigure = useCallback((figureId: string, x: number, y: number) => {
    setActiveFigures(prev => {
      const figureData = prev.get(figureId);
      if (!figureData) return prev;
      
      const figure = figures.find(f => f.id === figureId);
      if (!figure) return prev;
      
      const newMap = new Map(prev);
      const prevX = figureData.x;
      
      // Check if crossing the laser line from left to right
      const crossingLaser = !figureData.crossedLasers && 
                            prevX < LASER_X_POSITION && 
                            x >= LASER_X_POSITION;
      
      if (crossingLaser) {
        // Calculate which beams were crossed based on the figure's height and position
        const figureTop = y;
        const figureBottom = y + figure.height;
        
        const crossedBeams = LASER_POSITIONS.filter(beamY => 
          beamY >= figureTop && beamY <= figureBottom
        );
        
        if (crossedBeams.length > 0) {
          // Play laser sound
          if (laserSound) {
            laserSound.currentTime = 0;
            laserSound.play().catch(e => console.error("Error playing laser sound:", e));
          }
          
          // Calculate speed based on how fast the figure moved
          const speed = Math.abs(x - prevX) * figure.speed / 10;
          
          // Create a log entry
          const logEntry: LogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            figureId: figure.id,
            figureName: figure.name,
            figureType: figure.type,
            speed,
            threatLevel: figure.threatLevel,
            beamsCrossed: crossedBeams.map(beam => LASER_POSITIONS.indexOf(beam) + 1)
          };
          
          setLogs(prev => [logEntry, ...prev]);
          
          // Activate alarm for medium and high threats
          if (figure.threatLevel !== 'low') {
            setAlarmActive(true);
            if (alarmSound) {
              alarmSound.currentTime = 0;
              alarmSound.play().catch(e => console.error("Error playing alarm sound:", e));
            }
            
            // Show toast notification
            toast(`Alert: ${figure.name} crossed laser field`, {
              description: `Threat level: ${figure.threatLevel.toUpperCase()}`,
              position: 'top-right',
              duration: 3000,
            });
          }
        }
      }
      
      newMap.set(figureId, { 
        x, 
        y, 
        crossedLasers: figureData.crossedLasers || crossingLaser 
      });
      
      return newMap;
    });
  }, [figures, alarmSound, laserSound]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const resetSimulation = useCallback(() => {
    setActiveFigures(new Map());
    setLogs([]);
    setAlarmActive(false);
    setSelectedFigure(null);
  }, []);

  // Turn off alarm after 5 seconds
  useEffect(() => {
    if (alarmActive) {
      const timeout = setTimeout(() => {
        setAlarmActive(false);
        if (alarmSound) {
          alarmSound.pause();
          alarmSound.currentTime = 0;
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [alarmActive, alarmSound]);

  return (
    <SimulationContext.Provider
      value={{
        figures,
        activeFigures,
        logs,
        background,
        alarmActive,
        selectedFigure,
        setBackground,
        addFigure,
        removeFigure,
        moveFigure,
        selectFigure,
        clearLogs,
        resetSimulation
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
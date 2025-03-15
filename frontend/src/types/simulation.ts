export type FigureType = 'small-animal' | 'large-animal' | 'human' | 'vehicle';

export interface Figure {
  id: string;
  type: FigureType;
  name: string;
  width: number;
  height: number;
  legs: number;
  speed: number;
  threatLevel: 'low' | 'medium' | 'high';
  imageUrl: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  figureId: string;
  figureName: string;
  figureType: FigureType;
  speed: number;
  threatLevel: 'low' | 'medium' | 'high';
  beamsCrossed: number[];
}

export type Background = 'forest' | 'building';
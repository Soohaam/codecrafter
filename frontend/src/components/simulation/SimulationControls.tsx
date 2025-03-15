"use client";

import React from 'react';
import { useSimulation } from '@/components/simulation/SimulationContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FigureType } from '@/types/simulation';
import { Toggle } from '@/components/ui/toggle';
import { RotateCw, Trash2, PlusCircle } from 'lucide-react';

const SimulationControls: React.FC = () => {
  const { 
    figures, 
    background, 
    setBackground, 
    addFigure, 
    resetSimulation, 
    clearLogs 
  } = useSimulation();
  
  const handleAddFigure = (figureId: string) => {
    // Position the figure on the left side of the screen
    const randomY = Math.floor(Math.random() * 300) + 50;
    addFigure(figureId, 50, randomY);
  };
  
  const figureTypes: FigureType[] = ['small-animal', 'large-animal', 'human', 'vehicle'];
  
  return (
    <div className="w-full p-4 glass-panel rounded-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Simulation Controls</h2>
        <div className="flex gap-2">
          <Toggle
            pressed={background === 'forest'}
            onPressedChange={() => setBackground('forest')}
            className="text-xs h-8"
          >
            Forest
          </Toggle>
          <Toggle
            pressed={background === 'building'}
            onPressedChange={() => setBackground('building')}
            className="text-xs h-8"
          >
            Building
          </Toggle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearLogs}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Logs
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetSimulation}
            className="h-8"
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="small-animal">
        <TabsList className="grid grid-cols-4 mb-4">
          {figureTypes.map(type => (
            <TabsTrigger key={type} value={type}>
              {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {figureTypes.map(type => (
          <TabsContent key={type} value={type} className="mt-0">
            <div className="grid grid-cols-4 gap-4">
              {figures
                .filter(figure => figure.type === type)
                .map(figure => (
                  <Card key={figure.id} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center">
                      <div className="w-20 h-20 flex items-center justify-center mb-2">
                        <img 
                          src={figure.imageUrl} 
                          alt={figure.name} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-center mb-2">
                        <p className="font-medium">{figure.name}</p>
                        <div className="flex items-center justify-center mt-1 text-xs text-gray-500">
                          <span className={`
                            w-2 h-2 rounded-full mr-1
                            ${figure.threatLevel === 'low' ? 'bg-green-500' : 
                              figure.threatLevel === 'medium' ? 'bg-orange-500' : 
                              'bg-red-500'}
                          `}></span>
                          {figure.threatLevel.charAt(0).toUpperCase() + figure.threatLevel.slice(1)} threat
                        </div>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleAddFigure(figure.id)}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SimulationControls;
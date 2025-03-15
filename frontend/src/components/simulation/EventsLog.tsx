"use client";

import React from 'react';
import { useSimulation } from '@/components/simulation/SimulationContext';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const EventsLog: React.FC = () => {
  const { logs } = useSimulation();
  
  // Displaying no logs message
  if (logs.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 h-[500px] border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Detection Events</h2>
        <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-gray-500">
          <p className="text-center">No detection events recorded yet.</p>
          <p className="text-center text-sm mt-2">
            Try crossing the laser field with different figures to see detection logs.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 h-[500px] border border-gray-200">
      <h2 className="text-lg font-medium mb-4">Detection Events</h2>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-3 pr-3">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={cn(
                "log-item p-3 bg-white/70 rounded-md shadow-sm animate-slide-in border-l-2",
                log.threatLevel === 'low' ? 'border-green-500' : 
                log.threatLevel === 'medium' ? 'border-orange-500' : 
                'border-red-500'
              )}
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-900">{log.figureName}</span>
                <span className="text-gray-500">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium",
                  log.threatLevel === 'low' ? 'bg-green-100 text-green-800' : 
                  log.threatLevel === 'medium' ? 'bg-orange-100 text-orange-800' : 
                  'bg-red-100 text-red-800'
                )}>
                  {log.threatLevel.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {log.figureType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
              
              <div className="text-xs text-gray-600">
                <p>
                  <span className="font-medium">Beams crossed:</span> {log.beamsCrossed.join(', ')}
                </p>
                <p>
                  <span className="font-medium">Estimated speed:</span> {log.speed.toFixed(1)} units/sec
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EventsLog;
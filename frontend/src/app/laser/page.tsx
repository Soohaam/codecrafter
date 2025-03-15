
"use client";

import React from 'react';
import { SimulationProvider } from '@/components/simulation/SimulationContext';
import SimulationArea from '@/components/simulation/SimulationArea';
import SimulationControls from '@/components/simulation/SimulationControls';
import EventsLog from '@/components/simulation/EventsLog';

const LaserSimulation: React.FC = () => {
  return (
    <SimulationProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Laser Field Security Simulation
            </h1>
            <p className="text-gray-500 mt-2">
              Test and analyze security detection with various objects crossing a laser field
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SimulationArea />
              <SimulationControls />
            </div>
            
            <div className="lg:col-span-1">
              <EventsLog />
            </div>
          </div>
        </div>
      </div>
    </SimulationProvider>
  );
};

export default LaserSimulation;
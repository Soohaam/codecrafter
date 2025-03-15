// src/components/dashboard/Dashboard.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import dynamic from 'next/dynamic';
import MonitoringPanel from './MonitoringPanel';
import EventsLog from './EventsLog';
import StatusBar from './StatusBar';
import { EventType, SecurityEvent } from '@/types/security';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

const HQ_LOCATION = { lat: 37.7749, lng: -122.4194 }; // San Francisco

const Dashboard = () => {
  const [laserActive, setLaserActive] = useState(true);
  const [laserBreach, setLaserBreach] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'fiber'>('standard');
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [rangeSize, setRangeSize] = useState(300); // meters
  const [selectedCamera, setSelectedCamera] = useState('cam-south');
  const [currentPersonEventId, setCurrentPersonEventId] = useState<string | null>(null);

  useEffect(() => {
    setEvents([
      {
        id: '1',
        timestamp: new Date().getTime() - 3600000,
        type: EventType.INFO,
        message: 'System initialized',
        details: 'All systems operational',
      },
      {
        id: '2',
        timestamp: new Date().getTime() - 1800000,
        type: EventType.INFO,
        message: 'Perimeter check complete',
        details: 'No anomalies detected',
      }
    ]);
  }, []);

  const handleLaserToggle = () => {
    if (laserActive) {
      addEvent({
        type: EventType.WARNING,
        message: 'Laser system deactivated',
        details: 'Manual deactivation by operator',
      });
    } else {
      addEvent({
        type: EventType.INFO,
        message: 'Laser system activated',
        details: 'Manual activation by operator',
      });
    }
    setLaserActive(!laserActive);
  };

  const simulateLaserBreach = () => {
    if (!laserBreach && laserActive) {
      setLaserBreach(true);
      addEvent({
        type: EventType.ALERT,
        message: 'LASER BREACH DETECTED',
        details: 'Perimeter breach at south-east sector',
      });
    }
  };

  const addEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const newEvent: SecurityEvent = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...event,
    };
    setEvents(prev => {
      const MAX_LOGS = 8;
      return [newEvent, ...prev].slice(0, MAX_LOGS);
    });
  };

  const handlePersonDetected = (personEvent: SecurityEvent) => {
    setCurrentPersonEventId(personEvent.id);
    
    // Add person detection event with pending status
    const existingPerson = events.find(e => 
      e.object_name === 'person' && 
      e.authorizationStatus === 'PENDING' && 
      e.id === personEvent.id
    );

    if (!existingPerson) {
      addEvent({
        type: EventType.INFO,
        message: 'Person detected',
        object_name: 'person',
        isPerson: true,
        authorizationStatus: 'PENDING',
        confidence: personEvent.confidence,
        id: personEvent.id,
      });
    }
  };

  const handleAuthorizationUpdate = (eventId: string, status: 'AUTHORIZED' | 'UNAUTHORIZED') => {
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            authorizationStatus: status,
            type: status === 'UNAUTHORIZED' ? EventType.ALERT : EventType.INFO,
            message: status === 'UNAUTHORIZED' 
              ? 'Unauthorized person detected (Threat)'
              : 'Authorized person detected',
          };
        }
        return event;
      });
      return updatedEvents;
    });

    // Clear current person event after authorization
    if (currentPersonEventId === eventId) {
      setCurrentPersonEventId(null);
    }
  };

  const handleExportLogs = (format: 'csv' | 'json') => {
    const formattedEvents = events.map(event => ({
      ID: event.id,
      Timestamp: new Date(event.timestamp).toISOString(),
      Type: event.type,
      Message: event.message || event.object_name,
      Details: event.authorizationStatus 
        ? `Status: ${event.authorizationStatus}`
        : event.confidence 
          ? `Accuracy: ${(event.confidence * 100).toFixed(1)}%`
          : event.details,
    }));

    let data: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      data = JSON.stringify(formattedEvents, null, 2);
      filename = `security-events-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      const header = Object.keys(formattedEvents[0]).join(',');
      const csv = formattedEvents.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      data = [header, ...csv].join('\n');
      filename = `security-events-${Date.now()}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 sm:p-6">
      <StatusBar 
        laserActive={laserActive} 
        laserBreach={laserBreach}
        onLaserToggle={handleLaserToggle}
        onBreachSimulate={simulateLaserBreach}
      />
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="dash-card h-[500px] p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Security Overview</h2>
              <Tabs defaultValue="standard" className="w-[240px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger 
                    value="standard"
                    onClick={() => setMapType('standard')}
                  >
                    Standard Map
                  </TabsTrigger>
                  <TabsTrigger 
                    value="fiber"
                    onClick={() => setMapType('fiber')}
                  >
                    Fiber Optic
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="h-[calc(100%-60px)]">
              <MapView 
                hqLocation={HQ_LOCATION} 
                mapType={mapType}
                rangeSize={rangeSize}
                laserActive={laserActive}
                laserBreach={laserBreach}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ResizablePanelGroup
            direction="horizontal"
            className="dash-card p-4"
          >
            <ResizablePanel defaultSize={65} minSize={40}>
              <MonitoringPanel 
                laserActive={laserActive} 
                laserBreach={laserBreach}
                selectedCamera={selectedCamera}
                onCameraChange={setSelectedCamera}
                onPersonDetected={handlePersonDetected}
                onAuthorizationUpdate={handleAuthorizationUpdate}
                currentPersonEventId={currentPersonEventId}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={25}>
              <EventsLog 
                events={events} 
                onExport={handleExportLogs}
                className="h-full"
                onPersonDetected={handlePersonDetected}
                onAuthorizationUpdate={handleAuthorizationUpdate}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="dash-card p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">System Configuration</h2>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Range Size (meters)
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={rangeSize}
                onChange={(e) => setRangeSize(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>100m</span>
                <span>{rangeSize}m</span>
                <span>1000m</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
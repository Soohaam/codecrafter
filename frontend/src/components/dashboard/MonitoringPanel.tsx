"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Camera, 
  Thermometer, 
  List, 
  AlertTriangle,
  User,
  Car,
  Package,
  Truck,
  Dog,
  AlertOctagon,
  RefreshCw,
  UserCheck // Add for face recognition
} from 'lucide-react';
import FaceRecognition from '../FaceRecognition';
import { SecurityEvent } from '@/types/security';

interface MonitoringPanelProps {
  laserActive: boolean;
  laserBreach: boolean;
  selectedCamera: string;
  onCameraChange: (camera: string) => void;
  onPersonDetected?: (personEvent: SecurityEvent) => void;
  onAuthorizationUpdate?: (eventId: string, status: 'AUTHORIZED' | 'UNAUTHORIZED') => void;
}

type DetectedObject = {
  id: string;
  type: 'person' | 'vehicle' | 'animal' | 'package' | 'unknown';
  confidence: number;
  timestamp: number;
  location: string;
};

type ViewType = 'detection' | 'thermal' | 'activity' | 'face-recognition';

const getObjectIcon = (type: DetectedObject['type']) => {
  switch (type) {
    case 'person': return <User className="h-4 w-4" />;
    case 'vehicle': return <Car className="h-4 w-4" />;
    case 'animal': return <Dog className="h-4 w-4" />;
    case 'package': return <Package className="h-4 w-4" />;
    default: return <AlertOctagon className="h-4 w-4" />;
  }
};

const MonitoringPanel = ({ 
  laserActive, 
  laserBreach, 
  selectedCamera, 
  onCameraChange,
  onPersonDetected,
  onAuthorizationUpdate
}: MonitoringPanelProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<ViewType>('detection');

  useEffect(() => {
    if (laserBreach) {
      setIsLoading(true);
      setHasError(false);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [laserBreach, activeTab]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     generateRandomObjects();
  //     setLastUpdateTime(Date.now());
  //   }, 8000);
  //   generateRandomObjects();
  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   if (laserBreach) {
  //     const breachObjects: DetectedObject[] = [
  //       {
  //         id: `breach-${Date.now()}`,
  //         type: 'person',
  //         confidence: 0.92,
  //         timestamp: Date.now(),
  //         location: 'South Perimeter'
  //       },
  //       {
  //         id: `breach-${Date.now() + 1}`,
  //         type: 'person',
  //         confidence: 0.88,
  //         timestamp: Date.now() + 100,
  //         location: 'South Perimeter'
  //       }
  //     ];
  //     setDetectedObjects(prev => [...breachObjects, ...prev].slice(0, 8));
  //     setLastUpdateTime(Date.now());
  //   }
  // }, [laserBreach]);

  // const generateRandomObjects = () => {
  //   const objectTypes: DetectedObject['type'][] = ['person', 'vehicle', 'animal', 'package', 'unknown'];
  //   const locations = ['North Perimeter', 'South Perimeter', 'East Perimeter', 'West Perimeter', 'Main Entrance'];
  //   const numObjects = Math.floor(Math.random() * 4);
    
  //   if (numObjects === 0) return;
    
  //   const newObjects: DetectedObject[] = [];
  //   for (let i = 0; i < numObjects; i++) {
  //     const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
  //     const confidence = Math.round((0.7 + Math.random() * 0.29) * 100) / 100;
  //     const location = locations[Math.floor(Math.random() * locations.length)];
  //     newObjects.push({
  //       id: Date.now().toString() + i,
  //       type,
  //       confidence,
  //       timestamp: Date.now() - Math.floor(Math.random() * 10000),
  //       location
  //     });
  //   }
  //   setDetectedObjects(prev => [...newObjects, ...prev].slice(0, 8));
  // };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const timeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdateTime) / 1000);
    return `${seconds}s ago`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handlePersonDetected = (personEvent: SecurityEvent) => {
    setActiveTab('face-recognition');
    if (onPersonDetected) {
      onPersonDetected(personEvent);
    }
  };

  const renderFeed = (viewType: ViewType) => {
    const feeds: Record<ViewType, { src: string; alt: string; label: string }> = {
      detection: {
        src: "http://localhost:5000/video_feed",
        alt: "Object Detection Feed",
        label: "CAM-01 • South Perimeter"
      },
      thermal: {
        src: "http://localhost:5000/video_feed_thermal",
        alt: "Thermal Camera Feed",
        label: "THERMAL • South Perimeter"
      },
      activity: {
        src: "http://localhost:5000/activity_feed",
        alt: "Activity Detection Feed",
        label: "ACTIVITY • South Perimeter"
      },
      'face-recognition': {
        src: "", // Not used for face recognition
        alt: "Face Recognition Feed",
        label: "FACE RECOGNITION • South Perimeter"
      }
    };

    if (viewType === 'face-recognition') {
      return (
        <div className="relative w-full h-full bg-gray-900">
          <FaceRecognition 
            onAuthorizationUpdate={(eventId, status) => {
              if (onAuthorizationUpdate) {
                onAuthorizationUpdate(eventId, status);
              }
            }}
          />
          <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE</span>
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
            {feeds[viewType].label}
          </div>
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded-md">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      );
    }

    const currentFeed = feeds[viewType];

    return (
      <div className="relative w-full h-full bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 mx-auto animate-spin mb-4"></div>
              <p className="text-blue-400 font-semibold">Loading {viewType} Feed...</p>
            </div>
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <p className="text-red-100 font-semibold">Error loading feed. Please check the camera source.</p>
          </div>
        ) : (
          <img
            src={currentFeed.src}
            alt={currentFeed.alt}
            className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>LIVE</span>
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
          {currentFeed.label}
        </div>
        <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded-md">
          {new Date().toLocaleTimeString()}
        </div>
        {laserBreach && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>BREACH DETECTED</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Monitoring</h2>
        <div className="flex items-center text-xs text-gray-500">
          <RefreshCw className="h-3 w-3 mr-1" />
          Updated {timeSinceUpdate()}
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as ViewType)} 
        className="w-full flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="detection" className="flex items-center">
            <Camera className="h-3 w-3 mr-1" />
            <span>Detection</span>
          </TabsTrigger>
          <TabsTrigger value="thermal" className="flex items-center">
            <Thermometer className="h-3 w-3 mr-1" />
            <span>Thermal</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <List className="h-3 w-3 mr-1" />
            <span>Activity</span>
          </TabsTrigger>
          <TabsTrigger value="face-recognition" className="flex items-center">
            <UserCheck className="h-3 w-3 mr-1" />
            <span>Face Recognition</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="detection" className="focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col">
          <div className="space-y-2 flex-1 flex flex-col">
            {renderFeed('detection')}
            <div className="mt-2">
              <h3 className="text-sm font-medium mb-2">Detected Objects</h3>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2">
                {detectedObjects.map(obj => (
                  <motion.div 
                    key={obj.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md text-sm"
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded mr-2">
                        {getObjectIcon(obj.type)}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{obj.type}</div>
                        <div className="text-xs text-gray-500">
                          {obj.location} • {formatTime(obj.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                      {Math.round(obj.confidence * 100)}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="thermal" className="focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col">
          <div className="space-y-2 flex-1 flex flex-col">
            {renderFeed('thermal')}
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col">
          <div className="space-y-2 flex-1 flex flex-col">
            {renderFeed('activity')}
          </div>
        </TabsContent>
        
        <TabsContent value="face-recognition" className="focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col">
          <div className="space-y-2 flex-1 flex flex-col">
            {renderFeed('face-recognition')}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringPanel;
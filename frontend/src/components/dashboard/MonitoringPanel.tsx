"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MonitoringPanelProps {
  laserActive: boolean;
  laserBreach: boolean;
  selectedCamera: string;
  onCameraChange: (camera: string) => void;
}

type DetectedObject = {
  id: string;
  type: 'person' | 'vehicle' | 'animal' | 'package' | 'unknown';
  confidence: number;
  timestamp: number;
  location: string;
};

type CameraOption = {
  id: string;
  name: string;
  location: string;
  bgPosition: string;
  backgroundImage: string;
};

const cameras: CameraOption[] = [
  {
    id: 'cam-south',
    name: 'CAM-01',
    location: 'South Perimeter',
    bgPosition: 'center 25%',
    backgroundImage: "url('https://images.unsplash.com/photo-1564328493747-c2a5d2e1e93e?q=80&w=1200&auto=format&fit=crop')"
  },
  {
    id: 'cam-north',
    name: 'CAM-02',
    location: 'North Perimeter',
    bgPosition: 'center 40%',
    backgroundImage: "url('https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?q=80&w=1200&auto=format&fit=crop')"
  },
  {
    id: 'cam-east',
    name: 'CAM-03',
    location: 'East Entrance',
    bgPosition: 'center 30%',
    backgroundImage: "url('https://images.unsplash.com/photo-1614505241498-e05b96d762df?q=80&w=1200&auto=format&fit=crop')"
  },
  {
    id: 'cam-west',
    name: 'CAM-04',
    location: 'West Gate',
    bgPosition: 'center 60%',
    backgroundImage: "url('https://images.unsplash.com/photo-1600623050499-84929aab4e0f?q=80&w=1200&auto=format&fit=crop')"
  },
  {
    id: 'cam-northeast',
    name: 'CAM-05',
    location: 'Northeast Corner',
    bgPosition: 'center 45%',
    backgroundImage: "url('https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1200&auto=format&fit=crop')"
  },
  {
    id: 'cam-building-1',
    name: 'CAM-06',
    location: 'Building A Entrance',
    bgPosition: 'center 50%',
    backgroundImage: "url('https://images.unsplash.com/photo-1517732748568-8ad74f1fbc5e?q=80&w=1200&auto=format&fit=crop')"
  },
  {
    id: 'cam-building-2',
    name: 'CAM-07',
    location: 'Building B Hallway',
    bgPosition: 'center 40%',
    backgroundImage: "url('https://images.unsplash.com/photo-1597444153936-2b571d083d73?q=80&w=1200&auto=format&fit=crop')"
  }
];

const getObjectIcon = (type: DetectedObject['type']) => {
  switch (type) {
    case 'person':
      return <User className="h-4 w-4" />;
    case 'vehicle':
      return <Car className="h-4 w-4" />;
    case 'animal':
      return <Dog className="h-4 w-4" />;
    case 'package':
      return <Package className="h-4 w-4" />;
    default:
      return <AlertOctagon className="h-4 w-4" />;
  }
};

const MonitoringPanel = ({ laserActive, laserBreach, selectedCamera, onCameraChange }: MonitoringPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [showCameraSelector, setShowCameraSelector] = useState(false);

  const currentCamera = cameras.find(cam => cam.id === selectedCamera) || cameras[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      generateRandomObjects();
      setLastUpdateTime(Date.now());
    }, 8000);
    
    generateRandomObjects();
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (laserBreach) {
      const breachObjects: DetectedObject[] = [
        {
          id: `breach-${Date.now()}`,
          type: 'person',
          confidence: 0.92,
          timestamp: Date.now(),
          location: 'South Perimeter'
        },
        {
          id: `breach-${Date.now() + 1}`,
          type: 'person',
          confidence: 0.88,
          timestamp: Date.now() + 100,
          location: 'South Perimeter'
        }
      ];
      
      setDetectedObjects(prev => [...breachObjects, ...prev].slice(0, 8));
      setLastUpdateTime(Date.now());
    }
  }, [laserBreach]);

  const generateRandomObjects = () => {
    const objectTypes: DetectedObject['type'][] = ['person', 'vehicle', 'animal', 'package', 'unknown'];
    const locations = ['North Perimeter', 'South Perimeter', 'East Perimeter', 'West Perimeter', 'Main Entrance'];
    
    const numObjects = Math.floor(Math.random() * 4);
    
    if (numObjects === 0) {
      return;
    }
    
    const newObjects: DetectedObject[] = [];
    
    for (let i = 0; i < numObjects; i++) {
      const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
      const confidence = Math.round((0.7 + Math.random() * 0.29) * 100) / 100;
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      newObjects.push({
        id: Date.now().toString() + i,
        type,
        confidence,
        timestamp: Date.now() - Math.floor(Math.random() * 10000),
        location
      });
    }
    
    setDetectedObjects(prev => [...newObjects, ...prev].slice(0, 8));
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  };

  const timeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdateTime) / 1000);
    return `${seconds}s ago`;
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
      
      <Tabs defaultValue="detection" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
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
        </TabsList>
        
        <TabsContent value="detection" className="focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col">
          {loading ? (
            <div className="space-y-2 flex-1">
              <Skeleton className="h-full w-full rounded-lg" />
              <div className="flex items-center justify-center h-10 text-gray-500">
                Loading camera feed...
              </div>
            </div>
          ) : (
            <div className="space-y-2 flex-1 flex flex-col">
              <div className="relative rounded-lg overflow-hidden bg-black flex-1">
                <div className="relative w-full h-full flex items-center justify-center">
                  {laserBreach && currentCamera.id === 'cam-south' ? (
                    <div className="absolute inset-0">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full bg-cover bg-center"
                        style={{ 
                          backgroundImage: "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop')",
                          backgroundPosition: "center 40%"
                        }}
                      />
                      
                      <div className="absolute inset-0">
                        <motion.div 
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute border-2 border-red-500 rounded w-32 h-64 bottom-0 left-1/3 transform -translate-x-1/2"
                        >
                          <div className="bg-red-500 text-white text-xs px-1 py-0.5 absolute -top-6 left-0">
                            Person 92%
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0">
                      <div className="w-full h-full bg-cover bg-center opacity-80"
                        style={{ 
                          backgroundImage: currentCamera.backgroundImage,
                          backgroundPosition: currentCamera.bgPosition
                        }}
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-lg font-medium">
                          {detectedObjects.length === 0 ? (
                            <span>No objects detected</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>LIVE</span>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                    {currentCamera.name} • {currentCamera.location}
                  </div>
                  
                  <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded-md">
                    {new Date().toLocaleTimeString()}
                  </div>
                  
                  <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                    {laserBreach && currentCamera.id === 'cam-south' ? (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center animate-pulse">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span>BREACH DETECTED</span>
                      </div>
                    ) : (
                      <div className="bg-green-500/70 text-white text-xs px-2 py-1 rounded-md">
                        Secure
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="absolute top-10 right-2 bg-black/30 text-white hover:bg-black/50 hover:text-white"
                    onClick={() => setShowCameraSelector(!showCameraSelector)}
                  >
                    {showCameraSelector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  {showCameraSelector && (
                    <div className="absolute top-[72px] right-2 bg-black/80 rounded-md p-2 space-y-1 z-10 max-h-48 overflow-y-auto">
                      {cameras.map(camera => (
                        <div 
                          key={camera.id}
                          className={`text-xs px-2 py-1.5 rounded cursor-pointer flex items-center ${camera.id === selectedCamera ? 'bg-blue-500/30 text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                          onClick={() => {
                            onCameraChange(camera.id);
                            setShowCameraSelector(false);
                          }}
                        >
                          <Camera className="h-3 w-3 mr-1.5" />
                          <span>{camera.name} - {camera.location}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-2">
                <h3 className="text-sm font-medium mb-2">Detected Objects</h3>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2">
                  {detectedObjects.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2 text-center">
                      No objects detected in view
                    </div>
                  ) : (
                    detectedObjects.map(obj => (
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
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="thermal" className="focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col">
          <div className="space-y-2 flex-1">
            <div className="relative rounded-lg overflow-hidden bg-black flex-1">
              <div className="w-full h-full flex items-center justify-center">
                <div className="absolute inset-0">
                  <div className="w-full h-full bg-cover bg-center"
                    style={{ 
                      backgroundImage: "url('https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200&auto=format&fit=crop')",
                      filter: "hue-rotate(180deg) saturate(200%) contrast(150%)",
                      backgroundPosition: "center 25%",
                      mixBlendMode: "screen"
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-40"></div>
                </div>
                
                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>THERMAL</span>
                </div>
                
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                  32.4°C • Average
                </div>
                
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded-md">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="py-2 text-center text-sm text-gray-500">
              Thermal imaging provides heat-based detection capability in low-light conditions
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="focus-visible:outline-none focus-visible:ring-0 flex-1">
          <div className="space-y-2 max-h-full overflow-y-auto pr-2">
            {detectedObjects.map(obj => (
              <motion.div 
                key={`activity-${obj.id}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md text-sm"
              >
                <div className="flex items-center">
                  <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded mr-2">
                    {getObjectIcon(obj.type)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{obj.type} detected</div>
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
            
            {detectedObjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent activity detected
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringPanel;

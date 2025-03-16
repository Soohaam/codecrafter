"use client";
// pages/index.js
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SensorControls from "../../components/SensorControls";
import EventLog from "../../components/EventLog";
import CameraFeed from "../../components/CameraFeed";
import ThreatAlerts from "../../components/ThreatAlerts";
import EnvironmentalControls from "../../components/EnvironmentalControls";

// Import map component dynamically to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

export default function Dashboard2() {
  // State for environmental conditions
  const [environment, setEnvironment] = useState({
    weather: "clear",
    timeOfDay: "day",
    temperature: 25,
  });

  // State for sensor configurations
  const [sensorConfig, setSensorConfig] = useState({
    camera: { sensitivity: "medium", status: "active", range: 100 },
    laser: { sensitivity: "high", status: "active", range: 50 },
    fiber: { sensitivity: "medium", status: "active", range: 200 },
    radar: { sensitivity: "medium", status: "active", range: 300 },
  });

  // State for detected events and threats
  const [events, setEvents] = useState([]);
  const [threats, setThreats] = useState([]);
  
  // State for security parameters
  const [securityParameters, setSecurityParameters] = useState({
    sensorTypes: ["camera", "laser_perimeter", "fiber", "radar"],
    threatTypes: ["movement", "intrusion", "anomaly", "perimeter breach"],
    severityLevels: ["medium", "high"]
  });

  // State for current view mode
  const [viewMode, setViewMode] = useState("normal"); // 'normal' or 'fiber'

  // Handle perimeter breach detection from MapComponent
  const handlePerimeterDetection = (threat, detectorType) => {
    // Mark the threat as detected and record what detected it
    const updatedThreats = threats.map(t => {
      if (t.id === threat.id) {
        return {
          ...t,
          detected: true,
          detectedBy: detectorType || "laser_perimeter"
        };
      }
      return t;
    });
    
    setThreats(updatedThreats);
    
    // Log the perimeter breach event
    const newEvent = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: "perimeter_breach",
      location: threat.location,
      severity: threat.severity,
      sensorType: detectorType || "laser_perimeter",
      details: `Perimeter breach detected by ${detectorType || "laser perimeter"}`
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 100));
  };

  // Mock detection of a new event
  const detectEvent = (type, location, severity) => {
    const newEvent = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      location,
      severity,
      sensorType: ["camera", "laser", "fiber", "radar"][
        Math.floor(Math.random() * 4)
      ],
    };

    setEvents((prev) => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events

    // Process event into threat if needed
    if (severity === "high") {
      const newThreat = {
        ...newEvent,
        status: "active",
        assessed: false,
        detected: false, // Initially not detected by perimeter
      };
      setThreats((prev) => [newThreat, ...prev]);
    }
  };

  // Simulated sensor data updates (would be replaced by WebSocket in production)
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance of detecting an event
      if (Math.random() < 0.1) {
        const types = ["movement", "intrusion", "anomaly", "perimeter breach"];
        const locations = [
          {
            lat: 34.0522 + Math.random() * 0.01,
            lng: -118.2437 + Math.random() * 0.01,
          },
          {
            lat: 34.0522 - Math.random() * 0.01,
            lng: -118.2437 - Math.random() * 0.01,
          },
        ];
        const severities = ["low", "medium", "high"];

        detectEvent(
          types[Math.floor(Math.random() * types.length)],
          locations[Math.floor(Math.random() * locations.length)],
          severities[Math.floor(Math.random() * severities.length)]
        );
      }

      // Update sensor statuses based on environment and random factors
      if (Math.random() < 0.05) {
        const sensorTypes = ["camera", "laser", "fiber", "radar"];
        const sensorType =
          sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
        const newStatus =
          Math.random() < 0.7
            ? "active"
            : Math.random() < 0.5
            ? "standby"
            : "fault";

        setSensorConfig((prev) => ({
          ...prev,
          [sensorType]: {
            ...prev[sensorType],
            status: newStatus,
          },
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle environment change
  const updateEnvironment = (newEnvironment) => {
    setEnvironment((prev) => {
      const updated = { ...prev, ...newEnvironment };
      
      // Log environmental change
      const environmentChangeEvent = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: "environment_change",
        details: JSON.stringify(newEnvironment),
        severity: "info",
      };
      
      setEvents((prevEvents) => [environmentChangeEvent, ...prevEvents]);
      
      // Adjust sensor behavior based on new environment
      const newSensorConfig = { ...sensorConfig };
      
      // Example: Camera is less effective at night
      if (updated.timeOfDay === "night" && newSensorConfig.camera.status === "active") {
        newSensorConfig.camera.range = Math.floor(newSensorConfig.camera.range * 0.6);
      } else if (updated.timeOfDay === "day" && newSensorConfig.camera.status === "active") {
        newSensorConfig.camera.range = 100;
      }
      
      // Example: Laser is affected by weather
      if (updated.weather === "fog" || updated.weather === "rain") {
        newSensorConfig.laser.range = Math.floor(newSensorConfig.laser.range * 0.7);
      } else {
        newSensorConfig.laser.range = 50;
      }
      
      setSensorConfig(newSensorConfig);
      
      return updated;
    });
  };

  // Handle sensor configuration change
  const updateSensorConfig = (sensor, config) => {
    setSensorConfig((prev) => {
      const updated = {
        ...prev,
        [sensor]: {
          ...prev[sensor],
          ...config,
        }
      };
      
      // Log sensor configuration change
      const configChangeEvent = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: "sensor_config_change",
        details: `${sensor}: ${JSON.stringify(config)}`,
        severity: "info",
      };
      
      setEvents((prevEvents) => [configChangeEvent, ...prevEvents]);
      
      return updated;
    });
  };

  // Handle marking a threat as assessed
  const handleThreatAssessment = (threatId, action) => {
    setThreats(prevThreats => 
      prevThreats.map(threat => 
        threat.id === threatId 
          ? { ...threat, assessed: true, status: action === 'dismiss' ? 'dismissed' : 'investigating' }
          : threat
      )
    );
  };

  // Toggle view mode between normal and fiber
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "normal" ? "fiber" : "normal"));
  };

  const sensorsArray = Object.entries(sensorConfig).map(([type, config]) => ({
    type,
    ...config,
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          High-Security Base Surveillance Dashboard
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={toggleViewMode}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            {viewMode === "normal"
              ? "Switch to Fiber View"
              : "Switch to Normal View"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 p-4 h-[calc(100vh-4rem)]">
        {/* Left column - Map and controls */}
        <div className="col-span-2 grid grid-rows-3 gap-4">
          <div className="row-span-2 bg-gray-800 rounded-lg overflow-hidden">
            <MapComponent
              environment={environment}
              sensors={sensorsArray}
              events={events.filter(
                (e) =>
                  e.type !== "environment_change" &&
                  e.type !== "sensor_config_change"
              )}
              threats={threats}
              viewMode={viewMode}
              onDetectThreat={handlePerimeterDetection}
            />
          </div>
          {/* <div className="bg-gray-800 rounded-lg p-4">
            <SensorControls
              sensorConfig={sensorConfig}
              updateSensorConfig={updateSensorConfig}
            />
          </div> */}
        </div>

        {/* Right column - Feeds and logs */}
        <div className="col-span-2 grid grid-rows-4 gap-4">
          <div className="row-span-1 bg-gray-800 rounded-lg p-4">
            <EnvironmentalControls
              environment={environment}
              updateEnvironment={updateEnvironment}
            />
          </div>
          <div className="row-span-1 bg-gray-800 rounded-lg overflow-hidden">
            <CameraFeed type="normal" environment={environment} />
          </div>

          {/* <div className="bg-gray-800 rounded-lg overflow-hidden p-2">
            <ThreatAlerts 
              threats={threats} 
              securityParameters={securityParameters}
              onInvestigate={(threatId) => handleThreatAssessment(threatId, 'investigate')}
              onDismiss={(threatId) => handleThreatAssessment(threatId, 'dismiss')}
            />
          </div> */}

          <div className="bg-gray-800 rounded-lg overflow-hidden p-2">
            <EventLog events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
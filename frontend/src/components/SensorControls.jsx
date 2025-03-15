// components/SensorControls.js
import { useState } from 'react';

const SensorControls = ({ sensorConfig, updateSensorConfig }) => {
  const sensors = Object.keys(sensorConfig);
  
  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'standby': return 'bg-yellow-500';
      case 'fault': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-3">Sensor Controls</h2>
      <div className="grid grid-cols-2 gap-4">
        {sensors.map(sensor => (
          <div key={sensor} className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium capitalize">{sensor} Sensor</h3>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(sensorConfig[sensor].status)}`}></div>
            </div>
            
            <div className="space-y-2">
              {/* Sensitivity control */}
              <div>
                <label htmlFor={`${sensor}-sensitivity`} className="block text-sm text-gray-300">
                  Sensitivity
                </label>
                <select
                  id={`${sensor}-sensitivity`}
                  value={sensorConfig[sensor].sensitivity}
                  onChange={(e) => updateSensorConfig(sensor, { sensitivity: e.target.value })}
                  className="w-full bg-gray-600 text-white text-sm rounded p-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              {/* Status control */}
              <div>
                <label htmlFor={`${sensor}-status`} className="block text-sm text-gray-300">
                  Status
                </label>
                <select
                  id={`${sensor}-status`}
                  value={sensorConfig[sensor].status}
                  onChange={(e) => updateSensorConfig(sensor, { status: e.target.value })}
                  className="w-full bg-gray-600 text-white text-sm rounded p-1"
                >
                  <option value="active">Active</option>
                  <option value="standby">Standby</option>
                  <option value="fault">Simulate Fault</option>
                </select>
              </div>
              
              {/* Range control */}
              <div>
                <label htmlFor={`${sensor}-range`} className="block text-sm text-gray-300">
                  Range (m): {sensorConfig[sensor].range}
                </label>
                <input
                  type="range"
                  id={`${sensor}-range`}
                  min={10}
                  max={500}
                  value={sensorConfig[sensor].range}
                  onChange={(e) => updateSensorConfig(sensor, { range: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorControls;
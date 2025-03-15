import { useState } from 'react';

const EnvironmentalControls = ({ environment, updateEnvironment }) => {
  const weatherOptions = ['clear', 'rain', 'fog', 'snow', 'sandstorm', 'hail', 'thunderstorm', 'hurricane'];
  const timeOptions = ['day', 'night', 'dusk', 'dawn'];
  const terrainOptions = ['urban', 'forest', 'desert', 'mountain', 'coastal'];

  // Determine sensor priorities based on current environmental conditions
  const getSensorPriorities = () => {
    const priorities = [];
    
    // Base conditions affecting sensors
    if (environment.weather === 'fog' || environment.weather === 'sandstorm') {
      priorities.push({ sensor: 'Radar', priority: 'High', reason: 'Low visibility conditions' });
      priorities.push({ sensor: 'Camera', priority: 'Low', reason: 'Visibility severely reduced' });
      priorities.push({ sensor: 'LIDAR', priority: 'Medium', reason: 'Partial functionality in low visibility' });
    } else if (environment.weather === 'rain' || environment.weather === 'snow') {
      priorities.push({ sensor: 'Radar', priority: 'High', reason: 'Functions well in precipitation' });
      priorities.push({ sensor: 'LIDAR', priority: 'Low', reason: 'Precipitation interferes with laser' });
      priorities.push({ sensor: 'Camera', priority: 'Medium', reason: 'Reduced effectiveness in precipitation' });
    } else if (environment.weather === 'thunderstorm' || environment.weather === 'hurricane') {
      priorities.push({ sensor: 'Radar', priority: 'Medium', reason: 'Electromagnetic interference risk' });
      priorities.push({ sensor: 'GPS', priority: 'Low', reason: 'Signal disruption likely' });
      priorities.push({ sensor: 'Inertial', priority: 'High', reason: 'Independent of weather conditions' });
    } else if (environment.weather === 'clear') {
      priorities.push({ sensor: 'Camera', priority: 'High', reason: 'Optimal visibility' });
      priorities.push({ sensor: 'LIDAR', priority: 'High', reason: 'Optimal range and accuracy' });
    }

    // Time of day considerations
    if (environment.timeOfDay === 'night') {
      priorities.push({ sensor: 'Thermal', priority: 'High', reason: 'Superior night vision capability' });
      priorities.push({ sensor: 'Camera', priority: 'Low', reason: 'Limited vision in darkness' });
      priorities.push({ sensor: 'LIDAR', priority: 'High', reason: 'Unaffected by darkness' });
    } else if (environment.timeOfDay === 'dusk' || environment.timeOfDay === 'dawn') {
      priorities.push({ sensor: 'Camera', priority: 'Medium', reason: 'Transition lighting conditions' });
      priorities.push({ sensor: 'Thermal', priority: 'Medium', reason: 'Useful during light transition' });
    }

    // Temperature considerations
    if (environment.temperature < -10) {
      priorities.push({ sensor: 'Battery Systems', priority: 'Low', reason: 'Cold affecting power efficiency' });
      priorities.push({ sensor: 'Thermal', priority: 'Medium', reason: 'Temperature contrast reduced' });
    } else if (environment.temperature > 40) {
      priorities.push({ sensor: 'Electronics', priority: 'Low', reason: 'Risk of overheating' });
    }

    // Terrain considerations
    if (environment.terrain === 'urban') {
      priorities.push({ sensor: 'GPS', priority: 'Medium', reason: 'Signal reflection issues' });
      priorities.push({ sensor: 'LIDAR', priority: 'High', reason: 'Precise obstacle detection' });
    } else if (environment.terrain === 'forest') {
      priorities.push({ sensor: 'GPS', priority: 'Low', reason: 'Canopy interference' });
      priorities.push({ sensor: 'Radar', priority: 'High', reason: 'Penetrates vegetation' });
    } else if (environment.terrain === 'mountain') {
      priorities.push({ sensor: 'Altimeter', priority: 'High', reason: 'Elevation changes critical' });
      priorities.push({ sensor: 'GPS', priority: 'Medium', reason: 'Signal may be obscured by terrain' });
    }

    // Remove duplicates by keeping the highest priority for each sensor
    const uniquePriorities = {};
    priorities.forEach(item => {
      const existingItem = uniquePriorities[item.sensor];
      if (!existingItem || getPriorityValue(item.priority) > getPriorityValue(existingItem.priority)) {
        uniquePriorities[item.sensor] = item;
      }
    });

    return Object.values(uniquePriorities).sort((a, b) => 
      getPriorityValue(b.priority) - getPriorityValue(a.priority)
    );
  };

  const getPriorityValue = (priority) => {
    switch (priority) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getEnvironmentalWarnings = () => {
    const warnings = [];
    
    if (environment.weather === 'fog') {
      warnings.push('⚠️ Fog reducing camera and laser range');
    }
    if (environment.weather === 'rain') {
      warnings.push('⚠️ Rain affecting laser accuracy and ground sensors');
    }
    if (environment.weather === 'snow') {
      warnings.push('⚠️ Snow accumulation may affect ground sensors');
    }
    if (environment.weather === 'sandstorm') {
      warnings.push('⚠️ Sandstorm causing abrasion risk to moving parts');
    }
    if (environment.weather === 'thunderstorm') {
      warnings.push('⚠️ Lightning risk to electrical systems');
    }
    if (environment.weather === 'hurricane') {
      warnings.push('⚠️ Extreme conditions - operation not recommended');
    }
    if (environment.timeOfDay === 'night') {
      warnings.push('⚠️ Night conditions reducing camera effectiveness');
    }
    if (environment.temperature < -20) {
      warnings.push('⚠️ Extreme cold affecting battery performance');
    }
    if (environment.temperature > 45) {
      warnings.push('⚠️ Extreme heat risk to electronic components');
    }
    if (environment.weather === 'clear' && environment.timeOfDay === 'day' && 
        environment.temperature > 0 && environment.temperature < 40) {
      warnings.push('✓ Optimal conditions for all sensors');
    }
    
    return warnings;
  };

  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-3">Environmental Controls</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Weather control */}
        <div>
          <label htmlFor="weather" className="block text-sm text-gray-300 mb-1">
            Weather Condition
          </label>
          <select
            id="weather"
            value={environment.weather}
            onChange={(e) => updateEnvironment({ weather: e.target.value })}
            className="w-full bg-gray-600 text-white rounded p-2"
          >
            {weatherOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Time of day control */}
        <div>
          <label htmlFor="timeOfDay" className="block text-sm text-gray-300 mb-1">
            Time of Day
          </label>
          <select
            id="timeOfDay"
            value={environment.timeOfDay}
            onChange={(e) => updateEnvironment({ timeOfDay: e.target.value })}
            className="w-full bg-gray-600 text-white rounded p-2"
          >
            {timeOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Temperature control */}
        <div>
          <label htmlFor="temperature" className="block text-sm text-gray-300 mb-1">
            Temperature (°C): {environment.temperature}
          </label>
          <input
            type="range"
            id="temperature"
            min={-40}
            max={50}
            value={environment.temperature}
            onChange={(e) => updateEnvironment({ temperature: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Additional environmental controls */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Terrain type */}
        <div>
          <label htmlFor="terrain" className="block text-sm text-gray-300 mb-1">
            Terrain Type
          </label>
          <select
            id="terrain"
            value={environment.terrain || 'urban'}
            onChange={(e) => updateEnvironment({ terrain: e.target.value })}
            className="w-full bg-gray-600 text-white rounded p-2"
          >
            {terrainOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Visibility distance */}
        <div>
          <label htmlFor="visibility" className="block text-sm text-gray-300 mb-1">
            Visibility (km): {environment.visibility || 10}
          </label>
          <input
            type="range"
            id="visibility"
            min={0}
            max={25}
            value={environment.visibility || 10}
            onChange={(e) => updateEnvironment({ visibility: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        
        {/* Wind speed */}
        <div>
          <label htmlFor="windSpeed" className="block text-sm text-gray-300 mb-1">
            Wind (km/h): {environment.windSpeed || 0}
          </label>
          <input
            type="range"
            id="windSpeed"
            min={0}
            max={120}
            value={environment.windSpeed || 0}
            onChange={(e) => updateEnvironment({ windSpeed: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Current environment display */}
      <div className="mt-4 bg-gray-700 p-3 rounded">
        <h3 className="text-sm font-medium mb-2">Current Environment</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gray-400">Weather:</span> {environment.weather}
          </div>
          <div>
            <span className="text-gray-400">Time:</span> {environment.timeOfDay}
          </div>
          <div>
            <span className="text-gray-400">Temperature:</span> {environment.temperature}°C
          </div>
          <div>
            <span className="text-gray-400">Terrain:</span> {environment.terrain || 'urban'}
          </div>
          <div>
            <span className="text-gray-400">Visibility:</span> {environment.visibility || 10} km
          </div>
          <div>
            <span className="text-gray-400">Wind:</span> {environment.windSpeed || 0} km/h
          </div>
        </div>
      </div>
      
      {/* Environment effect indicator */}
      <div className="mt-4 bg-gray-700 p-3 rounded">
        <h3 className="text-sm font-medium mb-2">Environmental Effects</h3>
        <div className="text-sm">
          {getEnvironmentalWarnings().map((warning, index) => (
            <div key={index} className={warning.startsWith('✓') ? 'text-green-400' : 'text-yellow-400'}>
              {warning}
            </div>
          ))}
        </div>
      </div>
      
      {/* Sensor Priority Display */}
      <div className="mt-4 bg-gray-700 p-3 rounded">
        <h3 className="text-sm font-medium mb-2">Sensor Priorities</h3>
        <div className="text-sm">
          {getSensorPriorities().map((item, index) => (
            <div key={index} className="flex justify-between items-center mb-1 border-b border-gray-600 pb-1">
              <div className="font-medium">{item.sensor}</div>
              <div className="flex items-center">
                <span className={`font-medium ${getPriorityColor(item.priority)} mr-2`}>
                  {item.priority}
                </span>
                <span className="text-xs text-gray-400">{item.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalControls;
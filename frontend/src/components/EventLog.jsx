// components/EventLog.js
import { useState } from 'react';

const EventLog = ({ events }) => {
  const [filter, setFilter] = useState('all');
  const [logHeight, setLogHeight] = useState(360); // Initial height in pixels
  
  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'system' && (event.type === 'environment_change' || event.type === 'sensor_config_change')) return true;
    if (filter === 'alerts' && event.severity === 'high') return true;
    if (filter === filter) return event.type === filter;
    return false;
  }).slice(0, 12); // Limit to 12 logs max, newest first
  
  // Get color based on event severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  // Handle height change from input
  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value, 10);
    if (!isNaN(newHeight) && newHeight >= 100 && newHeight <= 1000) { // Reasonable min/max
      setLogHeight(newHeight);
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-2 p-3 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">Event Log</h2>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded-md p-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            <option value="system">System Events</option>
            <option value="alerts">Alerts</option>
            <option value="movement">Movement</option>
            <option value="intrusion">Intrusion</option>
          </select>
          <input
            type="range"
            min="100"
            max="1000"
            step="10"
            value={logHeight}
            onChange={handleHeightChange}
            className="w-24 accent-blue-500"
            title="Adjust log height"
          />
          <span className="text-xs text-gray-400">{logHeight}px</span>
        </div>
      </div>
      
      <div 
        className="overflow-y-auto custom-scrollbar" 
        style={{ 
          height: `${logHeight}px`, // Dynamic height from state
          maxHeight: `${logHeight}px` // Prevent expansion beyond this
        }}
      >
        {filteredEvents.length === 0 ? (
          <div className="text-gray-400 text-center p-4">No events to display</div>
        ) : (
          <ul className="space-y-1 text-sm p-3">
            {filteredEvents.map((event) => (
              <li 
                key={event.id} 
                className="border-b border-gray-700 pb-2 last:border-b-0 hover:bg-gray-800 transition-colors duration-150 rounded-sm px-2"
              >
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${getSeverityColor(event.severity)}`}>
                    {event.type.replace('_', ' ')}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {event.location ? (
                    <div>Location: {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}</div>
                  ) : null}
                  {event.details && <div>{event.details}</div>}
                  {event.sensorType && <div>Detected by: {event.sensorType}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventLog;
// components/EventLog.js
import { useState } from 'react';

const EventLog = ({ events }) => {
  const [filter, setFilter] = useState('all');
  
  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'system' && (event.type === 'environment_change' || event.type === 'sensor_config_change')) return true;
    if (filter === 'alerts' && event.severity === 'high') return true;
    if (filter === filter) return event.type === filter;
    return false;
  });
  
  // Get color based on event severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Event Log</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 text-white text-sm rounded p-1"
        >
          <option value="all">All Events</option>
          <option value="system">System Events</option>
          <option value="alerts">Alerts</option>
          <option value="movement">Movement</option>
          <option value="intrusion">Intrusion</option>
        </select>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-gray-400 text-center p-4">No events to display</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {filteredEvents.map((event) => (
              <li key={event.id} className="border-b border-gray-700 pb-1">
                <div className="flex justify-between">
                  <span className={`font-medium ${getSeverityColor(event.severity)}`}>
                    {event.type.replace('_', ' ')}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-gray-300">
                  {event.location ? `Location: ${event.location.lat.toFixed(4)}, ${event.location.lng.toFixed(4)}` : ''}
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
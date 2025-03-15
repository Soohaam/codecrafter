// components/ThreatAlerts.js
import { useEffect, useState } from 'react';

const ThreatAlerts = ({ threats, securityParameters }) => {
  const [playAlert, setPlayAlert] = useState(false);
  
  // Handle playing alert sound for high-severity threats that meet security parameters
  // AND have been detected by a sensor or perimeter
  useEffect(() => {
    // Check if security parameters exist and if there are any new high-severity threats
    if (securityParameters) {
      const newHighThreat = threats.find(threat => 
        threat.severity === 'high' && 
        threat.status === 'active' && 
        !threat.assessed &&
        threat.detected && // Only alert if actually detected by a sensor
        meetSecurityParameters(threat, securityParameters)
      );
      
      if (newHighThreat) {
        setPlayAlert(true);
        
        // Stop alert after 3 seconds
        const timeout = setTimeout(() => {
          setPlayAlert(false);
        }, 3000);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [threats, securityParameters]);
  
  // Function to check if a threat meets security parameters
  const meetSecurityParameters = (threat, parameters) => {
    // Check if detected by a required sensor type (if specified)
    const sensorTypeMatch = !parameters.sensorTypes || 
      parameters.sensorTypes.includes(threat.detectedBy);
      
    // Check other parameters
    return sensorTypeMatch && 
           parameters.threatTypes.includes(threat.type) && 
           parameters.severityLevels.includes(threat.severity);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Threat Alerts</h2>
        {playAlert && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-red-500 text-sm">ALERT</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {threats.length === 0 ? (
          <div className="text-gray-400 text-center p-4">No active threats</div>
        ) : (
          <ul className="space-y-2">
            {threats
              .filter(threat => threat.detected) // Only show threats that have been detected by sensors
              .map((threat) => (
                <li 
                  key={threat.id} 
                  className={`p-2 rounded ${
                    threat.severity === 'high' ? 'bg-red-900 bg-opacity-30' : 
                    threat.severity === 'medium' ? 'bg-yellow-900 bg-opacity-30' : 
                    'bg-blue-900 bg-opacity-30'
                  } ${
                    threat.severity === 'high' && !threat.assessed && 
                    securityParameters && meetSecurityParameters(threat, securityParameters) ? 
                    'animate-pulse' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {threat.severity === 'high' ? '⚠️ ' : ''}
                        {threat.type.charAt(0).toUpperCase() + threat.type.slice(1)}
                      </div>
                      <div className="text-xs text-gray-300">
                        {new Date(threat.timestamp).toLocaleTimeString()}
                        {threat.detectedBy && (
                          <span> • Detected by: {
                            threat.detectedBy === 'laser_perimeter' ? 'Laser Perimeter' : 
                            threat.detectedBy.charAt(0).toUpperCase() + threat.detectedBy.slice(1)
                          }</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 rounded"
                        onClick={() => {
                          console.log('Investigating threat', threat.id);
                        }}
                      >
                        Investigate
                      </button>
                      <button 
                        className="bg-gray-600 hover:bg-gray-700 text-xs px-2 py-1 rounded"
                        onClick={() => {
                          console.log('Dismissing threat', threat.id);
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  {threat.location && (
                    <div className="text-xs mt-1">
                      Location: {threat.location.lat.toFixed(4)}, {threat.location.lng.toFixed(4)}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>
      
      {/* Hidden audio element for alerts */}
      {playAlert && (
        <audio 
          src="/alert-sound.mp3"
          autoPlay 
          className="hidden"
        />
      )}
    </div>
  );
};

export default ThreatAlerts;
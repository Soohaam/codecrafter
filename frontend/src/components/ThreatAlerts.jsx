// components/ThreatAlerts.js
import { useEffect, useState } from 'react';

const ThreatAlerts = ({ threats, securityParameters, onInvestigate, onDismiss }) => {
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
  
  // Function to format sensor type display
  const formatSensorType = (sensorType) => {
    if (!sensorType) return "Unknown";
    
    switch(sensorType) {
      case 'laser_perimeter': return 'Laser Perimeter';
      case 'camera': return 'Camera';
      case 'fiber': return 'Fiber Optic';
      case 'radar': return 'Radar';
      default: return sensorType.charAt(0).toUpperCase() + sensorType.slice(1);
    }
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
          <div className="text-gray-400 text-center py-4">No threats detected</div>
        ) : (
          <div className="space-y-2">
            {threats.filter(threat => threat.detected).map(threat => (
              <div 
                key={threat.id} 
                className={`border ${
                  threat.severity === 'high' ? 'border-red-500 bg-red-50' : 
                  threat.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                  'border-blue-500 bg-blue-50'
                } rounded-md p-3`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{threat.type}</span>
                  <span className={`text-sm ${
                    threat.severity === 'high' ? 'text-red-600' : 
                    threat.severity === 'medium' ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}>
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="text-sm mt-1">
                  <div>Detected by: {formatSensorType(threat.detectedBy)}</div>
                  <div>Location: {threat.location?.x.toFixed(1)}, {threat.location?.y.toFixed(1)}</div>
                  <div>Time: {new Date(threat.timestamp).toLocaleTimeString()}</div>
                </div>
                
                <div className="mt-2 flex justify-end space-x-2">
                  {!threat.assessed && (
                    <button 
                      onClick={() => onInvestigate(threat.id)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Investigate
                    </button>
                  )}
                  
                  <button 
                    onClick={() => onDismiss(threat.id)}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatAlerts;
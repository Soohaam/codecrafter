import { useState, useEffect } from 'react';

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Custom hook to generate and manage threats
const useThreatGenerator = (basePosition, perimeterRadius) => {
  const [threats, setThreats] = useState([]);
  const [lastThreatId, setLastThreatId] = useState(0);

  // Function to generate a new threat
  const generateThreat = () => {
    const newThreatId = lastThreatId + 1;
    setLastThreatId(newThreatId);

    // Random position within range of the base position
    // Generate between 1.5x and 3x the perimeter radius away
    const distance = (1.5 + Math.random() * 1.5) * perimeterRadius;
    const angle = Math.random() * 2 * Math.PI;
    
    // Calculate new position based on distance and angle
    const lat = basePosition[0] + (distance * Math.sin(angle));
    const lng = basePosition[1] + (distance * Math.cos(angle));

    // Random threat type
    const threatTypes = ['Person', 'Vehicle', 'Animal', 'Drone', 'Unknown'];
    const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];

    // Random severity with weighted distribution
    const severityRoll = Math.random();
    const severity = severityRoll < 0.7 ? 'low' : 
                     severityRoll < 0.9 ? 'medium' : 'high';

    return {
      id: newThreatId,
      type,
      severity,
      location: { lat, lng },
      timestamp: Date.now(),
      velocity: {
        lat: (basePosition[0] - lat) * (0.00001 + Math.random() * 0.00002),
        lng: (basePosition[1] - lng) * (0.00001 + Math.random() * 0.00002)
      },
      assessed: false,
      detected: false,
      insidePerimeter: false
    };
  };

  // Update threat positions every interval
  useEffect(() => {
    // Update existing threats
    const updateThreats = () => {
      setThreats(prevThreats => {
        return prevThreats.map(threat => {
          // If the threat is assessed or too old, don't update it
          if (threat.assessed || Date.now() - threat.timestamp > 120000) { // 2 minutes lifetime
            return threat;
          }

          // Update position based on velocity
          const newLat = threat.location.lat + threat.velocity.lat;
          const newLng = threat.location.lng + threat.velocity.lng;

          // Check if threat has reached very close to the base
          const distanceToBase = calculateDistance(
            newLat, newLng, 
            basePosition[0], basePosition[1]
          );

          // If threat is very close to base, mark it as assessed
          if (distanceToBase < perimeterRadius * 0.3) {
            return { ...threat, assessed: true };
          }

          return {
            ...threat,
            location: { lat: newLat, lng: newLng }
          };
        });
      });
    };

    // Regularly update threat positions (every 500ms)
    const updateInterval = setInterval(updateThreats, 500);

    // Generate new threats every 30 seconds
    const generateInterval = setInterval(() => {
      // Limit the number of active threats
      setThreats(prevThreats => {
        const activeThreats = prevThreats.filter(
          threat => !threat.assessed && Date.now() - threat.timestamp < 120000
        );

        // Only generate a new threat if we have fewer than the maximum allowed
        if (activeThreats.length < 5) {
          return [...prevThreats, generateThreat()];
        }
        return prevThreats;
      });
    }, 30000); // Changed to 30 seconds (30000ms)

    // Initial threat
    setThreats([generateThreat()]);

    // Clean up intervals
    return () => {
      clearInterval(updateInterval);
      clearInterval(generateInterval);
    };
  }, [basePosition, perimeterRadius]);

  // Clean up old threats every minute
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setThreats(prevThreats => 
        prevThreats.filter(threat => Date.now() - threat.timestamp < 120000)
      );
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return threats;
};

export default useThreatGenerator;
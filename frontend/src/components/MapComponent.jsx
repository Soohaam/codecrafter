import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon in Next.js
const DefaultIcon = () => {
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/marker-icon-2x.png',
            iconUrl: '/marker-icon.png',
            shadowUrl: '/marker-shadow.png',
        });
    }, []);
    return null;
};

// Custom icons for different sensor types
const getSensorIcon = (type, status, priority) => {
    // Adjust color based on status and priority
    let color;
    if (status === 'active') {
        color = priority === 'high' ? '#00bb00' : priority === 'medium' ? '#88cc00' : '#22dd22';
    } else if (status === 'standby') {
        color = '#ffcc00';
    } else {
        color = '#ff0000';
    }

    // Icon styles for different sensors
    let html = '';
    let iconSize = [24, 24];
    let iconAnchor = [12, 12];

    switch (type) {
        case 'camera':
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M5,8h14c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2v-4C3,8.9,3.9,8,5,8z M12,1c-4.97,0-9,4.03-9,9v1h2v-1c0-3.87,3.13-7,7-7s7,3.13,7,7v1h2v-1C21,5.03,16.97,1,12,1z M12,3c-3.87,0-7,3.13-7,7v1h1v-1c0-3.31,2.69-6,6-6s6,2.69,6,6v1h1v-1C19,6.13,15.87,3,12,3z"/>
                </svg>
              </div>`;
            break;
        case 'laser':
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border: 2px solid white; transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="transform: rotate(-45deg)">
                  <path d="M12,2L4,11h8V22h2V11h8L12,2z"/>
                </svg>
              </div>`;
            break;
        case 'fiber':
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 25%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M12,6 c-3.31,0-6,2.69-6,6s2.69,6,6,6s6-2.69,6-6S15.31,6,12,6z"/>
                </svg>
              </div>`;
            break;
        case 'radar':
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 4px; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M13,19.93c-3.95-0.49-7-3.85-7-7.93c0-0.62,0.08-1.21,0.21-1.79L9,15v1c0,1.1,0.9,2,2,2v1.93z M18.9,17.39C18.39,17.78,17.7,18,17,18c-1.66,0-3-1.34-3-3v-1h-2v1c0,1.1-0.9,2-2,2s-2-0.9-2-2v-1H4c0,4.42,3.58,8,8,8C14.04,22,15.88,21.39,17.39,20.39L18.9,17.39z M16,13v-2h-6v2H16z M14,7v1h2V7H14z M13.8,2.8C13.8,2.8,13.8,2.8,13.8,2.8c-0.6,0.06-1.39,0.15-2.4,0.22l0.63,1.9C12.67,4.86,13.24,4.8,13.8,4.8c2.27,0,4.35,0.89,5.89,2.34L21,5.83C19.11,3.94,16.56,2.8,13.8,2.8z"/>
                </svg>
              </div>`;
            break;
        default:
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`;
    }

    return new L.DivIcon({
        className: 'custom-div-icon',
        html: html,
        iconSize: iconSize,
        iconAnchor: iconAnchor
    });
};

// Event icon for showing detected events
const getEventIcon = (event) => {
    const color = event.severity === 'high' ? 'red' : event.severity === 'medium' ? 'orange' : 'blue';

    return new L.DivIcon({
        className: 'custom-event-icon',
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; opacity: 0.8; animation: pulse 1.5s infinite;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

// Headquarters building icon
const getHeadquartersIcon = () => {
    return new L.DivIcon({
        className: 'headquarters-icon',
        html: `<div style="background-color: #444; width: 32px; height: 32px; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12,3L2,12h3v8h6v-6h2v6h6v-8h3L12,3z M12,8c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,8,12,8z"/>
            </svg>
          </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

// Component to update map view based on threats
const MapEvents = ({ threats, viewMode }) => {
    const map = useMap();

    useEffect(() => {
        // If there's a high-severity threat, center the map on it
        const highThreat = threats.find(t => t.severity === 'high' && !t.assessed);
        if (highThreat && highThreat.location) {
            map.flyTo([highThreat.location.lat, highThreat.location.lng], 17, {
                animate: true,
                duration: 1.5
            });
        }
    }, [threats, map]);

    return null;
};

// Component to draw sensor field of view
const SensorFieldOfView = ({ sensor, position, type, environment, headingAngle, priority }) => {
    if (type !== 'camera') return null;

    const fovAngle = 90; // Degrees - would come from sensor config

    // Calculate the field of view polygon points
    const getFieldOfViewPolygon = () => {
        const centerLat = position[0];
        const centerLng = position[1];
        const radius = sensor.range / 1000; // Convert meters to kilometers

        // Starting point
        const points = [[centerLat, centerLng]];

        // Calculate points for the field of view arc
        const startAngle = headingAngle - (fovAngle / 2);
        const endAngle = headingAngle + (fovAngle / 2);

        // Add points around the arc
        for (let angle = startAngle; angle <= endAngle; angle += 5) {
            const radians = (angle * Math.PI) / 180;
            const lat = centerLat + (radius * Math.sin(radians) * 0.009);
            const lng = centerLng + (radius * Math.cos(radians) * 0.009);
            points.push([lat, lng]);
        }

        // Close the polygon
        points.push([centerLat, centerLng]);

        return points;
    };

    // Modify opacity based on environmental factors and priority
    const getOpacity = () => {
        let opacity = 0.2;

        if (environment.weather === 'fog') {
            opacity *= 0.5;
        }
        if (environment.timeOfDay === 'night') {
            opacity *= 0.7;
        }

        // Increase opacity for high priority sensors
        if (priority === 'high') {
            opacity *= 1.5;
        } else if (priority === 'low') {
            opacity *= 0.5;
        }

        return Math.min(opacity, 0.4); // Cap at 0.4 to avoid visual clutter
    };

    return (
        <Polygon
            positions={getFieldOfViewPolygon()}
            pathOptions={{
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: getOpacity(),
                weight: 1
            }}
        />
    );
};

// Component to create a laser perimeter line
const LaserPerimeter = ({ basePosition, radius, environment, priority }) => {
    // Create a polygon for the square perimeter
    const getSquarePerimeter = () => {
        return [
            [basePosition[0] + radius, basePosition[1] + radius],
            [basePosition[0] + radius, basePosition[1] - radius],
            [basePosition[0] - radius, basePosition[1] - radius],
            [basePosition[0] - radius, basePosition[1] + radius],
            [basePosition[0] + radius, basePosition[1] + radius], // Close the loop
        ];
    };

    // Calculate effectiveness based on environment and priority
    const getLineStyle = () => {
        let dashArray = null;
        let opacity = 0.8;
        let color = '#FF0000';
        let weight = 2;

        if (environment.weather === 'rain') {
            opacity *= 0.7;
            dashArray = '3, 4';
        }
        if (environment.weather === 'fog') {
            opacity *= 0.6;
            dashArray = '2, 3';
        }
        if (environment.timeOfDay === 'night') {
            color = '#AA0000';
        }

        // Adjust based on priority
        if (priority === 'high') {
            weight = 3;
            opacity = Math.min(opacity * 1.2, 1.0);
        } else if (priority === 'low') {
            weight = 1;
            opacity *= 0.7;
            dashArray = dashArray || '1, 2';
        }

        return {
            color: color,
            weight: weight,
            opacity: opacity,
            dashArray: dashArray
        };
    };

    return (
        <Polyline
            positions={getSquarePerimeter()}
            pathOptions={getLineStyle()}
        />
    );
};

// Component to create a fiber optic perimeter
const FiberPerimeter = ({ basePosition, radius, environment, priority }) => {
    // Create a circle for the fiber optics
    const getCircleOptions = () => {
        let opacity = 0.6;
        let color = '#00AAFF';
        let fillOpacity = 0.1;
        let weight = 2;

        // Environmental effects
        if (environment.weather === 'rain') {
            // Fiber optics work well in rain
            opacity *= 1.1;
        }
        if (environment.weather === 'fog') {
            // Fiber optics work well in fog
            opacity *= 1.1;
        }

        // Adjust based on priority
        if (priority === 'high') {
            weight = 3;
            opacity = Math.min(opacity * 1.2, 0.9);
            fillOpacity *= 1.5;
        } else if (priority === 'low') {
            weight = 1;
            opacity *= 0.7;
            fillOpacity *= 0.5;
        }

        return {
            color: color,
            fillColor: color,
            fillOpacity: fillOpacity,
            weight: weight,
            opacity: opacity
        };
    };

    return (
        <Circle
            center={basePosition}
            radius={radius * 1000} // Convert to meters
            pathOptions={getCircleOptions()}
        />
    );
};

// Component to visualize radar coverage
// Continuing from RadarCoverage component
const RadarCoverage = ({ position, range, environment, priority }) => {
    // Calculate effective range based on environment and priority
    const getEffectiveRange = () => {
        let effectiveRange = range;
        if (environment.weather === 'rain') {
            effectiveRange *= 0.9; // Slight decrease in rain
        }
        if (environment.weather === 'fog') {
            effectiveRange *= 0.8; // Decreased in fog
        }

        // Adjust based on priority
        if (priority === 'high') {
            effectiveRange *= 1.2;
        } else if (priority === 'low') {
            effectiveRange *= 0.8;
        }

        return effectiveRange;
    };

    // Get circle options for radar visualization
    const getCircleOptions = () => {
        let opacity = 0.3;
        let color = '#FF9900';
        let fillOpacity = 0.15;
        let weight = 1;

        // Radar works well in most conditions
        if (environment.timeOfDay === 'night') {
            opacity *= 1.2; // Better visibility at night
        }

        // Adjust based on priority
        if (priority === 'high') {
            weight = 2;
            opacity = Math.min(opacity * 1.3, 0.6);
            fillOpacity = Math.min(fillOpacity * 1.3, 0.3);
        } else if (priority === 'low') {
            opacity *= 0.7;
            fillOpacity *= 0.7;
        }

        return {
            color: color,
            fillColor: color,
            fillOpacity: fillOpacity,
            weight: weight,
            opacity: opacity,
            dashArray: '3, 5'
        };
    };

    return (
        <Circle
            center={position}
            radius={getEffectiveRange()}
            pathOptions={getCircleOptions()}
        />
    );
};

// Alert component to handle breach notifications
const AlertComponent = ({ threats, laserPerimeter }) => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Check if any threat has crossed the laser perimeter
        const newAlerts = threats
            .filter(threat => !threat.assessed)
            .filter(threat => {
                if (!threat.location) return false;

                // Calculate if the threat is outside the perimeter
                const isOutsidePerimeter =
                    threat.location.lat > laserPerimeter.position[0] + laserPerimeter.radius ||
                    threat.location.lat < laserPerimeter.position[0] - laserPerimeter.radius ||
                    threat.location.lng > laserPerimeter.position[1] + laserPerimeter.radius ||
                    threat.location.lng < laserPerimeter.position[1] - laserPerimeter.radius;

                // Initially outside and now crossing in
                return !isOutsidePerimeter && !threat.insidePerimeter;
            })
            .map(threat => ({
                id: threat.id,
                message: `ALERT: Perimeter breach detected at ${new Date().toLocaleTimeString()}`,
                severity: threat.severity,
                timestamp: Date.now()
            }));

        // Add new alerts to the list
        if (newAlerts.length > 0) {
            setAlerts(prevAlerts => [...newAlerts, ...prevAlerts].slice(0, 10));
        }
    }, [threats, laserPerimeter]);

    // No UI rendering here, just handling the alerts
    return null;
};

// Main map component
const MapComponent = ({ environment, sensors, events, threats, viewMode, onDetectThreat }) => {
    // Base coordinates
    const basePosition = [34.0522, -118.2437];

    // State for alerts
    const [alerts, setAlerts] = useState([]);
    // State for sensor priority
    const [sensorPriorities, setSensorPriorities] = useState({});
    // State for tracking threats inside the perimeter
    const [trackedThreats, setTrackedThreats] = useState([]);

    // Define perimeter radii
    const laserPerimeterRadius = 0.003; // Outer perimeter
    const fiberPerimeterRadius = 0.002; // Middle perimeter
    const innerRadius = 0.001; // Inner zone for cameras and radar

    // Update sensor priorities based on environmental conditions
    useEffect(() => {
        // Determine which sensors are most effective in current conditions
        const priorities = {};

        if (environment.weather === 'fog') {
            // In fog, radar and fiber are more reliable than cameras or lasers
            priorities.radar = 'high';
            priorities.fiber = 'high';
            priorities.laser = 'medium';
            priorities.camera = 'low';
        } else if (environment.weather === 'rain') {
            // In rain, radar and fiber are more reliable, lasers less effective
            priorities.radar = 'high';
            priorities.fiber = 'high';
            priorities.camera = 'medium';
            priorities.laser = 'low';
        } else if (environment.timeOfDay === 'night') {
            // At night, thermal cameras, radar, and fiber are better
            priorities.radar = 'high';
            priorities.fiber = 'high';
            priorities.laser = 'medium';
            priorities.camera = 'low';
        } else {
            // Clear day - all sensors work well, with cameras being most informative
            priorities.camera = 'high';
            priorities.laser = 'high';
            priorities.radar = 'medium';
            priorities.fiber = 'medium';
        }

        setSensorPriorities(priorities);
    }, [environment]);

    // Track threats and generate alerts when they cross the laser perimeter
    useEffect(() => {
        // Update tracked threats
        setTrackedThreats(prevTrackedThreats => {
            // Update existing threats
            const updatedThreats = threats.map(threat => {
                // Find if we were already tracking this threat
                const existingThreat = prevTrackedThreats.find(t => t.id === threat.id);

                // Check if the threat is inside the perimeter
                const isInsidePerimeter = threat.location && (
                    Math.abs(threat.location.lat - basePosition[0]) <= laserPerimeterRadius &&
                    Math.abs(threat.location.lng - basePosition[1]) <= laserPerimeterRadius
                );

                // If newly inside perimeter, generate alert
                if (isInsidePerimeter && existingThreat && !existingThreat.insidePerimeter) {
                    const alertMessage = {
                        id: `alert-${threat.id}-${Date.now()}`,
                        message: `PERIMETER BREACH: ${threat.type || 'Unknown'} entity detected crossing laser perimeter`,
                        severity: threat.severity,
                        timestamp: Date.now(),
                        location: threat.location
                    };

                    // Only generate alerts for perimeter crossings
                    setAlerts(prev => [alertMessage, ...prev].slice(0, 10));

                    // Call the onDetectThreat callback if provided
                    if (onDetectThreat) {
                        onDetectThreat(threat, 'laser_perimeter');
                    }
                }

                // Return updated threat with inside perimeter status
                return {
                    ...threat,
                    insidePerimeter: isInsidePerimeter
                };
            });

            return updatedThreats;
        });
    }, [threats, basePosition, laserPerimeterRadius, onDetectThreat]);

    // Create sensor positions around the headquarters
    const generateSensorPositions = () => {
        // Position cameras at the corners of the building (innermost layer)
        const cameraPositions = [
            {
                position: [basePosition[0] + 0.0005, basePosition[1] + 0.0005],
                heading: 45
            },
            {
                position: [basePosition[0] + 0.0005, basePosition[1] - 0.0005],
                heading: 135
            },
            {
                position: [basePosition[0] - 0.0005, basePosition[1] - 0.0005],
                heading: 225
            },
            {
                position: [basePosition[0] - 0.0005, basePosition[1] + 0.0005],
                heading: 315
            }
        ];

        // Position radar at the mid-points of inner zone
        const radarPositions = [
            { position: [basePosition[0] + 0.0008, basePosition[1]], heading: 90 },
            { position: [basePosition[0], basePosition[1] + 0.0008], heading: 0 },
            { position: [basePosition[0] - 0.0008, basePosition[1]], heading: 270 },
            { position: [basePosition[0], basePosition[1] - 0.0008], heading: 180 }
        ];

        // Position lasers at corners of the outer perimeter
        const laserPositions = [
            { position: [basePosition[0] + laserPerimeterRadius, basePosition[1] + laserPerimeterRadius], heading: 45 },
            { position: [basePosition[0] + laserPerimeterRadius, basePosition[1] - laserPerimeterRadius], heading: 135 },
            { position: [basePosition[0] - laserPerimeterRadius, basePosition[1] - laserPerimeterRadius], heading: 225 },
            { position: [basePosition[0] - laserPerimeterRadius, basePosition[1] + laserPerimeterRadius], heading: 315 }
        ];

        return {
            camera: cameraPositions,
            radar: radarPositions,
            laser: laserPositions
        };
    };

    const sensorPositions = generateSensorPositions();

    return (
        <div className="security-map-container">
            <MapContainer
                center={basePosition}
                zoom={17}
                style={{ height: '600px', width: '100%' }}
            >
                <DefaultIcon />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Headquarters marker */}
                <Marker position={basePosition} icon={getHeadquartersIcon()}>
                    <Popup>Security Headquarters</Popup>
                </Marker>

                {/* Outer layer - Laser perimeter */}
                <LaserPerimeter
                    basePosition={basePosition}
                    radius={laserPerimeterRadius}
                    environment={environment}
                    priority={sensorPriorities.laser || 'medium'}
                />

                {/* Middle layer - Fiber optic perimeter */}
                <FiberPerimeter
                    basePosition={basePosition}
                    radius={fiberPerimeterRadius}
                    environment={environment}
                    priority={sensorPriorities.fiber || 'medium'}
                />

                {/* Inner layer - Radar coverage */}
                {sensorPositions.radar.map((radar, idx) => (
                    <RadarCoverage
                        key={`radar-${idx}`}
                        position={radar.position}
                        range={100}
                        environment={environment}
                        priority={sensorPriorities.radar || 'medium'}
                    />
                ))}

              {/* Camera sensors and their fields of view */}
{sensorPositions.camera.map((camera, idx) => (
    <React.Fragment key={`camera-group-${idx}`}>
        <Marker
            position={camera.position}
            icon={getSensorIcon('camera', 'active', sensorPriorities.camera || 'medium')}
        >
            <Popup>
                <div>
                    <strong>Camera {idx + 1}</strong>
                    <div>Type: Camera</div>
                    <div>Status: Active</div>
                    <div>Priority: {sensorPriorities.camera || 'medium'}</div>
                    <div>Range: 100m</div>
                    <div>FOV: 90°</div>
                    <div>Heading: {camera.heading}°</div>
                    <div>Effectiveness: {
                        environment.timeOfDay === 'night' ? 'Low' :
                        environment.weather === 'fog' ? 'Low' :
                        environment.weather === 'rain' ? 'Medium' : 'High'
                    }</div>
                </div>
            </Popup>
        </Marker>
        <SensorFieldOfView
            sensor={{ range: 100 }}
            position={camera.position}
            type="camera"
            environment={environment}
            headingAngle={camera.heading}
            priority={sensorPriorities.camera || 'medium'}
        />
    </React.Fragment>
))}

{/* Laser sensors */}
{sensorPositions.laser.map((laser, idx) => (
    <Marker
        key={`laser-${idx}`}
        position={laser.position}
        icon={getSensorIcon('laser', 'active', sensorPriorities.laser || 'medium')}
    >
        <Popup>
            <div>
                <strong>Laser {idx + 1}</strong>
                <div>Type: Laser</div>
                <div>Status: Active</div>
                <div>Priority: {sensorPriorities.laser || 'medium'}</div>
                <div>Range: Perimeter</div>
                <div>Heading: {laser.heading}°</div>
                <div>Effectiveness: {
                    environment.weather === 'rain' ? 'Low' :
                    environment.weather === 'fog' ? 'Medium' :
                    environment.timeOfDay === 'night' ? 'Medium' : 'High'
                }</div>
            </div>
        </Popup>
    </Marker>
))}

{/* Fiber optic sensors - placed around the middle perimeter */}
{[0, 90, 180, 270].map((angle, idx) => {
    const radians = (angle * Math.PI) / 180;
    const position = [
        basePosition[0] + (fiberPerimeterRadius * Math.cos(radians)),
        basePosition[1] + (fiberPerimeterRadius * Math.sin(radians))
    ];

    return (
        <Marker
            key={`fiber-${idx}`}
            position={position}
            icon={getSensorIcon('fiber', 'active', sensorPriorities.fiber || 'medium')}
        >
            <Popup>
                <div>
                    <strong>Fiber Optic {idx + 1}</strong>
                    <div>Type: Fiber Optic</div>
                    <div>Status: Active</div>
                    <div>Priority: {sensorPriorities.fiber || 'medium'}</div>
                    <div>Range: {(fiberPerimeterRadius * 111.32 * 1000).toFixed(0)}m</div>
                    <div>Heading: {angle}°</div>
                    <div>Effectiveness: {
                        environment.weather === 'rain' ? 'High' :
                        environment.weather === 'fog' ? 'High' :
                        'High'
                    }</div>
                </div>
            </Popup>
        </Marker>
    );
})}

{/* Add radar sensors */}
{sensorPositions.radar.map((radar, idx) => (
    <Marker
        key={`radar-marker-${idx}`}
        position={radar.position}
        icon={getSensorIcon('radar', 'active', sensorPriorities.radar || 'medium')}
    >
        <Popup>
            <div>
                <strong>Radar {idx + 1}</strong>
                <div>Type: Radar</div>
                <div>Status: Active</div>
                <div>Priority: {sensorPriorities.radar || 'medium'}</div>
                <div>Range: 100m</div>
                <div>Heading: {radar.heading}°</div>
                <div>Effectiveness: {
                    environment.weather === 'rain' ? 'High' :
                    environment.weather === 'fog' ? 'High' :
                    environment.timeOfDay === 'night' ? 'High' : 'Medium'
                }</div>
            </div>
        </Popup>
    </Marker>
))}

                {/* Display threat markers */}
                {threats
                    .filter(threat => threat.location)
                    .map((threat) => (
                        <Marker
                            key={`threat-${threat.id}`}
                            position={[threat.location.lat, threat.location.lng]}
                            icon={getEventIcon({ severity: threat.severity })}
                        >
                            <Popup>
                                {threat.type || 'Unknown'} threat<br />
                                Severity: {threat.severity}
                            </Popup>
                        </Marker>
                    ))
                }

                {/* MapEvents component to handle view updates */}
                <MapEvents threats={threats} viewMode={viewMode} />
            </MapContainer>

            {/* Alert display */}
            <div className="alerts-container" style={{ marginTop: '20px' }}>
                <h3>Security Alerts</h3>
                {alerts.length === 0 ? (
                    <p>No active alerts. Perimeter secure.</p>
                ) : (
                    <ul className="alerts-list">
                        {alerts.map(alert => (
                            <li
                                key={alert.id}
                                className={`alert-item alert-${alert.severity}`}
                                style={{
                                    padding: '10px',
                                    marginBottom: '5px',
                                    backgroundColor: alert.severity === 'high' ? '#ffdddd' :
                                        alert.severity === 'medium' ? '#ffffcc' : '#e6f7ff',
                                    borderLeft: `4px solid ${alert.severity === 'high' ? 'red' :
                                        alert.severity === 'medium' ? 'orange' : 'blue'}`, borderRadius: '3px',
                                }}
                            >
                                <strong>{alert.message}</strong>
                                <div className="alert-meta">
                                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                    <span className="alert-severity">Severity: {alert.severity}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Environment and Sensor Priority Summary */}
            <div className="status-panel" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <div className="environment-status">
                    <h4>Environmental Conditions</h4>
                    <div>Weather: {environment.weather || 'Clear'}</div>
                    <div>Time: {environment.timeOfDay || 'Day'}</div>
                </div>

                <div className="sensor-priorities">
                    <h4>Sensor Priority Status</h4>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {Object.entries(sensorPriorities).map(([sensor, priority]) => (
                            <div
                                key={`priority-${sensor}`}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor:
                                        priority === 'high' ? '#d4edda' :
                                            priority === 'medium' ? '#fff3cd' : '#f8d7da',
                                    borderRadius: '3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <span style={{
                                    display: 'inline-block',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor:
                                        priority === 'high' ? 'green' :
                                            priority === 'medium' ? 'orange' : 'red'
                                }}></span>
                                {sensor}: {priority}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from "next/link";

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
const getSensorIcon = (type, status, priority, settings = {}) => {
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
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; transform: rotate(${settings.rotation || 0}deg);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${settings.thermal ? '#ff4444' : 'white'}">
                  <path d="M5,8h14c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2v-4C3,8.9,3.9,8,5,8z M12,1c-4.97,0-9,4.03-9,9v1h2v-1c0-3.87,3.13-7,7-7s7,3.13,7,7v1h2v-1C21,5.03,16.97,1,12,1z M12,3c-3.87,0-7,3.13-7,7v1h1v-1c0-3.31,2.69-6,6-6s6,2.69,6,6v1h1v-1C19,6.13,15.87,3,12,3z"/>
                </svg>
              </div>`;
            break;
        case 'laser':
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border: 2px solid white; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; opacity: ${settings.intensity || 1};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="transform: rotate(-45deg)">
                  <path d="M12,2L4,11h8V22h2V11h8L12,2z"/>
                </svg>
              </div>`;
            break;
        case 'fiber':
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 25%; border: 2px solid white; display: flex; align-items: center; justify-content: center; transform: scale(${1 + (settings.sensitivity || 0) / 2});">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M12,6 c-3.31,0-6,2.69-6,6s2.69,6,6,6s6-2.69,6-6S15.31,6,12,6z"/>
                </svg>
              </div>`;
            break;
        case 'radar':
            html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 4px; border: 2px solid white; display: flex; align-items: center; justify-content: center; transform: rotate(${settings.rotation || 0}deg);">
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

// Modified SensorFieldOfView to handle camera rotation and thermal mode
const SensorFieldOfView = ({ sensor, position, type, environment, headingAngle, priority, settings }) => {
    if (type !== 'camera') return null;

    const fovAngle = settings.fov || 90; // Allow dynamic FOV

    const getFieldOfViewPolygon = () => {
        const centerLat = position[0];
        const centerLng = position[1];
        const radius = sensor.range / 1000;

        const points = [[centerLat, centerLng]];
        const startAngle = (headingAngle + (settings.rotation || 0)) - (fovAngle / 2);
        const endAngle = (headingAngle + (settings.rotation || 0)) + (fovAngle / 2);

        for (let angle = startAngle; angle <= endAngle; angle += 5) {
            const radians = (angle * Math.PI) / 180;
            const lat = centerLat + (radius * Math.sin(radians) * 0.009);
            const lng = centerLng + (radius * Math.cos(radians) * 0.009);
            points.push([lat, lng]);
        }
        points.push([centerLat, centerLng]);

        return points;
    };

    const getOpacity = () => {
        let opacity = 0.2;
        if (environment.weather === 'fog') opacity *= 0.5;
        if (environment.timeOfDay === 'night') opacity *= 0.7;
        if (priority === 'high') opacity *= 1.5;
        else if (priority === 'low') opacity *= 0.5;
        if (settings.thermal) opacity *= 1.2; // Higher opacity in thermal mode
        return Math.min(opacity, 0.4);
    };

    return (
        <Polygon
            positions={getFieldOfViewPolygon()}
            pathOptions={{
                color: settings.thermal ? '#ff4444' : 'blue',
                fillColor: settings.thermal ? '#ff4444' : 'blue',
                fillOpacity: getOpacity(),
                weight: 1
            }}
        />
    );
};

// Modified LaserPerimeter to handle intensity
const LaserPerimeter = ({ basePosition, radius, environment, priority, settings }) => {
    const getSquarePerimeter = () => {
        return [
            [basePosition[0] + radius, basePosition[1] + radius],
            [basePosition[0] + radius, basePosition[1] - radius],
            [basePosition[0] - radius, basePosition[1] - radius],
            [basePosition[0] - radius, basePosition[1] + radius],
            [basePosition[0] + radius, basePosition[1] + radius],
        ];
    };

    const getLineStyle = () => {
        let dashArray = null;
        let opacity = 0.8 * (settings.intensity || 1);
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

        if (priority === 'high') {
            weight = 3;
            opacity = Math.min(opacity * 1.2, 1.0);
        } else if (priority === 'low') {
            weight = 1;
            opacity *= 0.7;
            dashArray = dashArray || '1, 2';
        }

        return { color, weight, opacity, dashArray };
    };

    return (
        <Polyline
            positions={getSquarePerimeter()}
            pathOptions={getLineStyle()}
        />
    );
};

// Modified FiberPerimeter to handle sensitivity
const FiberPerimeter = ({ basePosition, radius, environment, priority, settings }) => {
    const getCircleOptions = () => {
        let opacity = 0.6;
        let color = '#00AAFF';
        let fillOpacity = 0.1;
        let weight = 2;

        if (environment.weather === 'rain') opacity *= 1.1;
        if (environment.weather === 'fog') opacity *= 1.1;

        if (priority === 'high') {
            weight = 3;
            opacity = Math.min(opacity * 1.2, 0.9);
            fillOpacity *= 1.5;
        } else if (priority === 'low') {
            weight = 1;
            opacity *= 0.7;
            fillOpacity *= 0.5;
        }

        // Adjust based on sensitivity
        const sensitivity = settings.sensitivity || 0;
        opacity = Math.min(opacity * (1 + sensitivity/2), 1);
        fillOpacity = Math.min(fillOpacity * (1 + sensitivity/2), 0.5);

        return { color, fillColor: color, fillOpacity, weight, opacity };
    };

    return (
        <Circle
            center={basePosition}
            radius={radius * 1000}
            pathOptions={getCircleOptions()}
        />
    );
};

// Modified RadarCoverage to handle rotation and range
const RadarCoverage = ({ position, range, environment, priority, settings }) => {
    const getEffectiveRange = () => {
        let effectiveRange = range * (1 + (settings.range || 0)/2);
        if (environment.weather === 'rain') effectiveRange *= 0.9;
        if (environment.weather === 'fog') effectiveRange *= 0.8;
        if (priority === 'high') effectiveRange *= 1.2;
        else if (priority === 'low') effectiveRange *= 0.8;
        return effectiveRange;
    };

    const getCircleOptions = () => {
        let opacity = 0.3;
        let color = '#FF9900';
        let fillOpacity = 0.15;
        let weight = 1;

        if (environment.timeOfDay === 'night') {
            opacity *= 1.2;
        }

        if (priority === 'high') {
            weight = 2;
            opacity = Math.min(opacity * 1.3, 0.6);
            fillOpacity = Math.min(fillOpacity * 1.3, 0.3);
        } else if (priority === 'low') {
            opacity *= 0.7;
            fillOpacity *= 0.7;
        }

        return { color, fillColor: color, fillOpacity, weight, opacity, dashArray: '3, 5' };
    };

    return (
        <Circle
            center={position}
            radius={getEffectiveRange()}
            pathOptions={getCircleOptions()}
        />
    );
};

// Alert component remains unchanged
const AlertComponent = ({ threats, laserPerimeter }) => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const newAlerts = threats
            .filter(threat => !threat.assessed)
            .filter(threat => {
                if (!threat.location) return false;
                const isOutsidePerimeter =
                    threat.location.lat > laserPerimeter.position[0] + laserPerimeter.radius ||
                    threat.location.lat < laserPerimeter.position[0] - laserPerimeter.radius ||
                    threat.location.lng > laserPerimeter.position[1] + laserPerimeter.radius ||
                    threat.location.lng < laserPerimeter.position[1] - laserPerimeter.radius;
                return !isOutsidePerimeter && !threat.insidePerimeter;
            })
            .map(threat => ({
                id: threat.id,
                message: `ALERT: Perimeter breach detected at ${new Date().toLocaleTimeString()}`,
                severity: threat.severity,
                timestamp: Date.now()
            }));

        if (newAlerts.length > 0) {
            setAlerts(prevAlerts => [...newAlerts, ...prevAlerts].slice(0, 10));
        }
    }, [threats, laserPerimeter]);

    return null;
};

// Modified main map component with device controls
const MapComponent = ({ environment, sensors, events, threats, viewMode, onDetectThreat }) => {
    const basePosition = [34.0522, -118.2437];
    const [alerts, setAlerts] = useState([]);
    const [sensorPriorities, setSensorPriorities] = useState({});
    const [trackedThreats, setTrackedThreats] = useState([]);

    // Add state for device settings
    const [deviceSettings, setDeviceSettings] = useState({
        cameras: Array(4).fill({ rotation: 0, thermal: false, fov: 90 }),
        lasers: Array(4).fill({ intensity: 1 }),
        fiber: { sensitivity: 0 },
        radars: Array(4).fill({ rotation: 0, range: 0 })
    });

    const laserPerimeterRadius = 0.003;
    const fiberPerimeterRadius = 0.002;
    const innerRadius = 0.001;

    useEffect(() => {
        const priorities = {};
        if (environment.weather === 'fog') {
            priorities.radar = 'high';
            priorities.fiber = 'high';
            priorities.laser = 'medium';
            priorities.camera = 'low';
        } else if (environment.weather === 'rain') {
            priorities.radar = 'high';
            priorities.fiber = 'high';
            priorities.camera = 'medium';
            priorities.laser = 'low';
        } else if (environment.timeOfDay === 'night') {
            priorities.radar = 'high';
            priorities.fiber = 'high';
            priorities.laser = 'medium';
            priorities.camera = 'low';
        } else {
            priorities.camera = 'high';
            priorities.laser = 'high';
            priorities.radar = 'medium';
            priorities.fiber = 'medium';
        }
        setSensorPriorities(priorities);
    }, [environment]);

    useEffect(() => {
        const updatedThreats = threats.map(threat => {
            const existingThreat = trackedThreats.find(t => t.id === threat.id);
            const isInsidePerimeter = threat.location && (
                Math.abs(threat.location.lat - basePosition[0]) <= laserPerimeterRadius &&
                Math.abs(threat.location.lng - basePosition[1]) <= laserPerimeterRadius
            );

            if (isInsidePerimeter && existingThreat && !existingThreat.insidePerimeter) {
                const alertMessage = {
                    id: `alert-${threat.id}-${Date.now()}`,
                    message: `PERIMETER BREACH: ${threat.type || 'Unknown'} entity detected crossing laser perimeter`,
                    severity: threat.severity,
                    timestamp: Date.now(),
                    location: threat.location
                };
                setAlerts(prev => [alertMessage, ...prev].slice(0, 10));
                if (onDetectThreat) {
                    onDetectThreat(threat, 'laser_perimeter');
                }
            }

            return {
                ...threat,
                insidePerimeter: isInsidePerimeter
            };
        });

        if (JSON.stringify(updatedThreats) !== JSON.stringify(trackedThreats)) {
            setTrackedThreats(updatedThreats);
        }
    }, [threats, basePosition, laserPerimeterRadius, onDetectThreat, trackedThreats]);

    const generateSensorPositions = () => {
        const cameraPositions = [
            { position: [basePosition[0] + 0.0005, basePosition[1] + 0.0005], heading: 45 },
            { position: [basePosition[0] + 0.0005, basePosition[1] - 0.0005], heading: 135 },
            { position: [basePosition[0] - 0.0005, basePosition[1] - 0.0005], heading: 225 },
            { position: [basePosition[0] - 0.0005, basePosition[1] + 0.0005], heading: 315 }
        ];

        const radarPositions = [
            { position: [basePosition[0] + 0.0008, basePosition[1]], heading: 90 },
            { position: [basePosition[0], basePosition[1] + 0.0008], heading: 0 },
            { position: [basePosition[0] - 0.0008, basePosition[1]], heading: 270 },
            { position: [basePosition[0], basePosition[1] - 0.0008], heading: 180 }
        ];

        const laserPositions = [
            { position: [basePosition[0] + laserPerimeterRadius, basePosition[1] + laserPerimeterRadius], heading: 45 },
            { position: [basePosition[0] + laserPerimeterRadius, basePosition[1] - laserPerimeterRadius], heading: 135 },
            { position: [basePosition[0] - laserPerimeterRadius, basePosition[1] - laserPerimeterRadius], heading: 225 },
            { position: [basePosition[0] - laserPerimeterRadius, basePosition[1] + laserPerimeterRadius], heading: 315 }
        ];

        return { camera: cameraPositions, radar: radarPositions, laser: laserPositions };
    };

    const sensorPositions = generateSensorPositions();

    // Device control handlers
    const handleCameraRotation = (index, value) => {
        setDeviceSettings(prev => ({
            ...prev,
            cameras: prev.cameras.map((cam, i) => 
                i === index ? { ...cam, rotation: value } : cam
            )
        }));
    };

    const handleCameraThermal = (index) => {
        setDeviceSettings(prev => ({
            ...prev,
            cameras: prev.cameras.map((cam, i) => 
                i === index ? { ...cam, thermal: !cam.thermal } : cam
            )
        }));
    };

    const handleCameraFOV = (index, value) => {
        setDeviceSettings(prev => ({
            ...prev,
            cameras: prev.cameras.map((cam, i) => 
                i === index ? { ...cam, fov: value } : cam
            )
        }));
    };

    const handleLaserIntensity = (index, value) => {
        setDeviceSettings(prev => ({
            ...prev,
            lasers: prev.lasers.map((laser, i) => 
                i === index ? { intensity: value } : laser
            )
        }));
    };

    const handleFiberSensitivity = (value) => {
        setDeviceSettings(prev => ({
            ...prev,
            fiber: { ...prev.fiber, sensitivity: value }
        }));
    };

    const handleRadarRotation = (index, value) => {
        setDeviceSettings(prev => ({
            ...prev,
            radars: prev.radars.map((radar, i) => 
                i === index ? { ...radar, rotation: value } : radar
            )
        }));
    };

    const handleRadarRange = (index, value) => {
        setDeviceSettings(prev => ({
            ...prev,
            radars: prev.radars.map((radar, i) => 
                i === index ? { ...radar, range: value } : radar
            )
        }));
    };

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
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <Marker position={basePosition} icon={getHeadquartersIcon()}>
                    <Popup>Security Headquarters</Popup>
                </Marker>

                <LaserPerimeter
                    basePosition={basePosition}
                    radius={laserPerimeterRadius}
                    environment={environment}
                    priority={sensorPriorities.laser || 'medium'}
                    settings={{ intensity: deviceSettings.lasers.reduce((sum, l) => sum + l.intensity, 0) / deviceSettings.lasers.length }}
                />

                <FiberPerimeter
                    basePosition={basePosition}
                    radius={fiberPerimeterRadius}
                    environment={environment}
                    priority={sensorPriorities.fiber || 'medium'}
                    settings={deviceSettings.fiber}
                />

                {sensorPositions.radar.map((radar, idx) => (
                    <RadarCoverage
                        key={`radar-${idx}`}
                        position={radar.position}
                        range={100}
                        environment={environment}
                        priority={sensorPriorities.radar || 'medium'}
                        settings={deviceSettings.radars[idx]}
                    />
                ))}

                {sensorPositions.camera.map((camera, idx) => (
                    <React.Fragment key={`camera-group-${idx}`}>
                        <Marker
                            position={camera.position}
                            icon={getSensorIcon('camera', 'active', sensorPriorities.camera || 'medium', deviceSettings.cameras[idx])}
                        >
                            <Popup>
                                <div>
                                    <strong>Camera {idx + 1}</strong>
                                    <div>Type: Camera</div>
                                    <div>Status: Active</div>
                                    <div>Priority: {sensorPriorities.camera || 'medium'}</div>
                                    <div>Range: 100m</div>
                                    <div>FOV: {deviceSettings.cameras[idx].fov}°</div>
                                    <div>Heading: {(camera.heading + (deviceSettings.cameras[idx].rotation || 0)) % 360}°</div>
                                    <div>Mode: {deviceSettings.cameras[idx].thermal ? 'Thermal' : 'Normal'}</div>
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
                            settings={deviceSettings.cameras[idx]}
                        />
                    </React.Fragment>
                ))}

                {sensorPositions.laser.map((laser, idx) => (
                    <Marker
                        key={`laser-${idx}`}
                        position={laser.position}
                        icon={getSensorIcon('laser', 'active', sensorPriorities.laser || 'medium', deviceSettings.lasers[idx])}
                    >
                        <Popup>
                            <div>
                                <strong>Laser {idx + 1}</strong>
                                <div>Type: Laser</div>
                                <div>Status: Active</div>
                                <div>Priority: {sensorPriorities.laser || 'medium'}</div>
                                <div>Range: Perimeter</div>
                                <div>Heading: {laser.heading}°</div>
                                <div>Intensity: {(deviceSettings.lasers[idx].intensity * 100).toFixed(0)}%</div>
                                <div>Effectiveness: {
                                    environment.weather === 'rain' ? 'Low' :
                                        environment.weather === 'fog' ? 'Medium' :
                                            environment.timeOfDay === 'night' ? 'Medium' : 'High'
                                }</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

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
                            icon={getSensorIcon('fiber', 'active', sensorPriorities.fiber || 'medium', deviceSettings.fiber)}
                        >
                            <Popup>
                                <div>
                                    <strong>Fiber Optic {idx + 1}</strong>
                                    <div>Type: Fiber Optic</div>
                                    <div>Status: Active</div>
                                    <div>Priority: {sensorPriorities.fiber || 'medium'}</div>
                                    <div>Range: {(fiberPerimeterRadius * 111.32 * 1000).toFixed(0)}m</div>
                                    <div>Heading: {angle}°</div>
                                    <div>Sensitivity: {(deviceSettings.fiber.sensitivity * 100).toFixed(0)}%</div>
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

                {sensorPositions.radar.map((radar, idx) => (
                    <Marker
                        key={`radar-marker-${idx}`}
                        position={radar.position}
                        icon={getSensorIcon('radar', 'active', sensorPriorities.radar || 'medium', deviceSettings.radars[idx])}
                    >
                        <Popup>
                            <div>
                                <strong>Radar {idx + 1}</strong>
                                <div>Type: Radar</div>
                                <div>Status: Active</div>
                                <div>Priority: {sensorPriorities.radar || 'medium'}</div>
                                <div>Range: {(100 * (1 + (deviceSettings.radars[idx].range || 0)/2)).toFixed(0)}m</div>
                                <div>Heading: {(radar.heading + (deviceSettings.radars[idx].rotation || 0)) % 360}°</div>
                                <div>Effectiveness: {
                                    environment.weather === 'rain' ? 'High' :
                                        environment.weather === 'fog' ? 'High' :
                                            environment.timeOfDay === 'night' ? 'High' : 'Medium'
                                }</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

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

                <MapEvents threats={threats} viewMode={viewMode} />
            </MapContainer>

            
            

            {/* Device Controls Section */}
<div className="device-controls" style={{ 
    marginTop: '20px', 
    padding: '15px', 
    backgroundColor: '#2c3e50', // Dark blue-gray background for contrast
    borderRadius: '5px',
    color: '#ecf0f1' // Light text for contrast
}}>
    <h3 style={{ marginBottom: '10px', color: '#3498db' }}>Device Controls</h3>

    {/* Camera Controls - Individual, Collapsible */}
    <div className="camera-controls" style={{ marginBottom: '10px' }}>
        <h4 style={{ 
            cursor: 'pointer', 
            marginBottom: '5px',
            color: '#3498db',
            backgroundColor: '#34495e',
            padding: '5px',
            borderRadius: '3px'
        }} 
        onClick={() => setDeviceSettings(prev => ({ 
            ...prev, 
            showCameraControls: !prev.showCameraControls 
        }))}>
            Cameras {deviceSettings.showCameraControls ? '▼' : '▶'}
        </h4>
        {deviceSettings.showCameraControls && (
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '10px' 
            }}>
                {deviceSettings.cameras.map((camera, idx) => (
                    <div key={`camera-control-${idx}`} style={{ 
                        padding: '8px', 
                        backgroundColor: '#34495e', // Darker background for camera controls
                        borderRadius: '5px',
                        border: '1px solid #2980b9'
                    }}>
                        <div style={{ 
                            fontSize: '14px', 
                            marginBottom: '5px', 
                            color: '#3498db' 
                        }}>
                            Camera {idx + 1}
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px', 
                            marginBottom: '5px' 
                        }}>
                            <label style={{ 
                                fontSize: '12px', 
                                width: '60px',
                                color: '#ecf0f1' 
                            }}>Rot:</label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={camera.rotation}
                                onChange={(e) => handleCameraRotation(idx, parseInt(e.target.value))}
                                style={{ 
                                    width: '120px', 
                                    height: '6px',
                                    background: '#2980b9',
                                    borderRadius: '3px',
                                    appearance: 'none',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                                className="custom-range"
                            />
                            <span style={{ 
                                fontSize: '12px',
                                color: '#2ecc71' 
                            }}>{camera.rotation}°</span>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px', 
                            marginBottom: '5px' 
                        }}>
                            <label style={{ 
                                fontSize: '12px', 
                                width: '60px',
                                color: '#ecf0f1' 
                            }}>FOV:</label>
                            <input
                                type="range"
                                min="30"
                                max="120"
                                value={camera.fov}
                                onChange={(e) => handleCameraFOV(idx, parseInt(e.target.value))}
                                style={{ 
                                    width: '120px', 
                                    height: '6px',
                                    background: '#2980b9',
                                    borderRadius: '3px',
                                    appearance: 'none',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                                className="custom-range"
                            />
                            <span style={{ 
                                fontSize: '12px',
                                color: '#2ecc71' 
                            }}>{camera.fov}°</span>
                        </div>
                        <button
                            onClick={() => handleCameraThermal(idx)}
                            className={`w-full py-1 rounded text-white text-sm ${
                                camera.thermal 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            style={{ 
                                transition: 'all 0.3s',
                                backgroundColor: camera.thermal ? '#e74c3c' : '#3498db'
                            }}
                        >
                            {camera.thermal ? 'Thermal On' : 'Thermal Off'}
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>

    {/* Combined Controls for Lasers, Fiber Optics, and Radars - Collapsible */}
    <div className="other-controls">
        <h4 style={{ 
            cursor: 'pointer', 
            marginBottom: '5px',
            color: '#3498db',
            backgroundColor: '#34495e',
            padding: '5px',
            borderRadius: '3px'
        }} 
        onClick={() => setDeviceSettings(prev => ({ 
            ...prev, 
            showOtherControls: !prev.showOtherControls 
        }))}>
            Other Devices {deviceSettings.showOtherControls ? '▼' : '▶'}
        </h4>
        {deviceSettings.showOtherControls && (
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '10px' 
            }}>
                {/* Laser Controls - Combined */}
                <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#34495e',
                    borderRadius: '5px',
                    border: '1px solid #e74c3c'
                }}>
                    <div style={{ 
                        fontSize: '14px', 
                        marginBottom: '5px', 
                        color: '#e74c3c' 
                    }}>
                        All Lasers
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px' 
                    }}>
                        <label style={{ 
                            fontSize: '12px', 
                            width: '60px',
                            color: '#ecf0f1' 
                        }}>Intensity:</label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={deviceSettings.lasers[0].intensity}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setDeviceSettings(prev => ({
                                    ...prev,
                                    lasers: prev.lasers.map(() => ({ intensity: value }))
                                }));
                            }}
                            style={{ 
                                width: '120px', 
                                height: '6px',
                                background: '#e74c3c',
                                borderRadius: '3px',
                                appearance: 'none',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                            className="custom-range"
                        />
                        <span style={{ 
                            fontSize: '12px',
                            color: '#2ecc71' 
                        }}>{(deviceSettings.lasers[0].intensity * 100).toFixed(0)}%</span>
                    </div>
                </div>

                {/* Fiber Optic Controls */}
                <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#34495e',
                    borderRadius: '5px',
                    border: '1px solid #2ecc71'
                }}>
                    <div style={{ 
                        fontSize: '14px', 
                        marginBottom: '5px', 
                        color: '#2ecc71' 
                    }}>
                        Fiber Optics
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px' 
                    }}>
                        <label style={{ 
                            fontSize: '12px', 
                            width: '60px',
                            color: '#ecf0f1' 
                        }}>Sensitivity:</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={deviceSettings.fiber.sensitivity}
                            onChange={(e) => handleFiberSensitivity(parseFloat(e.target.value))}
                            style={{ 
                                width: '120px', 
                                height: '6px',
                                background: '#2ecc71',
                                borderRadius: '3px',
                                appearance: 'none',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                            className="custom-range"
                        />
                        <span style={{ 
                            fontSize: '12px',
                            color: '#2ecc71' 
                        }}>{(deviceSettings.fiber.sensitivity * 100).toFixed(0)}%</span>
                    </div>
                </div>

                {/* Radar Controls - Combined */}
                <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#34495e',
                    borderRadius: '5px',
                    border: '1px solid #f1c40f'
                }}>
                    <div style={{ 
                        fontSize: '14px', 
                        marginBottom: '5px', 
                        color: '#f1c40f' 
                    }}>
                        All Radars
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px', 
                        marginBottom: '5px' 
                    }}>
                        <label style={{ 
                            fontSize: '12px', 
                            width: '60px',
                            color: '#ecf0f1' 
                        }}>Rotation:</label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={deviceSettings.radars[0].rotation}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setDeviceSettings(prev => ({
                                    ...prev,
                                    radars: prev.radars.map(() => ({ ...prev.radars[0], rotation: value }))
                                }));
                            }}
                            style={{ 
                                width: '120px', 
                                height: '6px',
                                background: '#f1c40f',
                                borderRadius: '3px',
                                appearance: 'none',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                            className="custom-range"
                        />
                        <span style={{ 
                            fontSize: '12px',
                            color: '#2ecc71' 
                        }}>{deviceSettings.radars[0].rotation}°</span>
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px' 
                    }}>
                        <label style={{ 
                            fontSize: '12px', 
                            width: '60px',
                            color: '#ecf0f1' 
                        }}>Range:</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={deviceSettings.radars[0].range}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setDeviceSettings(prev => ({
                                    ...prev,
                                    radars: prev.radars.map(() => ({ ...prev.radars[0], range: value }))
                                }));
                            }}
                            style={{ 
                                width: '120px', 
                                height: '6px',
                                background: '#f1c40f',
                                borderRadius: '3px',
                                appearance: 'none',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                            className="custom-range"
                        />
                        <span style={{ 
                            fontSize: '12px',
                            color: '#2ecc71' 
                        }}>{(deviceSettings.radars[0].range * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        )}
    </div>
</div>

            <div>
                <Link 
                    href="/laser" 
                    className="inline-block px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all"
                >
                    Laser Simulation
                </Link>
            </div>
        </div>
    );
};

export default MapComponent;
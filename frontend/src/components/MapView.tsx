
import { useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Circle, 
  Marker, 
  Popup,
  useMap,
  LayerGroup,
  Polygon
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for marker icons in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Types
interface MapViewProps {
  hqLocation: { lat: number; lng: number };
  mapType: 'standard' | 'fiber';
  rangeSize: number;
  laserActive: boolean;
  laserBreach: boolean;
}

// Custom marker icons
const createCustomIcon = (className: string) => {
  return L.divIcon({
    className: className,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

// Fix default icon issue
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = defaultIcon;

// Map Controller component for changing tile layers
const MapController = ({ mapType }: { mapType: 'standard' | 'fiber' }) => {
  const map = useMap();
  
  useEffect(() => {
    // Set appropriate view based on map type
    if (mapType === 'fiber') {
      // For fiber view, we might want a darker map style
      map.getPane('mapPane')?.classList.add('fiber-view');
    } else {
      map.getPane('mapPane')?.classList.remove('fiber-view');
    }
  }, [map, mapType]);
  
  return null;
};

// Map initialization component to handle map ref
const MapInitializer = ({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) => {
  const map = useMap();
  
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ 
  hqLocation, 
  mapType, 
  rangeSize, 
  laserActive, 
  laserBreach 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  
  // Calculate offset coordinates for camera and laser
  const cameraLocation = {
    lat: hqLocation.lat + 0.003,
    lng: hqLocation.lng + 0.003
  };
  
  const laserLocation = {
    lat: hqLocation.lat - 0.003,
    lng: hqLocation.lng - 0.003
  };

  // Define additional cameras with their field of view
  const additionalCameras = [
    { 
      position: { lat: hqLocation.lat + 0.005, lng: hqLocation.lng - 0.002 },
      direction: 45, // Northeast direction (in degrees)
      name: "Camera Northeast"
    },
    { 
      position: { lat: hqLocation.lat - 0.004, lng: hqLocation.lng + 0.005 },
      direction: 270, // West direction (in degrees)
      name: "Camera West"
    },
    { 
      position: { lat: hqLocation.lat + 0.001, lng: hqLocation.lng - 0.006 },
      direction: 180, // South direction (in degrees)
      name: "Camera South"
    }
  ];

  // Convert range size from meters to appropriate circle radius
  const rangeInMeters = rangeSize;
  
  // HQ marker icon
  const hqIcon = createCustomIcon('map-marker-headquarters');
  const cameraIcon = createCustomIcon('map-marker-camera');
  const laserIcon = createCustomIcon('map-marker-laser');

  // Helper function to create camera field of view polygon
  const createCameraFieldOfView = (position: {lat: number, lng: number}, direction: number, angleWidth = 60, distance = rangeInMeters) => {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const toDeg = (rad: number) => rad * 180 / Math.PI;
    
    const startAngle = toRad(direction - angleWidth/2);
    const endAngle = toRad(direction + angleWidth/2);
    const earthRadius = 6378137; // Earth radius in meters
    
    // Convert distance to degrees (approximate)
    const latDistance = toDeg(distance / earthRadius);
    const lngDistance = toDeg(distance / (earthRadius * Math.cos(toRad(position.lat))));
    
    // Calculate polygon points
    const points: [number, number][] = [
      [position.lat, position.lng], // Camera position
    ];
    
    // Add points along the arc
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      const lat = position.lat + Math.sin(angle) * latDistance;
      const lng = position.lng + Math.cos(angle) * lngDistance;
      points.push([lat, lng]);
    }
    
    // Close the polygon
    points.push([position.lat, position.lng]);
    
    return points;
  };

  // Create laser lines
  const createLaserBeams = () => {
    // For demonstration, create a grid-like pattern of laser beams around HQ
    const beams: [number, number][][] = [];
    const beamCount = 8;
    const radius = rangeInMeters * 0.8; // Slightly smaller than the camera range
    
    for (let i = 0; i < beamCount; i++) {
      const angle = (i * 360 / beamCount) * (Math.PI / 180);
      const lat = hqLocation.lat + Math.sin(angle) * (radius / 111000); // Convert meters to lat degrees (approx)
      const lng = hqLocation.lng + Math.cos(angle) * (radius / (111000 * Math.cos(hqLocation.lat * Math.PI / 180))); // Convert meters to lng degrees
      
      beams.push([
        [hqLocation.lat, hqLocation.lng],
        [lat, lng]
      ]);
    }
    
    return beams;
  };

  return (
    <MapContainer
      center={[hqLocation.lat, hqLocation.lng]}
      zoom={14}
      className="map-container"
      zoomControl={false}
    >
      <MapInitializer mapRef={mapRef} />
      <MapController mapType={mapType} />
      
      {/* Base map layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={mapType === 'standard' 
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        }
      />
      
      {/* Markers Layer */}
      <LayerGroup>
        {/* HQ Marker */}
        <Marker position={[hqLocation.lat, hqLocation.lng]} icon={hqIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Headquarters</strong>
              <p>Main security center</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Main Camera Marker */}
        <Marker position={[cameraLocation.lat, cameraLocation.lng]} icon={cameraIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Main Security Camera</strong>
              <p>360° coverage surveillance</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Additional cameras with field of view */}
        {additionalCameras.map((camera, idx) => (
          <LayerGroup key={`camera-${idx}`}>
            <Marker position={[camera.position.lat, camera.position.lng]} icon={cameraIcon}>
              <Popup>
                <div className="text-sm">
                  <strong>{camera.name}</strong>
                  <p>Directional surveillance</p>
                </div>
              </Popup>
            </Marker>
            <Polygon 
              positions={createCameraFieldOfView(camera.position, camera.direction)}
              pathOptions={{
                fillColor: '#34C759',
                fillOpacity: 0.1,
                weight: 1,
                color: '#34C759',
                dashArray: '5,5'
              }}
            />
          </LayerGroup>
        ))}
        
        {/* Laser Marker */}
        <Marker position={[laserLocation.lat, laserLocation.lng]} icon={laserIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Laser Detection</strong>
              <p>Perimeter security system</p>
            </div>
          </Popup>
        </Marker>
      </LayerGroup>
      
      {/* Range circles */}
      <LayerGroup>
        {/* Main camera range (still showing circular coverage) */}
        <Circle
          center={[cameraLocation.lat, cameraLocation.lng]}
          radius={rangeInMeters}
          pathOptions={{
            color: '#34C759',
            fillColor: '#34C759',
            fillOpacity: 0.05,
            weight: 2,
            dashArray: [5, 5],
            className: 'camera-range'
          }}
        />
        
        {/* Laser system visualization */}
        {laserActive && createLaserBeams().map((beam, idx) => (
          <Polygon
            key={`laser-${idx}`}
            positions={beam}
            pathOptions={{
              color: laserBreach ? '#FF3B30' : '#FF9500',
              weight: laserBreach ? 2 : 1,
              opacity: laserBreach ? 0.8 : 0.6,
              dashArray: laserBreach ? undefined : [2, 4],
            }}
          />
        ))}
      </LayerGroup>
      
      {/* Fiber optic network visualization (when fiber map is selected) */}
      {mapType === 'fiber' && (
        <LayerGroup>
          {/* Simulated fiber optic lines */}
          {/* This would typically be replaced with actual geoJSON data */}
          <Circle
            center={[hqLocation.lat, hqLocation.lng]}
            radius={rangeInMeters * 1.5}
            pathOptions={{
              color: '#0071e3',
              fillColor: '#0071e3',
              fillOpacity: 0.03,
              weight: 1.5,
              dashArray: [3, 6],
            }}
          />
        </LayerGroup>
      )}
    </MapContainer>
  );
};

export default MapView;
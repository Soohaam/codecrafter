"use client";

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

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface MapViewProps {
  hqLocation: { lat: number; lng: number };
  mapType: 'standard' | 'fiber';
  rangeSize: number;
  laserActive: boolean;
  laserBreach: boolean;
  onCircleClick?: () => void; // New prop to handle circle click
}

const createCustomIcon = (className: string) => {
  return L.divIcon({
    className: className,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = defaultIcon;

const MapController = ({ mapType }: { mapType: 'standard' | 'fiber' }) => {
  const map = useMap();
  
  useEffect(() => {
    if (mapType === 'fiber') {
      map.getPane('mapPane')?.classList.add('fiber-view');
    } else {
      map.getPane('mapPane')?.classList.remove('fiber-view');
    }
  }, [map, mapType]);
  
  return null;
};

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
  laserBreach,
  onCircleClick
}) => {
  const mapRef = useRef<L.Map | null>(null);
  
  const cameraLocation = {
    lat: hqLocation.lat + 0.003,
    lng: hqLocation.lng + 0.003
  };
  
  const laserLocation = {
    lat: hqLocation.lat - 0.003,
    lng: hqLocation.lng - 0.003
  };

  const additionalCameras = [
    { position: { lat: hqLocation.lat + 0.005, lng: hqLocation.lng - 0.002 }, direction: 45, name: "Camera Northeast" },
    { position: { lat: hqLocation.lat - 0.004, lng: hqLocation.lng + 0.005 }, direction: 270, name: "Camera West" },
    { position: { lat: hqLocation.lat + 0.001, lng: hqLocation.lng - 0.006 }, direction: 180, name: "Camera South" }
  ];

  const rangeInMeters = rangeSize;
  const hqIcon = createCustomIcon('map-marker-headquarters');
  const cameraIcon = createCustomIcon('map-marker-camera');
  const laserIcon = createCustomIcon('map-marker-laser');

  const createCameraFieldOfView = (position: {lat: number, lng: number}, direction: number, angleWidth = 60, distance = rangeInMeters) => {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const toDeg = (rad: number) => rad * 180 / Math.PI;
    
    const startAngle = toRad(direction - angleWidth/2);
    const endAngle = toRad(direction + angleWidth/2);
    const earthRadius = 6378137;
    
    const latDistance = toDeg(distance / earthRadius);
    const lngDistance = toDeg(distance / (earthRadius * Math.cos(toRad(position.lat))));
    
    const points: [number, number][] = [[position.lat, position.lng]];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      const lat = position.lat + Math.sin(angle) * latDistance;
      const lng = position.lng + Math.cos(angle) * lngDistance;
      points.push([lat, lng]);
    }
    points.push([position.lat, position.lng]);
    
    return points;
  };

  const createLaserBeams = () => {
    const beams: [number, number][][] = [];
    const beamCount = 8;
    const radius = rangeInMeters * 0.8;
    
    for (let i = 0; i < beamCount; i++) {
      const angle = (i * 360 / beamCount) * (Math.PI / 180);
      const lat = hqLocation.lat + Math.sin(angle) * (radius / 111000);
      const lng = hqLocation.lng + Math.cos(angle) * (radius / (111000 * Math.cos(hqLocation.lat * Math.PI / 180)));
      beams.push([[hqLocation.lat, hqLocation.lng], [lat, lng]]);
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
      
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={mapType === 'standard' 
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        }
      />
      
      <LayerGroup>
        <Marker position={[hqLocation.lat, hqLocation.lng]} icon={hqIcon}>
          <Popup><strong>Headquarters</strong><p>Main security center</p></Popup>
        </Marker>
        
        <Marker position={[cameraLocation.lat, cameraLocation.lng]} icon={cameraIcon}>
          <Popup><strong>Main Security Camera</strong><p>360° coverage surveillance</p></Popup>
        </Marker>
        
        {additionalCameras.map((camera, idx) => (
          <LayerGroup key={`camera-${idx}`}>
            <Marker position={[camera.position.lat, camera.position.lng]} icon={cameraIcon}>
              <Popup><strong>{camera.name}</strong><p>Directional surveillance</p></Popup>
            </Marker>
            <Polygon 
              positions={createCameraFieldOfView(camera.position, camera.direction)}
              pathOptions={{ fillColor: '#34C759', fillOpacity: 0.1, weight: 1, color: '#34C759', dashArray: '5,5' }}
            />
          </LayerGroup>
        ))}
        
        <Marker position={[laserLocation.lat, laserLocation.lng]} icon={laserIcon}>
          <Popup><strong>Laser Detection</strong><p>Perimeter security system</p></Popup>
        </Marker>
      </LayerGroup>
      
      <LayerGroup>
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
  eventHandlers={{
    click: () => {
      console.log("Circle clicked!");
      if (onCircleClick) onCircleClick();
    }
  }}
/>
        
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
      
      {mapType === 'fiber' && (
        <LayerGroup>
          <Circle
            center={[hqLocation.lat, hqLocation.lng]}
            radius={rangeInMeters * 1.5}
            pathOptions={{ color: '#0071e3', fillColor: '#0071e3', fillOpacity: 0.03, weight: 1.5, dashArray: [3, 6] }}
          />
        </LayerGroup>
      )}
    </MapContainer>
  );
};

export default MapView;
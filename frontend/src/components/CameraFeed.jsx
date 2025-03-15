'use client'; // components/CameraFeed.js
import { useState, useEffect } from 'react';

const CameraFeed = ({ type, environment }) => {
  const [frame, setFrame] = useState(1);
  const [currentTime, setCurrentTime] = useState('');
  
  // Simulate camera feed with changing frames
  useEffect(() => {
    const frameInterval = setInterval(() => {
      setFrame(prev => (prev % 5) + 1);
    }, 2000);
    
    // Update time only on client-side
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // Ensures consistent PM/pm formatting
      }));
    };
    
    // Initial time update
    updateTime();
    
    // Setup time interval
    const timeInterval = setInterval(updateTime, 1000);
    
    return () => {
      clearInterval(frameInterval);
      clearInterval(timeInterval);
    };
  }, []); // Empty dependency array is correct here
  
  // Determine visual effects based on environment - moved outside useEffect
  const getVisualEffects = () => {
    let filter = '';
    let opacity = 1;
    
    if (type === 'normal') {
      if (environment?.weather === 'fog') {
        filter += 'blur(2px) brightness(0.9)';
      }
      if (environment?.weather === 'rain') {
        filter += 'contrast(1.1) brightness(0.8)';
      }
      if (environment?.timeOfDay === 'night') {
        filter += 'brightness(0.3) contrast(1.2)';
      }
    } else if (type === 'thermal') {
      // Thermal camera is less affected by weather but shows heat signatures
      filter = 'hue-rotate(120deg) saturate(2)';
      
      if (environment?.timeOfDay === 'night') {
        opacity = 0.9;
      }
    }
    
    return { filter, opacity };
  };
  
  // Only calculate visual effects once per render
  const visualEffects = getVisualEffects();
  
  return (
    <div className="h-full w-full relative">
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-10">
        {type === 'normal' ? 'Standard Camera Feed' : 'Thermal Camera Feed'}
      </div>
      
      {/* Simulated camera feed using placeholders */}
      <div 
        className="h-full w-full bg-black flex items-center justify-center"
        style={{
          backgroundImage: `url(/api/placeholder/800/400?text=Camera+Feed+${frame})`,
          backgroundSize: 'cover',
          filter: visualEffects.filter,
          opacity: visualEffects.opacity
        }}
      >
        {/* Overlay elements like detection boxes would go here */}
        {frame === 3 && (
          <div className="border-2 border-red-500 absolute" style={{
            left: '30%',
            top: '40%',
            width: '100px',
            height: '150px'
          }}>
            <div className="bg-red-500 text-white text-xs p-1">Movement Detected</div>
          </div>
        )}
      </div>
      
      {/* Camera info overlay */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {/* Only show time when client-side rendering is active */}
        {currentTime ? `${currentTime} | ${environment?.weather || 'clear'} | ${environment?.timeOfDay || 'day'}` : ''}
      </div>
    </div>
  );
};

export default CameraFeed;
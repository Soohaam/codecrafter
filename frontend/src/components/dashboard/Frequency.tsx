// src/components/dashboard/Frequency.tsx
"use client";

import { useEffect, useRef } from 'react';

interface FrequencyProps {
  isActive: boolean; // Indicates a click event has occurred
}

const Frequency: React.FC<FrequencyProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const waveDataRef = useRef<number[]>([]);
  const fluctuationStartTimeRef = useRef<number | null>(null); // Track when fluctuation starts

  // Canvas dimensions
  const width = 600;
  const height = 100;
  const fluctuationDuration = 1000; // 1 second of fluctuation

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize wave data if empty
    if (waveDataRef.current.length === 0) {
      waveDataRef.current = new Array(Math.floor(width / 2)).fill(height / 2); // Flat line
    }

    // Handle click to trigger fluctuation
    if (isActive && fluctuationStartTimeRef.current === null) {
      fluctuationStartTimeRef.current = Date.now(); // Start fluctuation timer
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);

      // Draw border
      ctx.strokeStyle = '#34C759';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);

      // Update wave data
      timeRef.current += 0.05; // Speed of wave movement

      // Determine if we should fluctuate
      const now = Date.now();
      const shouldFluctuate = fluctuationStartTimeRef.current !== null && 
                              (now - fluctuationStartTimeRef.current) < fluctuationDuration;

      // Add new data point at the start (left)
      let newPoint = height / 2; // Default flat line
      if (shouldFluctuate) {
        // Subtle fluctuation when clicked
        newPoint = height / 2 + Math.sin(timeRef.current * 4) * 10; // Smaller amplitude (10) and faster frequency
      }
      
      waveDataRef.current.unshift(newPoint); // Add to start
      if (waveDataRef.current.length > width / 2) {
        waveDataRef.current.pop(); // Remove from end
      }

      // Reset fluctuation timer if duration is over
      if (fluctuationStartTimeRef.current !== null && !shouldFluctuate) {
        fluctuationStartTimeRef.current = null;
      }

      // Draw the wave
      ctx.beginPath();
      ctx.strokeStyle = '#34C759';
      ctx.lineWidth = 1;

      for (let x = 0; x < waveDataRef.current.length; x++) {
        const y = waveDataRef.current[x];
        if (x === 0) {
          ctx.moveTo(x * 2, y);
        } else {
          ctx.lineTo(x * 2, y);
        }
      }

      ctx.stroke();

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]); // Re-run effect when isActive changes

  return (
    <div className="frequency-container" style={{ padding: '10px' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ 
          borderRadius: '4px',
          backgroundColor: '#1a1a1a'
        }}
      />
    </div>
  );
};

export default Frequency;
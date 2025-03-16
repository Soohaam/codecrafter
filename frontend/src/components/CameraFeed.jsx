"use client"; // components/CameraFeed.js
import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const authorizedFaces = [
  { name: "oshnik", image: "/faces/oshnik.jpg" },
  { name: "soham", image: "/faces/soham.jpg" },
  { name: "sujal", image: "/faces/sujal.jpg" },
];

const CameraFeed = ({ type, environment }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState([]);
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [verdict, setVerdict] = useState("Scanning..."); // Verdict state
  const [unauthorizedStartTime, setUnauthorizedStartTime] = useState(null); // Track unauthorized duration
  const [isThreat, setIsThreat] = useState(false); // Track if it's a threat

  // Load face-api.js models
  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      console.log("Face API models loaded.");
      setModelsLoaded(true);
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  // Load authorized faces
  const loadAuthorizedFaces = async () => {
    const descriptors = [];
    for (const person of authorizedFaces) {
      try {
        const img = await faceapi.fetchImage(person.image);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
          descriptors.push(new faceapi.LabeledFaceDescriptors(person.name, [detection.descriptor]));
        }
      } catch (error) {
        console.error(`Error loading face data for ${person.name}:`, error);
      }
    }
    setLabeledFaceDescriptors(descriptors);
  };

  // Start camera feed
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && canvasRef.current) {
            canvasRef.current.width = videoRef.current.clientWidth;
            canvasRef.current.height = videoRef.current.clientHeight;
          }
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Visual effects based on environment
  const getVisualEffects = () => {
    let filter = '';
    let opacity = 1;
    if (type === 'normal') {
      if (environment?.weather === 'fog') filter += 'blur(2px) brightness(0.9)';
      if (environment?.weather === 'rain') filter += 'contrast(1.1) brightness(0.8)';
      if (environment?.timeOfDay === 'night') filter += 'brightness(0.3) contrast(1.2)';
    } else if (type === 'thermal') {
      filter = 'hue-rotate(120deg) saturate(2)';
      if (environment?.timeOfDay === 'night') opacity = 0.9;
    }
    return { filter, opacity };
  };

  // Initial setup
  useEffect(() => {
    setIsMounted(true);
    loadModels().then(loadAuthorizedFaces);

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(timeInterval);
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, []);

  // Start camera when models are loaded
  useEffect(() => {
    if (modelsLoaded && isMounted) startCamera();
  }, [modelsLoaded, isMounted]);

  // Face detection and recognition with verdict logic
  useEffect(() => {
    if (!modelsLoaded || labeledFaceDescriptors.length === 0 || !videoRef.current || !isMounted) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (detectionInterval) clearInterval(detectionInterval);

    const detectFaces = async () => {
      if (!canvas || !video || video.paused || video.ended) return;

      const displaySize = { width: video.clientWidth, height: video.clientHeight };
      faceapi.matchDimensions(canvas, displaySize);

      try {
        const detections = await faceapi.detectAllFaces(video)
          .withFaceLandmarks()
          .withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (labeledFaceDescriptors.length > 0) {
          const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);
          let isAuthorized = false;

          if (resizedDetections.length === 0) {
            setVerdict("No Face Detected");
            setUnauthorizedStartTime(null);
            setIsThreat(false);
          } else {
            resizedDetections.forEach((detection) => {
              const match = faceMatcher.findBestMatch(detection.descriptor);
              const box = detection.detection.box;
              const label = match.label === "unknown" ? "Unauthorized" : match.label;
              const color = match.label === "unknown" ? "red" : "green";

              const drawOptions = { 
                label, 
                boxColor: color, 
                drawLabelOptions: { fontSize: 16, fontStyle: "bold" }, 
                lineWidth: 3 
              };
              const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
              drawBox.draw(canvas);

              if (match.label !== "unknown") {
                isAuthorized = true;
              }
            });

            if (isAuthorized) {
              setVerdict("Authorized");
              setUnauthorizedStartTime(null);
              setIsThreat(false);
            } else {
              const now = Date.now();
              if (!unauthorizedStartTime) {
                setUnauthorizedStartTime(now);
                setVerdict("Scanning...");
              } else {
                const timeElapsed = (now - unauthorizedStartTime) / 1000; // in seconds
                if (timeElapsed >= 2) {
                  setVerdict("Unauthorized");
                  setIsThreat(true);
                } else {
                  setVerdict("Scanning...");
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in face detection:", error);
      }
    };

    const interval = setInterval(detectFaces, 100);
    setDetectionInterval(interval);

    const handleResize = () => {
      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.clientWidth;
        canvasRef.current.height = videoRef.current.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [modelsLoaded, labeledFaceDescriptors, isMounted, unauthorizedStartTime]);

  const visualEffects = getVisualEffects();

  if (!isMounted) return null;

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Feed Type Overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-10">
        {type === 'normal' ? 'Standard Camera Feed' : 'Thermal Camera Feed'}
      </div>

      {/* Video and Canvas */}
      <div 
        className="flex-1 w-full relative overflow-hidden"
        style={{ filter: visualEffects.filter, opacity: visualEffects.opacity }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
      </div>

      {/* Time and Environment Overlay */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-10">
        {currentTime ? `${currentTime} | ${environment?.weather || 'clear'} | ${environment?.timeOfDay || 'day'}` : ''}
      </div>

      {/* Verdict Display */}
      <div className="bg-gray-800 text-white p-2 text-center text-sm font-medium">
        <span>Verdict: </span>
        <span className={isThreat ? "text-red-500" : "text-green-500"}>
          {verdict}{isThreat ? " (Threat Identified)" : ""}
        </span>
      </div>
    </div>
  );
};

export default CameraFeed;
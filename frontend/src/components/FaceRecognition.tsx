"use client";
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const authorizedFaces = [
  { name: "oshnik", image: "/faces/oshnik.jpg" },
  { name: "soham", image: "/faces/soham.jpg" },
  { name: "sujal", image: "/faces/sujal.jpg" },
];

const FaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState<faceapi.LabeledFaceDescriptors[]>([]);
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to load models
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
    const descriptors: faceapi.LabeledFaceDescriptors[] = [];
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

  useEffect(() => {
    loadModels().then(loadAuthorizedFaces);

    // Cleanup function to stop detection interval
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, []);

  // Function to start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 560 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be loaded
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && canvasRef.current) {
            // Set canvas dimensions to match video
            canvasRef.current.width = videoRef.current.clientWidth;
            canvasRef.current.height = videoRef.current.clientHeight;
          }
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
    }
  }, [modelsLoaded]);

  // Detect faces
  useEffect(() => {
    if (!modelsLoaded || labeledFaceDescriptors.length === 0 || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!canvas) return;

    // Stop previous detection interval if exists
    if (detectionInterval) {
      clearInterval(detectionInterval);
    }

    const detectFaces = async () => {
      if (!canvas || !video || video.paused || video.ended) return;
      
      // Get current video dimensions
      const displaySize = { 
        width: video.clientWidth,
        height: video.clientHeight 
      };
      
      // Make sure canvas matches video dimensions
      faceapi.matchDimensions(canvas, displaySize);

      try {
        // Detect faces
        const detections = await faceapi.detectAllFaces(video)
          .withFaceLandmarks()
          .withFaceDescriptors();
        
        // Resize detection results to match display size
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Clear previous drawings
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (labeledFaceDescriptors.length > 0) {
          // Create face matcher with lower distance threshold for better accuracy
          const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);
          
          // Process each detected face
          resizedDetections.forEach((detection) => {
            const match = faceMatcher.findBestMatch(detection.descriptor);
            const box = detection.detection.box;
            const label = match.label === "unknown" ? "Unauthorized" : match.label;
            const color = match.label === "unknown" ? "red" : "green";
            
            // Draw box with thicker lines
            const drawOptions = { 
              label, 
              boxColor: color,
              drawLabelOptions: {
                fontSize: 16,
                fontStyle: "bold"
              },
              lineWidth: 3
            };
            
            const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
            drawBox.draw(canvas);
          });
        }
      } catch (error) {
        console.error("Error in face detection:", error);
      }
    };

    // Run detection frequently but not too often to avoid performance issues
    const interval = setInterval(detectFaces, 100);
    setDetectionInterval(interval);

    // Add event listener to handle window resize
    const handleResize = () => {
      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.clientWidth;
        canvasRef.current.height = videoRef.current.clientHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [modelsLoaded, labeledFaceDescriptors]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "720px", margin: "0 auto" }}>
      <h1>Face Recognition with Face API.js</h1>
      <div style={{ position: "relative" }}>
        <video 
          ref={videoRef} 
          width="720" 
          height="560" 
          autoPlay 
          muted
          style={{ display: "block" }}
        ></video>
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0,
            width: "100%",
            height: "100%"
          }} 
        />
      </div>
    </div>
  );
};

export default FaceRecognition;
"use client";
import React, { useState, useEffect } from 'react';

export default function CombinedFeatures() {
  type ViewType = 'objectDetection' | 'thermalView' | 'activityDetection' | 'weaponDetection';
  type InitStep = 'initializing' | 'searchingDrone' | 'noDroneFound' | 'configuringCamera' | 'ready';

  const [activeView, setActiveView] = useState<ViewType>('objectDetection');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [initializationStep, setInitializationStep] = useState<InitStep>('initializing');
  const [initProgress, setInitProgress] = useState<number>(0);

  useEffect(() => {
    const initializeSystem = async () => {
      const steps = [
        { name: 'initializing', message: 'Initializing advanced detection system...', duration: 4200 },
        { name: 'noDroneFound', message: 'No drone connection found. Switching to the device\'s local camera...', duration: 3500 },
        { name: 'configuringCamera', message: 'Configuring local camera...', duration: 5100 },
      ];

      for (const step of steps) {
        setInitializationStep(step.name as InitStep);
        let progress = 0;
        const incrementCount = Math.floor(Math.random() * 10) + 5; // 5 to 14 increments
        const incrementSize = 100 / incrementCount;
        
        for (let i = 0; i < incrementCount; i++) {
          progress += incrementSize * (Math.random() * 0.5 + 0.75); // 75% to 125% of incrementSize
          setInitProgress(Math.min(Math.round(progress), 99)); // Ensure we don't exceed 99%
          await new Promise(resolve => setTimeout(resolve, step.duration / incrementCount + Math.random() * 300));
        }
      }

      setInitProgress(100);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Longer pause at 100% for a more realistic feel
      setInitializationStep('ready');
    };

    initializeSystem();
  }, []);

  useEffect(() => {
    if (initializationStep === 'ready') {
      setIsLoading(true);
      setHasError(false);
    }
  }, [activeView, initializationStep]);

  const handleImageLoad = (): void => {
    setIsLoading(false);
  };

  const handleImageError = (): void => {
    setHasError(true);
    setIsLoading(false);
  };

  interface ViewConfig {
    src: string;
    alt: string;
  }

  const renderActiveView = () => {
    const views: Record<ViewType, ViewConfig> = {
      objectDetection: {
        src: "http://localhost:5000/video_feed",
        alt: "Object Detection Feed"
      },
      thermalView: {
        src: "http://localhost:5000/video_feed_thermal",
        alt: "Thermal Camera Feed"
      },
      activityDetection: {
        src: "http://localhost:5000/activity_feed",
        alt: "Activity Detection Feed"
      },
      weaponDetection: {
        src: "http://localhost:5000/weapon_detection_feed",
        alt: "Weapon Detection Feed"
      }
    };

    const currentView = views[activeView];

    return (
      <div className="relative w-full aspect-video bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 mx-auto animate-spin mb-4"></div>
              <p className="text-blue-400 font-semibold">Loading {activeView.replace(/([A-Z])/g, ' $1').trim()}...</p>
            </div>
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <p className="text-red-500 font-semibold">Error loading feed. Please try again later.</p>
          </div>
        ) : (
          <img
            src={currentView.src}
            alt={currentView.alt}
            className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>
    );
  };

  const renderDescription = () => {
    const descriptions: Record<ViewType, string> = {
      objectDetection: "Live feed from our advanced object detection system. Watch as objects are identified and tracked in real-time.",
      thermalView: "Real-time thermal imaging feed. Observe heat signatures and temperature variations across the monitored area.",
      activityDetection: "Intelligent activity monitoring system. Analyzing and identifying various human activities in the scene.",
      weaponDetection: "Advanced weapon detection feed. Instantly identifying and alerting potential threats for enhanced security."
    };

    return (
      <p className="text-gray-300 text-lg">
        {descriptions[activeView]}
      </p>
    );
  };

  const renderLoadingScreen = () => {
    const messages: Partial<Record<InitStep, string>> = {
      initializing: 'Initializing advanced detection system...',
      searchingDrone: 'Searching for a drone connection...',
      noDroneFound: 'No drone connection found. Switching to the device\'s local camera...',
      configuringCamera: 'Configuring local camera...',
    };

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-extrabold text-blue-500 text-center mb-8">
          Advanced Detection System
        </h1>
        <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${initProgress}%` }}
          ></div>
        </div>
        <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 mx-auto animate-spin mb-4"></div>
        <p className="text-gray-300 text-lg mb-2">{messages[initializationStep]}</p>
        <p className="text-gray-400">Progress: {initProgress}%</p>
      </div>
    );
  };

  if (initializationStep !== 'ready') {
    return renderLoadingScreen();
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
          <div className="p-6 flex flex-wrap justify-center gap-4 border-b border-gray-700">
            {(['objectDetection', 'thermalView', 'activityDetection', 'weaponDetection'] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-6 py-3 text-sm font-medium rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  activeView === view
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {view.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
          {renderActiveView()}
        </div>
        <div className="bg-gray-800 shadow-lg rounded-lg p-6">
          {renderDescription()}
        </div>
      </div>
    </div>
  );
}
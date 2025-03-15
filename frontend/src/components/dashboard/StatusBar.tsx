"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  AlertTriangle, 
  Zap, 
  Camera,
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { toast } from "sonner";

interface StatusBarProps {
  laserActive: boolean;
  laserBreach: boolean;
  onLaserToggle: () => void;
  onBreachSimulate: () => void;
}

const StatusBar = ({ 
  laserActive, 
  laserBreach,
  onLaserToggle, 
  onBreachSimulate 
}: StatusBarProps) => {
  const handleLaserToggle = () => {
    onLaserToggle();
    
    toast(laserActive ? "Laser system deactivated" : "Laser system activated", {
      description: laserActive 
        ? "The perimeter security laser has been turned off" 
        : "The perimeter security laser is now active",
      icon: laserActive ? <Zap className="h-4 w-4" /> : <Zap className="h-4 w-4" />,
    });
  };
  
  const handleBreachSimulate = () => {
    if (laserActive && !laserBreach) {
      onBreachSimulate();
      
      toast.error("Security breach detected", {
        description: "Perimeter laser breach at south-east quadrant",
        icon: <AlertTriangle className="h-4 w-4" />,
        duration: 5000,
      });
    } else if (!laserActive) {
      toast.warning("Cannot simulate breach", {
        description: "Laser system is currently inactive",
        duration: 3000,
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="dash-card"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between p-4">
        <div className="flex items-center mb-4 sm:mb-0">
          {laserBreach ? (
            <div className="mr-3 p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="mr-3 p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          
          <div>
            <h1 className="text-xl font-semibold">Fiber Optic Security System</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-4 mr-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${laserActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">Laser System</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Camera Feed</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${laserBreach ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-sm font-medium">Security Status</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Laser</span>
            <Switch 
              checked={laserActive} 
              onCheckedChange={handleLaserToggle} 
              className={laserActive ? 'bg-green-500' : 'bg-gray-400'}
            />
          </div>
          
          <Button 
            variant={laserBreach ? "secondary" : "destructive"} 
            size="sm"
            disabled={laserBreach || !laserActive}
            onClick={handleBreachSimulate}
            className="flex items-center"
          >
            <AlertTriangle className="h-4 w-4 mr-1.5" />
            Simulate Breach
          </Button>
        </div>
      </div>
      
      {laserBreach && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800/50 text-red-800 dark:text-red-200 flex items-center justify-between rounded-b-2xl"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
            <span className="font-medium">SECURITY ALERT:</span>
            <span className="ml-2">Perimeter breach detected at south-east quadrant</span>
          </div>
          <div className="text-xs font-mono bg-red-100 dark:bg-red-800/50 px-2 py-1 rounded">
            {new Date().toLocaleTimeString()}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatusBar;

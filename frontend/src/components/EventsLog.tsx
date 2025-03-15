import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { 
  Download, 
  RefreshCw,
  Info,
  AlertTriangle,
  AlertOctagon,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EventType, SecurityEvent } from '@/types/security';

interface EventsLogProps {
  events: SecurityEvent[];
  onExport: (format: 'csv' | 'json') => void;
  className?: string;
}

const EventsLog = ({ events, onExport, className = '' }: EventsLogProps) => {
  const [expanded, setExpanded] = useState(false);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case EventType.INFO:
        return <Info className="h-4 w-4 text-blue-500" />;
      case EventType.WARNING:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case EventType.ALERT:
        return <AlertOctagon className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventTypeClass = (type: EventType) => {
    switch (type) {
      case EventType.INFO:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case EventType.WARNING:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
      case EventType.ALERT:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const displayedEvents = events;

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Live Log</h2>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 flex items-center">
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="space-y-2 overflow-y-auto flex-1">
        {displayedEvents.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No events recorded
          </div>
        ) : (
          displayedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.05 }
              }}
              className="flex items-start space-x-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="font-medium truncate">{event.message}</div>
                  <div className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${getEventTypeClass(event.type)}`}>
                    {event.type}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{event.details}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatTimestamp(event.timestamp)}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsLog;
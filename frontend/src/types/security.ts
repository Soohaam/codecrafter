export enum EventType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT'
}

export interface SecurityEvent {
  id: string;
  message?: string;
  details?: string;
  timestamp: number | string;
  type: EventType;
  object_name?: string;
  confidence?: number;
  isPerson?: boolean; // Add to identify person detections
  authorizationStatus?: 'AUTHORIZED' | 'UNAUTHORIZED' | 'PENDING'; // Add for face recognition status
}
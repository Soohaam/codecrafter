
export enum EventType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT'
}

export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: EventType;
  message: string;
  details: string;
}

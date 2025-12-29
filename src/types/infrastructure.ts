export interface Position {
  x: number;
  y: number;
}

export interface GeographicLocation {
  id: string;
  label: string;
}

export interface Service {
  id: string;
  name: string;
  port: number;
  protocol: 'http' | 'https';
  description?: string;
  apiEndpoint?: boolean;
}

export interface Host {
  id: string;
  name: string;
  ip: string;
  location: GeographicLocation;
  position: Position;
  services: Service[];
  metadata?: {
    os?: string;
    hardware?: string;
    notes?: string;
  };
}

export interface Connection {
  id: string;
  sourceHostId: string;
  targetHostId: string;
  label?: string;
}

export interface AppSettings {
  showIPs: boolean;
  showPorts: boolean;
  darkMode: boolean;
}

export interface InfrastructureData {
  version: string;
  locations: GeographicLocation[];
  hosts: Host[];
  connections: Connection[];
  settings: AppSettings;
}

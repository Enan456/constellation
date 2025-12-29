import { z } from 'zod';

export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const locationSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const serviceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(['http', 'https']),
  description: z.string().optional(),
});

export const hostSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Invalid IP address'),
  location: locationSchema,
  position: positionSchema,
  services: z.array(serviceSchema),
  metadata: z.object({
    os: z.string().optional(),
    hardware: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

export const connectionSchema = z.object({
  id: z.string().min(1),
  sourceHostId: z.string().min(1),
  targetHostId: z.string().min(1),
  label: z.string().optional(),
});

export const settingsSchema = z.object({
  showIPs: z.boolean(),
  showPorts: z.boolean(),
});

export const infrastructureSchema = z.object({
  version: z.string(),
  locations: z.array(locationSchema),
  hosts: z.array(hostSchema),
  connections: z.array(connectionSchema),
  settings: settingsSchema,
});

export type InfrastructureSchema = z.infer<typeof infrastructureSchema>;

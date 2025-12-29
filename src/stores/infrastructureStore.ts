import { create } from 'zustand';
import type { InfrastructureData, Host, Service, Connection, GeographicLocation } from '@/types/infrastructure';
import { v4 as uuidv4 } from 'uuid';

interface InfrastructureStore {
  data: InfrastructureData | null;
  isEditMode: boolean;
  isLoading: boolean;
  error: string | null;
  selectedHostId: string | null;

  // Actions
  setData: (data: InfrastructureData) => void;
  toggleEditMode: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedHostId: (id: string | null) => void;

  // Host operations
  addHost: (host: Omit<Host, 'id'>) => void;
  updateHost: (id: string, updates: Partial<Host>) => void;
  deleteHost: (id: string) => void;
  updateHostPosition: (id: string, x: number, y: number) => void;

  // Service operations
  addService: (hostId: string, service: Omit<Service, 'id'>) => void;
  updateService: (hostId: string, serviceId: string, updates: Partial<Service>) => void;
  deleteService: (hostId: string, serviceId: string) => void;

  // Connection operations
  addConnection: (sourceHostId: string, targetHostId: string) => void;
  deleteConnection: (id: string) => void;

  // Location operations
  addLocation: (location: Omit<GeographicLocation, 'id'>) => void;

  // Settings operations
  toggleDarkMode: () => void;

  // Persistence
  saveData: () => Promise<void>;
  loadData: () => Promise<void>;
}

export const useInfrastructureStore = create<InfrastructureStore>((set, get) => ({
  data: null,
  isEditMode: false,
  isLoading: false,
  error: null,
  selectedHostId: null,

  setData: (data) => set({ data }),
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedHostId: (id) => set({ selectedHostId: id }),

  addHost: (hostData) => {
    const { data } = get();
    if (!data) return;

    const newHost: Host = {
      ...hostData,
      id: uuidv4(),
    };

    set({
      data: {
        ...data,
        hosts: [...data.hosts, newHost],
      },
    });
  },

  updateHost: (id, updates) => {
    const { data } = get();
    if (!data) return;

    set({
      data: {
        ...data,
        hosts: data.hosts.map((host) =>
          host.id === id ? { ...host, ...updates } : host
        ),
      },
    });
  },

  deleteHost: (id) => {
    const { data } = get();
    if (!data) return;

    set({
      data: {
        ...data,
        hosts: data.hosts.filter((host) => host.id !== id),
        connections: data.connections.filter(
          (conn) => conn.sourceHostId !== id && conn.targetHostId !== id
        ),
      },
    });
  },

  updateHostPosition: (id, x, y) => {
    const { data } = get();
    if (!data) return;

    set({
      data: {
        ...data,
        hosts: data.hosts.map((host) =>
          host.id === id ? { ...host, position: { x, y } } : host
        ),
      },
    });
  },

  addService: (hostId, serviceData) => {
    const { data } = get();
    if (!data) return;

    const newService: Service = {
      ...serviceData,
      id: uuidv4(),
    };

    set({
      data: {
        ...data,
        hosts: data.hosts.map((host) =>
          host.id === hostId
            ? { ...host, services: [...host.services, newService] }
            : host
        ),
      },
    });
  },

  updateService: (hostId, serviceId, updates) => {
    const { data } = get();
    if (!data) return;

    set({
      data: {
        ...data,
        hosts: data.hosts.map((host) =>
          host.id === hostId
            ? {
                ...host,
                services: host.services.map((service) =>
                  service.id === serviceId ? { ...service, ...updates } : service
                ),
              }
            : host
        ),
      },
    });
  },

  deleteService: (hostId, serviceId) => {
    const { data } = get();
    if (!data) return;

    set({
      data: {
        ...data,
        hosts: data.hosts.map((host) =>
          host.id === hostId
            ? {
                ...host,
                services: host.services.filter((s) => s.id !== serviceId),
              }
            : host
        ),
      },
    });
  },

  addConnection: (sourceHostId, targetHostId) => {
    const { data } = get();
    if (!data) return;

    // Check if connection already exists
    const exists = data.connections.some(
      (conn) =>
        (conn.sourceHostId === sourceHostId && conn.targetHostId === targetHostId) ||
        (conn.sourceHostId === targetHostId && conn.targetHostId === sourceHostId)
    );

    if (exists) return;

    const newConnection: Connection = {
      id: uuidv4(),
      sourceHostId,
      targetHostId,
    };

    set({
      data: {
        ...data,
        connections: [...data.connections, newConnection],
      },
    });
  },

  deleteConnection: (id) => {
    const { data } = get();
    if (!data) return;

    set({
      data: {
        ...data,
        connections: data.connections.filter((conn) => conn.id !== id),
      },
    });
  },

  addLocation: (locationData) => {
    const { data } = get();
    if (!data) return;

    const newLocation: GeographicLocation = {
      ...locationData,
      id: uuidv4(),
    };

    set({
      data: {
        ...data,
        locations: [...data.locations, newLocation],
      },
    });
  },

  toggleDarkMode: () => {
    const { data, saveData } = get();
    if (!data) return;

    const newDarkMode = !data.settings.darkMode;

    set({
      data: {
        ...data,
        settings: {
          ...data.settings,
          darkMode: newDarkMode,
        },
      },
    });

    // Apply to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Auto-save
    saveData();
  },

  saveData: async () => {
    const { data } = get();
    if (!data) return;

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      const data = await response.json();
      set({ data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load' });
    } finally {
      set({ isLoading: false });
    }
  },
}));

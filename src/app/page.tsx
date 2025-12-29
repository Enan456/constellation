'use client';

import { useEffect, useState } from 'react';
import { TopologyCanvas } from '@/components/topology/TopologyCanvas';
import { useInfrastructureStore } from '@/stores/infrastructureStore';
import { Button } from '@/components/ui/Button';
import { AddHostModal } from '@/components/modals/AddHostModal';
import { AddServiceModal } from '@/components/modals/AddServiceModal';
import { EditHostModal } from '@/components/modals/EditHostModal';
import { OllamaTestModal } from '@/components/modals/OllamaTestModal';
import { launchService } from '@/lib/urls';
import type { Host, Service } from '@/types/infrastructure';

export default function Home() {
  const { loadData, isEditMode, toggleEditMode, toggleDarkMode, data, isLoading, error } = useInfrastructureStore();

  const [showAddHost, setShowAddHost] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showEditHost, setShowEditHost] = useState(false);
  const [showOllamaTest, setShowOllamaTest] = useState(false);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply dark mode on initial load
  useEffect(() => {
    if (data?.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data?.settings.darkMode]);

  const handleEditHost = (host: Host) => {
    setSelectedHost(host);
    setShowEditHost(true);
  };

  const handleAddServiceToHost = () => {
    setShowEditHost(false);
    setShowAddService(true);
  };

  const handleServiceClick = (host: Host, service: Service) => {
    if (service.apiEndpoint && service.name.toLowerCase().includes('ollama')) {
      setSelectedHost(host);
      setSelectedService(service);
      setShowOllamaTest(true);
    } else {
      launchService(host, service);
    }
  };

  const isDark = data?.settings.darkMode ?? false;

  // Get hosts by network
  const networkAHosts = data?.hosts.filter(h => h.location.id === 'network-a') || [];
  const networkBHosts = data?.hosts.filter(h => h.location.id === 'network-b') || [];

  if (isLoading && !data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => loadData()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="border-b-2 border-black dark:border-white px-4 py-3 flex justify-between items-center bg-white dark:bg-black">
        <h1 className="text-xl font-bold">Homelab</h1>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="px-2 py-1 text-sm border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            title="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <span className="text-xs text-gray-500 dark:text-gray-400">|</span>

          {isEditMode && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setShowAddHost(true)}>
                + Add Host
              </Button>
              <span className="text-xs text-gray-500 dark:text-gray-400">|</span>
            </>
          )}

          <Button
            size="sm"
            variant={isEditMode ? 'primary' : 'secondary'}
            onClick={toggleEditMode}
          >
            {isEditMode ? 'Done Editing' : 'Edit'}
          </Button>
        </div>
      </header>

      {/* Network Legend */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex gap-6 text-xs bg-white dark:bg-black">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-black dark:bg-white" />
          <span>Same Network</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5"
            style={{
              backgroundImage: isDark
                ? 'repeating-linear-gradient(90deg, white 0, white 4px, transparent 4px, transparent 8px)'
                : 'repeating-linear-gradient(90deg, black 0, black 4px, transparent 4px, transparent 8px)'
            }}
          />
          <span>Cross Network</span>
        </div>
        {isEditMode && (
          <div className="text-gray-500 dark:text-gray-400 ml-auto">
            Click host to edit • Drag to reposition
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Network A */}
        <aside className="w-64 border-r-2 border-black dark:border-white overflow-y-auto bg-white dark:bg-black">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-sm">Network A (Primary)</h2>
          </div>
          {networkAHosts.map((host) => (
            <div key={host.id} className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-bold text-sm">{host.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{host.ip}</p>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {host.services.map((service) => (
                  <li key={service.id}>
                    <button
                      onClick={() => handleServiceClick(host, service)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{service.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">:{service.port}</span>
                      </div>
                    </button>
                  </li>
                ))}
                {host.services.length === 0 && (
                  <li className="px-3 py-2 text-xs text-gray-400">No services</li>
                )}
              </ul>
            </div>
          ))}
        </aside>

        {/* Center - Topology Canvas */}
        <main className="flex-1 relative">
          <TopologyCanvas />

          {/* Host list for editing */}
          {isEditMode && data && (
            <div className="absolute bottom-4 left-4 bg-white dark:bg-black border-2 border-black dark:border-white p-3 max-w-xs max-h-64 overflow-auto">
              <h3 className="font-bold text-sm mb-2">All Hosts</h3>
              <ul className="space-y-1">
                {data.hosts.map((host) => (
                  <li key={host.id}>
                    <button
                      onClick={() => handleEditHost(host)}
                      className="text-sm hover:underline text-left w-full"
                    >
                      {host.name}
                      <span className="text-gray-500 dark:text-gray-400 ml-2">({host.services.length})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>

        {/* Right Sidebar - Network B */}
        <aside className="w-64 border-l-2 border-black dark:border-white overflow-y-auto bg-white dark:bg-black">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-sm">Network B (Secondary)</h2>
          </div>
          {networkBHosts.map((host) => (
            <div key={host.id} className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-bold text-sm">{host.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{host.ip}</p>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {host.services.map((service) => (
                  <li key={service.id}>
                    <button
                      onClick={() => handleServiceClick(host, service)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{service.name}</span>
                        {service.apiEndpoint && (
                          <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-1">API</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">:{service.port}</span>
                    </button>
                  </li>
                ))}
                {host.services.length === 0 && (
                  <li className="px-3 py-2 text-xs text-gray-400">No services</li>
                )}
              </ul>
            </div>
          ))}
        </aside>
      </div>

      {/* Modals */}
      <AddHostModal isOpen={showAddHost} onClose={() => setShowAddHost(false)} />

      <AddServiceModal
        isOpen={showAddService}
        onClose={() => {
          setShowAddService(false);
          if (selectedHost) {
            setShowEditHost(true);
          }
        }}
        hostId={selectedHost?.id || null}
      />

      <EditHostModal
        isOpen={showEditHost}
        onClose={() => {
          setShowEditHost(false);
          setSelectedHost(null);
        }}
        host={selectedHost}
        onAddService={handleAddServiceToHost}
      />

      {selectedHost && selectedService && (
        <OllamaTestModal
          isOpen={showOllamaTest}
          onClose={() => {
            setShowOllamaTest(false);
            setSelectedHost(null);
            setSelectedService(null);
          }}
          host={selectedHost}
          service={selectedService}
        />
      )}
    </div>
  );
}

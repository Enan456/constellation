'use client';

import { useEffect, useState } from 'react';
import { TopologyCanvas } from '@/components/topology/TopologyCanvas';
import { useInfrastructureStore } from '@/stores/infrastructureStore';
import { Button } from '@/components/ui/Button';
import { AddHostModal } from '@/components/modals/AddHostModal';
import { AddServiceModal } from '@/components/modals/AddServiceModal';
import { EditHostModal } from '@/components/modals/EditHostModal';
import type { Host } from '@/types/infrastructure';

export default function Home() {
  const { loadData, isEditMode, toggleEditMode, toggleDarkMode, data, isLoading, error } = useInfrastructureStore();

  const [showAddHost, setShowAddHost] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showEditHost, setShowEditHost] = useState(false);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);

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

  const isDark = data?.settings.darkMode ?? false;

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

      {/* Main Content - Full Width Topology Canvas */}
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
    </div>
  );
}

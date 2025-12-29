'use client';

import { useEffect, useState } from 'react';
import { TopologyCanvas } from '@/components/topology/TopologyCanvas';
import { useInfrastructureStore } from '@/stores/infrastructureStore';
import { Button } from '@/components/ui/Button';
import { AddHostModal } from '@/components/modals/AddHostModal';
import { AddServiceModal } from '@/components/modals/AddServiceModal';
import { EditHostModal } from '@/components/modals/EditHostModal';
import { launchService } from '@/lib/urls';
import type { Host, Service } from '@/types/infrastructure';

export default function Home() {
  const { loadData, isEditMode, toggleEditMode, toggleDarkMode, data, isLoading, error, selectedHostId, setSelectedHostId } = useInfrastructureStore();

  const [showAddHost, setShowAddHost] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showEditHost, setShowEditHost] = useState(false);
  const [selectedHostForEdit, setSelectedHostForEdit] = useState<Host | null>(null);
  const [ollamaPrompt, setOllamaPrompt] = useState('');
  const [ollamaResponse, setOllamaResponse] = useState('');
  const [ollamaLoading, setOllamaLoading] = useState(false);

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
    setSelectedHostForEdit(host);
    setShowEditHost(true);
  };

  const handleAddServiceToHost = () => {
    setShowEditHost(false);
    setShowAddService(true);
  };

  const selectedHost = data?.hosts.find(h => h.id === selectedHostId) || null;
  const isDark = data?.settings.darkMode ?? false;

  // Get projects for the selected host
  const hostProjects = data?.projects.filter(p => selectedHost && p.hostIds.includes(selectedHost.id)) || [];

  const handleServiceClick = (host: Host, service: Service) => {
    if (service.port === 0) return; // No URL for port 0 services
    launchService(host, service);
  };

  const handleOllamaTest = async () => {
    if (!ollamaPrompt.trim() || !selectedHost) return;

    const ollamaService = selectedHost.services.find(s => s.apiEndpoint && s.name.toLowerCase().includes('ollama'));
    if (!ollamaService) return;

    setOllamaLoading(true);
    setOllamaResponse('');

    try {
      const response = await fetch('/api/ollama-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: selectedHost.ip,
          port: ollamaService.port,
          prompt: ollamaPrompt,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setOllamaResponse(`Error: ${data.error}`);
      } else {
        setOllamaResponse(data.response || 'No response');
      }
    } catch (err) {
      setOllamaResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setOllamaLoading(false);
    }
  };

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

  const ollamaService = selectedHost?.services.find(s => s.apiEndpoint && s.name.toLowerCase().includes('ollama'));

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
        {/* Topology Canvas */}
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

        {/* Right Sidebar - Services & Projects */}
        {selectedHost && (
          <aside className="w-80 border-l-2 border-black dark:border-white overflow-y-auto bg-white dark:bg-black flex flex-col">
            {/* Host Header */}
            <div className="p-4 border-b-2 border-black dark:border-white flex justify-between items-start">
              <div>
                <h2 className="font-bold text-lg">{selectedHost.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedHost.ip}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{selectedHost.location.label}</p>
              </div>
              <button
                onClick={() => setSelectedHostId(null)}
                className="text-gray-500 hover:text-black dark:hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Services Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-sm mb-3">Services</h3>
                {selectedHost.services.length === 0 ? (
                  <p className="text-sm text-gray-400">No services</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedHost.services.map((service) => (
                      <li key={service.id}>
                        {service.port > 0 ? (
                          <button
                            onClick={() => handleServiceClick(selectedHost, service)}
                            className="w-full text-left p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{service.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">:{service.port}</span>
                            </div>
                            {service.apiEndpoint && (
                              <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-1 mt-1 inline-block">API</span>
                            )}
                          </button>
                        ) : (
                          <div className="p-2 border border-gray-200 dark:border-gray-700 opacity-60">
                            <span className="font-medium text-sm">{service.name}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Ollama API Tester */}
                {ollamaService && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-xs mb-2">Ollama API Tester</h4>
                    <div className="space-y-2">
                      <textarea
                        value={ollamaPrompt}
                        onChange={(e) => setOllamaPrompt(e.target.value)}
                        placeholder="Enter prompt..."
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-sm resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleOllamaTest}
                        disabled={ollamaLoading || !ollamaPrompt.trim()}
                        className="w-full px-3 py-1 text-sm border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50"
                      >
                        {ollamaLoading ? 'Loading...' : 'Test API'}
                      </button>
                      {ollamaResponse && (
                        <div className="p-2 bg-gray-100 dark:bg-gray-900 text-xs max-h-32 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">{ollamaResponse}</pre>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 font-mono">
                        curl http://{selectedHost.ip}:{ollamaService.port}/api/generate -d &apos;{`{"model":"llama3.2","prompt":"..."}`}&apos;
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Projects / Service Health Section */}
              <div className="p-4">
                <h3 className="font-bold text-sm mb-3">
                  {selectedHost.id === 'flywheel' ? 'Service Health' : 'Projects'}
                </h3>
                {selectedHost.id === 'flywheel' ? (
                  <div className="space-y-2">
                    {selectedHost.services.map((service) => (
                      <div key={service.id} className="p-2 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{service.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Active
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{service.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : hostProjects.length === 0 ? (
                  <p className="text-sm text-gray-400">No projects</p>
                ) : (
                  <ul className="space-y-2">
                    {hostProjects.map((project) => (
                      <li key={project.id}>
                        {project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                          >
                            <span className="font-medium text-sm">{project.name}</span>
                            {project.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
                            )}
                          </a>
                        ) : (
                          <div className="p-2 border border-gray-200 dark:border-gray-700">
                            <span className="font-medium text-sm">{project.name}</span>
                            {project.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Modals */}
      <AddHostModal isOpen={showAddHost} onClose={() => setShowAddHost(false)} />

      <AddServiceModal
        isOpen={showAddService}
        onClose={() => {
          setShowAddService(false);
          if (selectedHostForEdit) {
            setShowEditHost(true);
          }
        }}
        hostId={selectedHostForEdit?.id || null}
      />

      <EditHostModal
        isOpen={showEditHost}
        onClose={() => {
          setShowEditHost(false);
          setSelectedHostForEdit(null);
        }}
        host={selectedHostForEdit}
        onAddService={handleAddServiceToHost}
      />
    </div>
  );
}

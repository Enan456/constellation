'use client';

import { useState } from 'react';
import { Host, Service } from '@/types/infrastructure';
import { generateServiceUrl } from '@/lib/urls';

interface ServicePopoverProps {
  host: Host;
  onClose: () => void;
  openLeft?: boolean;
}

export function ServicePopover({ host, onClose, openLeft = false }: ServicePopoverProps) {
  const [showOllamaTest, setShowOllamaTest] = useState(false);
  const [ollamaService, setOllamaService] = useState<Service | null>(null);

  const handleServiceClick = (service: Service) => {
    // Check if this is Ollama API
    if (service.apiEndpoint && service.name.toLowerCase().includes('ollama')) {
      setOllamaService(service);
      setShowOllamaTest(true);
      return;
    }

    // Open in new tab
    const url = generateServiceUrl(host, service);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Position class based on openLeft prop
  const positionClass = openLeft
    ? 'right-full top-0 mr-2'
    : 'left-full top-0 ml-2';

  if (showOllamaTest && ollamaService) {
    return (
      <OllamaTestPopover
        host={host}
        service={ollamaService}
        onBack={() => setShowOllamaTest(false)}
        onClose={onClose}
        openLeft={openLeft}
      />
    );
  }

  return (
    <div
      className={`absolute ${positionClass} z-50 bg-white dark:bg-black border-2 border-black dark:border-white min-w-[200px]`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="border-b-2 border-black dark:border-white px-3 py-2 flex justify-between items-center">
        <span className="font-bold text-sm text-black dark:text-white">Services</span>
        <button
          onClick={onClose}
          className="text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {host.services.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No services</div>
      ) : (
        <ul>
          {host.services.map((service) => (
            <li key={service.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <button
                onClick={() => handleServiceClick(service)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-black dark:text-white">{service.name}</span>
                  {service.apiEndpoint && (
                    <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-1">API</span>
                  )}
                </div>
                {service.port > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    :{service.port} ({service.protocol})
                  </div>
                )}
                {service.port > 0 && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {generateServiceUrl(host, service)}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Embedded Ollama API Tester
interface OllamaTestPopoverProps {
  host: Host;
  service: Service;
  onBack: () => void;
  onClose: () => void;
  openLeft?: boolean;
}

function OllamaTestPopover({ host, service, onBack, onClose, openLeft = false }: OllamaTestPopoverProps) {
  const [prompt, setPrompt] = useState('Hello, how are you?');
  const [model, setModel] = useState('llama3.2');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = `http://${host.ip}:${service.port}`;

  const curlCommand = `curl ${baseUrl}/api/generate -d '{
  "model": "${model}",
  "prompt": "${prompt.replace(/'/g, "\\'")}",
  "stream": false
}'`;

  const handleTest = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/ollama-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${baseUrl}/api/generate`,
          body: {
            model,
            prompt,
            stream: false,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect to Ollama');
      }

      setResponse(data.response || JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckModels = async () => {
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/ollama-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${baseUrl}/api/tags`,
          method: 'GET',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect to Ollama');
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const positionClass = openLeft
    ? 'right-full top-0 mr-2'
    : 'left-full top-0 ml-2';

  return (
    <div
      className={`absolute ${positionClass} z-50 bg-white dark:bg-black border-2 border-black dark:border-white w-[350px]`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="border-b-2 border-black dark:border-white px-3 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-6 h-6 flex items-center justify-center text-sm"
          >
            ←
          </button>
          <span className="font-bold text-sm text-black dark:text-white">Ollama API</span>
        </div>
        <button
          onClick={onClose}
          className="text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {/* Endpoint */}
        <div className="text-xs bg-gray-100 dark:bg-gray-900 p-2 font-mono text-black dark:text-white">
          {baseUrl}
        </div>

        {/* Model */}
        <div>
          <label className="text-xs font-medium block mb-1 text-black dark:text-white">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-2 py-1 border-2 border-black dark:border-white bg-white dark:bg-black text-xs font-mono text-black dark:text-white"
            placeholder="llama3.2"
          />
        </div>

        {/* Prompt */}
        <div>
          <label className="text-xs font-medium block mb-1 text-black dark:text-white">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-2 py-1 border-2 border-black dark:border-white bg-white dark:bg-black text-xs font-mono min-h-[60px] resize-y text-black dark:text-white"
            placeholder="Enter your prompt..."
          />
        </div>

        {/* Curl */}
        <div>
          <label className="text-xs font-medium block mb-1 text-black dark:text-white">curl</label>
          <pre className="text-[10px] bg-gray-100 dark:bg-gray-900 p-2 overflow-x-auto whitespace-pre-wrap font-mono text-black dark:text-white">
            {curlCommand}
          </pre>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="flex-1 px-2 py-1 text-xs border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
          <button
            onClick={handleCheckModels}
            disabled={isLoading}
            className="flex-1 px-2 py-1 text-xs border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
          >
            Models
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2">
            {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div>
            <label className="text-xs font-medium block mb-1 text-black dark:text-white">Response</label>
            <pre className="text-[10px] bg-gray-100 dark:bg-gray-900 p-2 overflow-x-auto whitespace-pre-wrap font-mono max-h-[150px] overflow-y-auto text-black dark:text-white">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

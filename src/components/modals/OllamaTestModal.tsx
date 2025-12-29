'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Host, Service } from '@/types/infrastructure';

interface OllamaTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: Host;
  service: Service;
}

export function OllamaTestModal({ isOpen, onClose, host, service }: OllamaTestModalProps) {
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

  const curlTagsCommand = `curl ${baseUrl}/api/tags`;

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ollama API Tester">
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-auto">
        {/* Connection Info */}
        <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 font-mono">
          <span className="text-gray-500">Endpoint:</span> {baseUrl}
        </div>

        {/* Model Input */}
        <div>
          <label className="text-sm font-medium block mb-1">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-black text-sm font-mono"
            placeholder="llama3.2"
          />
        </div>

        {/* Prompt Input */}
        <div>
          <label className="text-sm font-medium block mb-1">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-black text-sm font-mono min-h-[80px] resize-y"
            placeholder="Enter your prompt..."
          />
        </div>

        {/* Curl Command Display */}
        <div>
          <label className="text-sm font-medium block mb-1">curl command</label>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 overflow-x-auto whitespace-pre-wrap font-mono border border-gray-300 dark:border-gray-600">
            {curlCommand}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleTest} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Prompt'}
          </Button>
          <Button variant="secondary" onClick={handleCheckModels} disabled={isLoading}>
            List Models
          </Button>
        </div>

        {/* Check Models Curl */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">List models curl:</label>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 overflow-x-auto font-mono">
            {curlTagsCommand}
          </pre>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div>
            <label className="text-sm font-medium block mb-1">Response</label>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 overflow-x-auto whitespace-pre-wrap font-mono border border-gray-300 dark:border-gray-600 max-h-[200px] overflow-y-auto">
              {response}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}

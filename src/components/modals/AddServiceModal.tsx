'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useInfrastructureStore } from '@/stores/infrastructureStore';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostId: string | null;
}

export function AddServiceModal({ isOpen, onClose, hostId }: AddServiceModalProps) {
  const { data, addService, saveData } = useInfrastructureStore();
  const [name, setName] = useState('');
  const [port, setPort] = useState('');
  const [protocol, setProtocol] = useState<'http' | 'https'>('http');
  const [error, setError] = useState('');

  const host = data?.hosts.find((h) => h.id === hostId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hostId) {
      setError('No host selected');
      return;
    }

    if (!name.trim()) {
      setError('Service name is required');
      return;
    }

    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Port must be between 1 and 65535');
      return;
    }

    addService(hostId, {
      name: name.trim(),
      port: portNum,
      protocol,
    });

    await saveData();
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setPort('');
    setProtocol('http');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add Service to ${host?.name || 'Host'}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Service Name"
          id="service-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., CasaOS, n8n, Ollama"
        />

        <Input
          label="Port"
          id="service-port"
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          placeholder="e.g., 80, 8080, 3000"
        />

        <Select
          label="Protocol"
          id="service-protocol"
          value={protocol}
          onChange={(e) => setProtocol(e.target.value as 'http' | 'https')}
          options={[
            { value: 'http', label: 'HTTP' },
            { value: 'https', label: 'HTTPS' },
          ]}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Add Service</Button>
        </div>
      </form>
    </Modal>
  );
}

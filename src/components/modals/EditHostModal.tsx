'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useInfrastructureStore } from '@/stores/infrastructureStore';
import type { Host } from '@/types/infrastructure';

interface EditHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: Host | null;
  onAddService: () => void;
}

export function EditHostModal({ isOpen, onClose, host, onAddService }: EditHostModalProps) {
  const { data, updateHost, deleteHost, deleteService, saveData } = useInfrastructureStore();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [locationId, setLocationId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (host) {
      setName(host.name);
      setIp(host.ip);
      setLocationId(host.location.id);
    }
  }, [host]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!host) return;

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      setError('Invalid IP address');
      return;
    }

    const location = data?.locations.find((l) => l.id === locationId);
    if (!location) {
      setError('Please select a location');
      return;
    }

    updateHost(host.id, {
      name: name.trim(),
      ip: ip.trim(),
      location,
    });

    await saveData();
    onClose();
  };

  const handleDelete = async () => {
    if (!host) return;
    if (confirm(`Delete ${host.name}? This will also remove all connections.`)) {
      deleteHost(host.id);
      await saveData();
      onClose();
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!host) return;
    if (confirm('Delete this service?')) {
      deleteService(host.id, serviceId);
      await saveData();
    }
  };

  const locationOptions = data?.locations.map((l) => ({
    value: l.id,
    label: l.label,
  })) || [];

  if (!host) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${host.name}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Host Name"
          id="edit-host-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="IP Address"
          id="edit-host-ip"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />

        <Select
          label="Network Location"
          id="edit-host-location"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          options={locationOptions}
        />

        {/* Services List */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Services</label>
            <Button type="button" size="sm" variant="secondary" onClick={onAddService}>
              + Add
            </Button>
          </div>
          {host.services.length === 0 ? (
            <p className="text-sm text-gray-500">No services</p>
          ) : (
            <ul className="border-2 border-black divide-y divide-gray-200">
              {host.services.map((service) => (
                <li key={service.id} className="px-3 py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{service.name}</span>
                    <span className="text-xs text-gray-500 ml-2">:{service.port}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 justify-between mt-2">
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete Host
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

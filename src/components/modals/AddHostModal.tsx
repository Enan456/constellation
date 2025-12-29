'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useInfrastructureStore } from '@/stores/infrastructureStore';

interface AddHostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddHostModal({ isOpen, onClose }: AddHostModalProps) {
  const { data, addHost, saveData } = useInfrastructureStore();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [locationId, setLocationId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    addHost({
      name: name.trim(),
      ip: ip.trim(),
      location,
      position: { x: 200, y: 200 },
      services: [],
    });

    await saveData();
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setIp('');
    setLocationId('');
    setError('');
    onClose();
  };

  const locationOptions = data?.locations.map((l) => ({
    value: l.id,
    label: l.label,
  })) || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Host">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Host Name"
          id="host-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Server"
        />

        <Input
          label="IP Address"
          id="host-ip"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="e.g., 100.x.x.x"
        />

        <Select
          label="Network Location"
          id="host-location"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          options={[{ value: '', label: 'Select a location...' }, ...locationOptions]}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Add Host</Button>
        </div>
      </form>
    </Modal>
  );
}

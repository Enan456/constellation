'use client';

import { useState, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Host } from '@/types/infrastructure';
import { ServicePopover } from './ServicePopover';

interface DeviceNodeData {
  host: Host;
  isEditMode: boolean;
}

function DeviceNodeComponent({ data, selected }: NodeProps<DeviceNodeData>) {
  const { host, isEditMode } = data;
  const [showServices, setShowServices] = useState(false);

  const handleClick = () => {
    if (!isEditMode) {
      setShowServices(!showServices);
    }
  };

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-black dark:!bg-white !w-2 !h-2 !border-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-black dark:!bg-white !w-2 !h-2 !border-0"
      />

      <div
        onClick={handleClick}
        className={`
          bg-white dark:bg-black border-2 border-black dark:border-white px-4 py-3 min-w-[140px]
          ${selected ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' : ''}
          ${isEditMode ? 'cursor-move' : 'cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'}
          transition-shadow
        `}
      >
        <h3 className="font-bold text-sm leading-tight text-black dark:text-white">{host.name}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{host.ip}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {host.services.length} service{host.services.length !== 1 ? 's' : ''}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-black dark:!bg-white !w-2 !h-2 !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-black dark:!bg-white !w-2 !h-2 !border-0"
      />

      {showServices && (
        <ServicePopover host={host} onClose={() => setShowServices(false)} />
      )}
    </div>
  );
}

export const DeviceNode = memo(DeviceNodeComponent);

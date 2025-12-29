'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Host } from '@/types/infrastructure';
import { useInfrastructureStore } from '@/stores/infrastructureStore';

interface DeviceNodeData {
  host: Host;
  isEditMode: boolean;
}

function DeviceNodeComponent({ data, selected }: NodeProps<DeviceNodeData>) {
  const { host, isEditMode } = data;
  const { setSelectedHostId, selectedHostId } = useInfrastructureStore();

  const isSelected = selectedHostId === host.id;

  const handleClick = () => {
    if (!isEditMode) {
      setSelectedHostId(isSelected ? null : host.id);
    }
  };

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !w-0 !h-0 !border-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !w-0 !h-0 !border-0"
      />

      <div
        onClick={handleClick}
        className={`
          bg-white dark:bg-black border-2 border-black dark:border-white px-4 py-3 min-w-[140px]
          ${isEditMode ? 'cursor-move' : 'cursor-pointer'}
          ${selected || isSelected ? 'border-4' : ''}
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
        className="!bg-transparent !w-0 !h-0 !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-transparent !w-0 !h-0 !border-0"
      />
    </div>
  );
}

export const DeviceNode = memo(DeviceNodeComponent);

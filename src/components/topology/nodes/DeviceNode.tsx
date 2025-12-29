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
  const { setSelectedHostId, selectedHostId, data: infrastructureData } = useInfrastructureStore();

  const isSelected = selectedHostId === host.id;

  // Count projects for this host
  const projectCount = infrastructureData?.projects.filter(p => p.hostIds.includes(host.id)).length || 0;

  const handleClick = () => {
    if (!isEditMode) {
      setSelectedHostId(isSelected ? null : host.id);
    }
  };

  const handleDoubleClick = () => {
    if (isEditMode) return;

    // Check if host has a port 80 service (CasaOS)
    const port80Service = host.services.find(s => s.port === 80);
    if (port80Service) {
      window.open(`http://${host.ip}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative">
      {/* Top handles */}
      <Handle type="target" position={Position.Top} id="top-target" className="!bg-transparent !w-0 !h-0 !border-0" />
      <Handle type="source" position={Position.Top} id="top-source" className="!bg-transparent !w-0 !h-0 !border-0" />

      {/* Bottom handles */}
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!bg-transparent !w-0 !h-0 !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!bg-transparent !w-0 !h-0 !border-0" />

      {/* Left handles */}
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-transparent !w-0 !h-0 !border-0" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-transparent !w-0 !h-0 !border-0" />

      {/* Right handles */}
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-transparent !w-0 !h-0 !border-0" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-transparent !w-0 !h-0 !border-0" />

      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
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
          {projectCount > 0 && ` · ${projectCount} project${projectCount !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
}

export const DeviceNode = memo(DeviceNodeComponent);

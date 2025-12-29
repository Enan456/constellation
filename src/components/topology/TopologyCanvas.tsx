'use client';

import { useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeChange,
  applyNodeChanges,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useInfrastructureStore } from '@/stores/infrastructureStore';
import { DeviceNode } from './nodes/DeviceNode';
import { SolidEdge } from './edges/SolidEdge';
import { DashedEdge } from './edges/DashedEdge';
import type { Host, Connection } from '@/types/infrastructure';

const nodeTypes = {
  device: DeviceNode,
};

const edgeTypes = {
  solid: SolidEdge,
  dashed: DashedEdge,
};

function getEdgeType(
  connection: Connection,
  hosts: Host[]
): 'solid' | 'dashed' {
  const sourceHost = hosts.find((h) => h.id === connection.sourceHostId);
  const targetHost = hosts.find((h) => h.id === connection.targetHostId);

  if (!sourceHost || !targetHost) return 'solid';

  // Same network = solid, different network = dashed
  return sourceHost.location.id === targetHost.location.id ? 'solid' : 'dashed';
}

function TopologyCanvasInner() {
  const { data, isEditMode, updateHostPosition, saveData, selectedHostId } = useInfrastructureStore();
  const { fitView } = useReactFlow();
  const prevSelectedHostId = useRef<string | null>(null);
  const isDark = data?.settings.darkMode ?? false;

  const initialNodes: Node[] = useMemo(() => {
    if (!data) return [];

    return data.hosts.map((host) => ({
      id: host.id,
      type: 'device',
      position: host.position,
      data: { host, isEditMode },
      draggable: isEditMode,
    }));
  }, [data, isEditMode]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!data) return [];

    return data.connections.map((connection) => ({
      id: connection.id,
      source: connection.sourceHostId,
      target: connection.targetHostId,
      type: getEdgeType(connection, data.hosts),
      label: connection.label,
    }));
  }, [data]);

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Update nodes when data or edit mode changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Recenter graph when sidebar opens/closes
  useEffect(() => {
    const sidebarOpened = prevSelectedHostId.current === null && selectedHostId !== null;
    const sidebarClosed = prevSelectedHostId.current !== null && selectedHostId === null;

    if (sidebarOpened || sidebarClosed) {
      // Small delay to allow DOM to update
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 200 });
      }, 50);
    }

    prevSelectedHostId.current = selectedHostId;
  }, [selectedHostId, fitView]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // If in edit mode and a node was dragged, update the position
      if (isEditMode) {
        changes.forEach((change) => {
          if (change.type === 'position' && change.position && change.dragging === false) {
            updateHostPosition(change.id, change.position.x, change.position.y);
            // Auto-save after drag ends
            saveData();
          }
        });
      }
    },
    [isEditMode, updateHostPosition, saveData, setNodes]
  );

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
        nodesDraggable={isEditMode}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
        {!isDark && <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e5e5" />}
      </ReactFlow>
    </div>
  );
}

export function TopologyCanvas() {
  return (
    <ReactFlowProvider>
      <TopologyCanvasInner />
    </ReactFlowProvider>
  );
}

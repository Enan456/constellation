'use client';

import { BaseEdge, EdgeProps, getStraightPath } from 'reactflow';

export function DashedEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, id } = props;

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: 'var(--foreground)',
        strokeWidth: 2,
        strokeDasharray: '8,4',
      }}
    />
  );
}

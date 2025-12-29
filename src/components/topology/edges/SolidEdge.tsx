'use client';

import { BaseEdge, EdgeProps, getStraightPath } from 'reactflow';

export function SolidEdge(props: EdgeProps) {
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
        stroke: '#000000',
        strokeWidth: 2,
      }}
    />
  );
}

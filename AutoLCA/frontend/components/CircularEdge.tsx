import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export default function CircularEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) {
  
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  // Use explicit deterministic data logic instead of brittle screen coordinates
  const isCircular = data?.isFeedbackLoop === true;

  let edgePath = "";

  if (isCircular) {
    // Generate a massive curved bounding path underneath the nodes for cyclic loops
    // Scale the amplitude of the bezier curve based on distance to avoid "trombone effect"
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.max(100, distance * 0.3);
    
    const controlX1 = sourceX + (offset * 0.5);
    const controlY1 = sourceY + offset;
    const controlX2 = targetX - (offset * 0.5);
    const controlY2 = targetY + offset;
    edgePath = `M ${sourceX},${sourceY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${targetX},${targetY}`;
  } else {
    // Standard standard bezier curve via react flow native utils
    const [path] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    edgePath = path;
  }

  // Use base edge to inherit all React Flow dynamic coordinate bounding natively
  return (
    <>
      <BaseEdge 
         path={edgePath} 
         markerEnd={markerEnd} 
         style={{
             ...style, 
             strokeWidth: 3,
             stroke: isCircular ? '#eab308' : '#3b82f6',
             strokeDasharray: isCircular ? '6 6' : 'none',
             animation: isCircular ? 'dash 1s linear infinite' : 'none'
         }} 
       />
       {/* CSS for animating dash */}
       <style>
         {`
           @keyframes dash {
             to {
               stroke-dashoffset: -12;
             }
           }
         `}
       </style>
    </>
  );
}

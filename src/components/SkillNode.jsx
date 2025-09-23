import React from 'react';
import { Handle, Position } from '@xyflow/react';

function SkillNode({ data, isConnectable }) {
  const { name, description, cost, completed, onKeyDown } = data;
  const locked = !completed && description;

  return (
    <div
      className={`skill-node ${completed ? 'completed' : locked ? 'locked' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Skill: ${name}, ${completed ? 'completed' : locked ? 'locked' : 'available'}`}
      aria-describedby={`desc-${name}`}
      onKeyDown={onKeyDown}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="node-header">{name}</div>
      <div className="node-desc" id={`desc-${name}`}>
        {description}
      </div>
      {cost && <div className="node-cost">Cost: {cost}</div>}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default SkillNode;

import React from 'react';
import { Handle, Position } from '@xyflow/react';

function SkillNode({ data, isConnectable }) {
    const { name, description, cost, completed } = data;
    const locked = !completed && description;

    return (
        <div className={`skill-node ${completed ? 'completed' : locked ? 'locked' : ''}`}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div className="node-header">{name}</div>
            <div className="node-desc">{description}</div>
            {cost && <div className="node-cost">Cost: {cost}</div>}
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        </div>
    );
}

export default SkillNode;
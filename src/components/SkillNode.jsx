// SkillNode.js
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import '../App.css';

function SkillNode({ data, isConnectable }) {
  const { name, description, cost, completed, onKeyDown } = data;

  return (
    <div
      className={`skill-node ${data.completed ? 'completed' : 'locked'}`}
      tabIndex={0}
      onKeyDown={data.onKeyDown}
    >
      {/* Top Handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <div className="skill-node-header">
        <span className="skill-title">{name}</span>
        {data.completed ? (
          <StarIcon
            sx={{
              color: 'green',
              fontSize: 24,
              filter: 'drop-shadow(0 0 8px hsl(green / 0.6))',
            }}
          />
        ) : (
          <LockIcon style={{ color: 'grey', fontSize: 20 }} />
        )}
      </div>

      {description && <div className="skill-description">{description}</div>}

      {data.extraInfo && <div className="skill-extra">{data.extraInfo}</div>}

      {/* Bottom Handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default SkillNode;

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import '../App.css';

function SkillNode({ data, isConnectable }) {
  const { name, description, cost, completed } = data;

  return (
    <div
      className={`skill-node ${completed ? 'completed' : 'locked'}`}
      tabIndex={0}
      role="button"
      aria-pressed={completed}
      aria-label={`${name} skill, ${completed ? 'completed' : 'locked'}`}
      onKeyDown={data.onKeyDown}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        aria-hidden="true"
      />

      <div className="skill-node-header">
        <span className="skill-title">{name}</span>
        {completed && (
          <StarIcon
            sx={{
              color: 'green',
              fontSize: 24,
              filter: 'drop-shadow(0 0 8px hsl(green / 0.6))',
            }}
            titleAccess="Completed skill"
          />
        )}
      </div>

      {description && <div className="skill-description">{description}</div>}

      {cost > 0 && (
        <div className="skill-extra" aria-label={`Cost: ${cost}`}>
          {cost}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        aria-hidden="true"
      />
    </div>
  );
}

export default SkillNode;

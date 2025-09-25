import React from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import SkillNode from './SkillNode';
import { SKILL_CONSTANTS } from '../../Constant';

const nodeTypes = { [SKILL_CONSTANTS.NODE_TYPE]: SkillNode };

const SkillTree = ({
  filteredNodes,
  highlightedEdges,
  handleNodesChange,
  handleEdgesChange,
  handleConnect,
  handleNodeToggle,
}) => {
  return (
    <div
      className="react-flow-container"
      role="region"
      aria-label="Skill tree diagram"
    >
      <ReactFlow
        nodes={filteredNodes}
        edges={highlightedEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeToggle}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background
          color="#00bcd4"
          style={{ background: 'rgba(0, 0, 0, 0.1)' }}
        />
        <Controls />
        <MiniMap aria-label="Mini map of skill tree" />
      </ReactFlow>
    </div>
  );
};

export default SkillTree;

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';
import SkillForm from './components/SkillForm';
import SkillNode from './components/SkillNode';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';
import { SKILL_CONSTANTS } from '../Constant';

const nodeTypes = { skill: SkillNode };
const initialNodes = [];
const initialEdges = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    useLocalStorage(SKILL_CONSTANTS.SKILL_TREE_NODES, initialNodes)[0]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    useLocalStorage(SKILL_CONSTANTS.SKILL_TREE_EDGES, initialEdges)[0]
  );
  const [, setStoredNodes] = useLocalStorage(
    SKILL_CONSTANTS.SKILL_TREE_NODES,
    initialNodes
  );
  const [, setStoredEdges] = useLocalStorage(
    SKILL_CONSTANTS.SKILL_TREE_EDGES,
    initialEdges
  );

  const [rfInstance, setRfInstance] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const addSkillButtonRef = useRef(null);
  const autoLayoutButtonRef = useRef(null);

  useEffect(() => {
    setStoredNodes(nodes);
    console.log('Nodes updated:', nodes);
  }, [nodes, setStoredNodes]);

  useEffect(() => {
    setStoredEdges(edges);
    console.log('Edges updated:', edges);
  }, [edges, setStoredEdges]);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  const onAddNode = useCallback(
    (newNode) => {
      const id = Date.now().toString();
      const node = {
        id,
        type: SKILL_CONSTANTS.NODE_TYPE,
        data: { ...newNode, completed: false },
        position: { x: 100, y: 100 },
      };
      setNodes((nds) => {
        const newNodes = nds.concat(node);
        console.log('New node added:', node, 'Total nodes:', newNodes);
        return newNodes;
      });
      setShowForm(false);
      addSkillButtonRef.current.focus(); // Return focus to Add Skill button
    },
    [setNodes]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      if (node.data.completed) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, completed: false } }
              : n
          )
        );
        toast.success('Skill locked.', { id: 'node-status' });
        return;
      }

      const prereqIds = edges
        .filter((e) => e.target === node.id)
        .map((e) => e.source);
      const allPrereqsComplete = prereqIds.every((id) => {
        const prereqNode = nodes.find((n) => n.id === id);
        return prereqNode?.data.completed;
      });

      if (!allPrereqsComplete) {
        toast.error('Cannot unlock: Complete prerequisites first!', {
          id: 'node-error',
        });
        return;
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, completed: true } } : n
        )
      );
      toast.success('Skill unlocked!', { id: 'node-status' });
    },
    [edges, nodes, setNodes]
  );

  const onNodeKeyDown = useCallback(
    (event, node) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onNodeClick(event, node);
      }
    },
    [onNodeClick]
  );

  const onLayout = useCallback(() => {
    console.log('Auto Layout triggered');
    // Placeholder for auto-layout logic
    toast.success('Auto layout applied.', { id: 'layout-status' });
  }, []);

  const handleAddSkillKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setShowForm(true);
    }
  };

  const handleAutoLayoutKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onLayout();
    }
  };

  return (
    <div className="app" role="application" aria-label="Skill Tree Application">
      <ReactFlowProvider>
        <div
          className="controls"
          role="toolbar"
          aria-label="Skill tree controls"
        >
          <button
            ref={addSkillButtonRef}
            onClick={() => setShowForm(true)}
            onKeyDown={handleAddSkillKeyDown}
            aria-label="Add a new skill"
          >
            Add Skill
          </button>
          <button
            ref={autoLayoutButtonRef}
            onClick={onLayout}
            onKeyDown={handleAutoLayoutKeyDown}
            aria-label="Apply auto layout to skill tree"
          >
            Auto Layout
          </button>
        </div>
        <div
          className="react-flow-container"
          role="region"
          aria-label="Skill tree diagram"
        >
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                onKeyDown: (event) => onNodeKeyDown(event, node),
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setRfInstance}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap aria-label="Mini map of skill tree" />
          </ReactFlow>
        </div>
        {showForm && (
          <SkillForm
            onSubmit={onAddNode}
            onCancel={() => {
              setShowForm(false);
              addSkillButtonRef.current.focus();
            }}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
}

export default App;

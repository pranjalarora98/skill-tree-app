import React, { useCallback, useEffect, useState } from 'react';
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

const nodeTypes = { skill: SkillNode };
const initialNodes = [];
const initialEdges = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    useLocalStorage('skillTreeNodes', initialNodes)[0]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    useLocalStorage('skillTreeEdges', initialEdges)[0]
  );
  const [, setStoredNodes] = useLocalStorage('skillTreeNodes', initialNodes);
  const [, setStoredEdges] = useLocalStorage('skillTreeEdges', initialEdges);
  const [rfInstance, setRfInstance] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Persist on change
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
        type: 'skill',
        data: { ...newNode, completed: false },
        position: { x: 100, y: 100 },
      };
      setNodes((nds) => {
        const newNodes = nds.concat(node);
        console.log('New node added:', node, 'Total nodes:', newNodes);
        return newNodes;
      });
      setShowForm(false);
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
        toast.error('Cannot unlock: Complete prerequisites first!');
        return;
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, completed: true } } : n
        )
      );
      toast.success('Skill unlocked!');
    },
    [edges, nodes, setNodes]
  );

  const onLayout = useCallback(() => {
    // Placeholder for layout logic
    console.log('Auto Layout triggered');
  }, []);

  return (
    <div className="app">
      <ReactFlowProvider>
        <div className="controls">
          <button onClick={() => setShowForm(true)}>Add Skill</button>
          <button onClick={onLayout}>Auto Layout</button>
        </div>
        <div className="react-flow-container">
          <ReactFlow
            nodes={nodes} // Use raw nodes instead of layoutedNodes
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
            <MiniMap />
          </ReactFlow>
        </div>
        {showForm && (
          <SkillForm onSubmit={onAddNode} onCancel={() => setShowForm(false)} />
        )}
      </ReactFlowProvider>
    </div>
  );
}

export default App;

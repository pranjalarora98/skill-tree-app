import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  applyNodeChanges,
  applyEdgeChanges,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SkillForm from './components/SkillForm';
import { hasCycle } from './utils/detectCycle';
import SkillNode from './components/SkillNode';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';
import { SKILL_CONSTANTS } from '../Constant';

const nodeTypes = { skill: SkillNode };
const initialNodes = [];
const initialEdges = [];

function App() {
  const [storedNodes, setStoredNodes] = useLocalStorage(
    SKILL_CONSTANTS.SKILL_TREE_NODES,
    initialNodes
  );

  const [storedEdges, setStoredEdges] = useLocalStorage(
    SKILL_CONSTANTS.SKILL_TREE_EDGES,
    initialEdges
  );

  const [nodes, setNodes] = useNodesState(storedNodes);
  const [edges, setEdges] = useEdgesState(storedEdges);

  const [showForm, setShowForm] = useState(false);

  const addSkillButtonRef = useRef(null);

  const handleNodesChange = useCallback(
    (changedNodes) => {
      setNodes((previousNodeList) => {
        const updatedNodeList = applyNodeChanges(
          changedNodes,
          previousNodeList
        );
        setStoredNodes(updatedNodeList);
        return updatedNodeList;
      });
    },
    [setNodes, setStoredNodes]
  );

  const handleEdgesChange = useCallback(
    (changedEdges) => {
      setEdges((previousEdgesList) => {
        const updatedEdges = applyEdgeChanges(changedEdges, previousEdgesList);
        setStoredEdges(updatedEdges);
        return updatedEdges;
      });
    },
    [setEdges, setStoredEdges]
  );

  const onConnect = useCallback(
    (params) => {
      const candidateEdges = addEdge(
        {
          ...params,
          markerEnd: {
            type: 'arrowclosed',
            width: 30,
            height: 30,
            color: '#00bcd4',
          },
        },
        edges
      );

      const graph = { nodes, edges: candidateEdges };

      if (hasCycle(graph)) {
        toast.error('Adding this connection would create a cycle!', {
          id: 'cycle-error',
        });
        return;
      }

      setEdges(candidateEdges);
      setStoredEdges(candidateEdges);
    },
    [edges, nodes, setEdges, setStoredEdges]
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
        return newNodes;
      });
      setShowForm(false);
      addSkillButtonRef.current.focus();
    },
    [setNodes]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      if (node.data.completed) {
        setNodes((nds) => {
          const updated = nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, completed: false } }
              : n
          );

          const lockDependents = (id, nodesToUpdate) => {
            const dependents = edges
              .filter((e) => e.source === id)
              .map((e) => e.target);

            for (const depId of dependents) {
              nodesToUpdate = nodesToUpdate.map((n) =>
                n.id === depId
                  ? { ...n, data: { ...n.data, completed: false } }
                  : n
              );
              nodesToUpdate = lockDependents(depId, nodesToUpdate);
            }

            return nodesToUpdate;
          };

          return lockDependents(node.id, updated);
        });

        toast.success('Skill locked (and dependents).', { id: 'node-status' });
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

  const handleAddSkillKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setShowForm(true);
    }
  };

  const handleReset = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setStoredNodes(initialNodes);
    setStoredEdges(initialEdges);
    toast.success('Skill tree reset successfully!', { id: 'reset-success' });
  };

  return (
    <div className="app" role="application" aria-label="Skill Tree Application">
      <ReactFlowProvider>
        <div className="header">
          <h1 className="welcome-text">Welcome to SkillBuilder</h1>
        </div>
        <div
          className="controls"
          role="toolbar"
          aria-label="Skill tree controls"
        >
          <Button
            ref={addSkillButtonRef}
            variant="contained"
            onClick={() => setShowForm(true)}
            onKeyDown={handleAddSkillKeyDown}
            startIcon={<AddIcon />}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: '8px',
              padding: '10px 24px',
              color: 'white',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              transition:
                'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00B8D4 90%)',
                boxShadow: '0 5px 8px 3px rgba(33, 203, 243, .4)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Add Skill
          </Button>
          <Button
            variant="contained"
            onClick={handleReset}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: '8px',
              padding: '10px 24px',
              marginLeft: '16px',
              color: 'white',
              background: 'linear-gradient(45deg, #e63946 30%, #f77f00 90%)',
              boxShadow: '0 3px 5px 2px rgba(230, 57, 70, .3)',
              transition:
                'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                background: 'linear-gradient(45deg, #d62828 30%, #e57300 90%)',
                boxShadow: '0 5px 8px 3px rgba(230, 57, 70, .4)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Reset
          </Button>
        </div>
        <div
          className="react-flow-container"
          role="region"
          aria-label="Skill tree diagram"
        >
          <ReactFlow
            nodes={nodes.map((node) => {
              const isUnlockable =
                !node.data.completed &&
                edges
                  .filter((e) => e.target === node.id)
                  .every(
                    (e) => nodes.find((n) => n.id === e.source)?.data.completed
                  );

              return {
                ...node,
                className: isUnlockable ? 'unlockable' : '',
                data: {
                  ...node.data,
                  onKeyDown: (event) => onNodeKeyDown(event, node),
                },
              };
            })}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
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
        <Dialog
          open={showForm}
          onClose={() => setShowForm(false)}
          maxWidth="md"
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: 'none',
              borderRadius: '12px',
              boxShadow: 'none',
              padding: '20px',
              background: 'none',
              width: 600,
            },
          }}
        >
          {/* <DialogTitle
            style={{
              color: '#2196F3',
              fontSize: '1.5em',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Add a New Skill
          </DialogTitle> */}
          <DialogContent>
            <SkillForm
              onSubmit={(data) => {
                onAddNode(data);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </ReactFlowProvider>
    </div>
  );
}

export default App;

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
  TextField,
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
  const [searchTerm, setSearchTerm] = useState('');
  const addSkillButtonRef = useRef(null);

  useEffect(() => {
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.animationDuration = `${Math.random() * 3 + 3}s`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      document.querySelector('.app').appendChild(particle);
    }
  }, []);

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
            width: 20,
            height: 20,
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
    setSearchTerm('');
    toast.success('Skill tree reset successfully!', { id: 'reset-success' });
  };

  const findAllPrerequisites = useCallback(
    (nodeId, pathSet = new Set()) => {
      const prereqs = edges
        .filter((e) => e.target === nodeId)
        .map((e) => e.source);

      for (const prereqId of prereqs) {
        if (!pathSet.has(prereqId)) {
          pathSet.add(prereqId);
          findAllPrerequisites(prereqId, pathSet);
        }
      }
      return pathSet;
    },
    [edges]
  );

  const highlightedNodes = nodes.map((node) => {
    const searchTermLower = searchTerm.toLowerCase();
    const nodeNameLower = node.data.name?.toLowerCase();

    const isDirectMatch =
      nodeNameLower?.includes(searchTermLower) && searchTermLower.length > 0;

    let isPathHighlight = false;
    if (!isDirectMatch && searchTermLower.length > 0) {
      const directMatchNodes = nodes.filter((n) =>
        n.data.name?.toLowerCase().includes(searchTermLower)
      );

      for (const matchNode of directMatchNodes) {
        const pathSet = findAllPrerequisites(matchNode.id);
        if (pathSet.has(node.id)) {
          isPathHighlight = true;
          break;
        }
      }
    }

    const baseClass =
      node.className
        ?.replace('direct-match', '')
        .replace('path-highlight', '')
        .trim() || '';

    let customClass = baseClass;
    if (isDirectMatch) {
      customClass += ' direct-match';
    } else if (isPathHighlight) {
      customClass += ' path-highlight';
    }

    return {
      ...node,
      className: customClass.trim(),
      data: {
        ...node.data,
        onKeyDown: (event) => onNodeKeyDown(event, node),
      },
    };
  });

  const highlightedEdges = edges.map((edge) => {
    const isNodeHighlighted = (id) => {
      const node = highlightedNodes.find((n) => n.id === id);
      return (
        node?.className?.includes('direct-match') ||
        node?.className?.includes('path-highlight')
      );
    };

    const isPathEdge =
      isNodeHighlighted(edge.source) && isNodeHighlighted(edge.target);

    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: isPathEdge ? '#ffeb3b' : '#00bcd4',
        strokeWidth: isPathEdge ? 3 : 2,
      },
    };
  });

  return (
    <div className="app" role="application" aria-label="Skill Tree Application">
      <ReactFlowProvider>
        <div className="header-container">
          <h1 className="welcome-text">Welcome to SkillBuilder</h1>
          <div className="search-controls">
            <TextField
              variant="outlined"
              placeholder="Search by skill name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                style: {
                  color: '#fff',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  width: '200px',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#00bcd4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00e5ff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00e5ff',
                  },
                },
              }}
            />
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
                padding: '8px 16px',
                color: 'white',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 2px 4px 1px rgba(33, 203, 243, .3)',
                marginLeft: '10px',
                transition:
                  'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #1976D2 30%, #00B8D4 90%)',
                  boxShadow: '0 4px 6px 2px rgba(33, 203, 243, .4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Add New Skill
            </Button>
            <Button
              variant="contained"
              onClick={handleReset}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                borderRadius: '8px',
                padding: '8px 16px',
                marginLeft: '10px',
                color: 'white',
                background: 'linear-gradient(45deg, #e63946 30%, #f77f00 90%)',
                boxShadow: '0 2px 4px 1px rgba(230, 57, 70, .3)',
                transition:
                  'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #d62828 30%, #e57300 90%)',
                  boxShadow: '0 4px 6px 2px rgba(230, 57, 70, .4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        <div
          className="react-flow-container"
          role="region"
          aria-label="Skill tree diagram"
        >
          <ReactFlow
            nodes={highlightedNodes}
            edges={highlightedEdges}
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
        {showForm && (
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
                width: 500,
                background: 'none',
              },
            }}
          >
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
        )}
      </ReactFlowProvider>
    </div>
  );
}

export default App;

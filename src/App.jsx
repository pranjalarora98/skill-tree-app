import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
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
import { Button, Dialog, DialogContent, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import SkillForm from './components/SkillForm';
import { hasCycle } from './utils/detectCycle';
import { applySearchHighlighting } from './utils/searchUtil';
import SkillNode from './components/SkillNode';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';
import { SKILL_CONSTANTS } from '../Constant';

const nodeTypes = { [SKILL_CONSTANTS.NODE_TYPE]: SkillNode };
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

  const isSearchVisible = nodes && nodes.length > 0;

  useEffect(() => {
    const particleCount = 15;
    const appElement = document.querySelector('.app');
    if (!appElement) return;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.animationDuration = `${Math.random() * 3 + 3}s`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      appElement.appendChild(particle);
    }
  }, []);

  const handleNodesChange = useCallback(
    (changedNodes) => {
      setNodes((previousNodeList) => {
        const updatedNodes = applyNodeChanges(changedNodes, previousNodeList);
        setStoredNodes(updatedNodes);
        return updatedNodes;
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

  const handleConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color: '#00bcd4',
        },
      };
      const candidateEdges = addEdge(newEdge, edges);

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

  const handleAddNode = useCallback(
    (newNodeData) => {
      const id = Date.now().toString();
      const newNode = {
        id,
        type: SKILL_CONSTANTS.NODE_TYPE,
        data: { ...newNodeData, completed: false },
        position: { x: 100, y: 100 },
      };
      setNodes((currentNodes) => currentNodes.concat(newNode));
      setShowForm(false);

      if (addSkillButtonRef.current) {
        addSkillButtonRef.current.focus();
      }
    },
    [setNodes]
  );

  const handleNodeToggle = useCallback(
    (event, node) => {
      if (node.data.completed) {
        setNodes((currentNodes) => {
          const toggleNode = (id, nodesToUpdate) => {
            nodesToUpdate = nodesToUpdate.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, completed: false } } : n
            );

            const dependents = edges
              .filter((e) => e.source === id)
              .map((e) => e.target);

            for (const depId of dependents) {
              // Recursively lock dependents
              nodesToUpdate = toggleNode(depId, nodesToUpdate);
            }
            return nodesToUpdate;
          };

          return toggleNode(node.id, currentNodes);
        });
        toast.success('Skill locked (and dependents).', { id: 'node-status' });
        return;
      }

      const prerequisiteIds = edges
        .filter((e) => e.target === node.id)
        .map((e) => e.source);

      const allPrerequisitesComplete = prerequisiteIds.every((id) => {
        const prereqNode = nodes.find((n) => n.id === id);
        return prereqNode?.data.completed;
      });

      if (!allPrerequisitesComplete) {
        toast.error('Cannot unlock: Complete prerequisites first!', {
          id: 'node-error',
        });
        return;
      }

      setNodes((currentNodes) =>
        currentNodes.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, completed: true } } : n
        )
      );
      toast.success('Skill unlocked!', { id: 'node-status' });
    },
    [edges, nodes, setNodes]
  );

  const handleNodeKeyDown = useCallback(
    (event, node) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNodeToggle(event, node);
      }
    },
    [handleNodeToggle]
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

  const { highlightedNodes, highlightedEdges } = useMemo(() => {
    return applySearchHighlighting(nodes, edges, searchTerm);
  }, [nodes, edges, searchTerm]);

  const nodesWithAccessibility = highlightedNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onKeyDown: (event) => handleNodeKeyDown(event, node),
    },
  }));

  return (
    <div className="app" role="application" aria-label="Skill Tree Application">
      <ThemeProvider theme={theme}>
        <ReactFlowProvider>
          <div className="header-container">
            <h1 className="welcome-text">Welcome to SkillBuilder</h1>
            <div className="search-controls">
              {isSearchVisible && (
                <TextField
                  className="search-field"
                  variant="outlined"
                  placeholder="Search by skill name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              )}
              <Button
                ref={addSkillButtonRef}
                variant="contained"
                onClick={() => setShowForm(true)}
                onKeyDown={handleAddSkillKeyDown}
                startIcon={<AddIcon />}
                sx={{
                  ...theme.components.MuiButton.styleOverrides.root,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  background:
                    'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
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
                  ...theme.components.MuiButton.styleOverrides.root,
                  background:
                    'linear-gradient(45deg, #e63946 30%, #f77f00 90%)',
                  boxShadow: '0 2px 4px 1px rgba(230, 57, 70, .3)',
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
              nodes={nodesWithAccessibility}
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
          {showForm && (
            <Dialog
              open={showForm}
              onClose={() => setShowForm(false)}
              maxWidth="md"
              sx={{
                '& .MuiDialog-paper': {
                  padding: '20px',
                  width: 500,
                },
              }}
            >
              <DialogContent>
                <SkillForm
                  onSubmit={handleAddNode}
                  onCancel={() => setShowForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </ReactFlowProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;

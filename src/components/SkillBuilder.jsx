import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '@mui/material';
import useDebounce from '../hooks/useDebounce';
import SkillForm from './SkillForm';
import { hasCycle } from '../utils/detectCycle';
import { applySearchHighlighting } from '../utils/searchUtil';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SKILL_CONSTANTS } from '../../Constant';
import Header from './Header';
import SkillTree from './SkillTree';

const initialNodes = [];
const initialEdges = [];

function SkillBuilder() {
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
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
      const totalAddedEdges = addEdge(newEdge, edges);

      const graph = { nodes, edges: totalAddedEdges };

      if (hasCycle(graph)) {
        toast.error('Adding this connection would create a cycle!', {
          id: SKILL_CONSTANTS.CYCLE_ERROR,
        });
        return;
      }

      setEdges(totalAddedEdges);
      setStoredEdges(totalAddedEdges);
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
            nodesToUpdate = nodesToUpdate.map((currNode) =>
              currNode.id === id
                ? { ...currNode, data: { ...currNode.data, completed: false } }
                : currNode
            );

            const dependents = edges
              .filter((e) => e.source === id)
              .map((e) => e.target);

            for (const depId of dependents) {
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
        currentNodes.map((currNode) =>
          currNode.id === node.id
            ? { ...currNode, data: { ...currNode.data, completed: true } }
            : currNode
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
    return applySearchHighlighting(nodes, edges, debouncedSearchTerm);
  }, [nodes, edges, debouncedSearchTerm]);

  const filteredNodes = highlightedNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onKeyDown: (event) => handleNodeKeyDown(event, node),
    },
  }));

  return (
    <ReactFlowProvider>
      <Header
        isSearchVisible={isSearchVisible}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        addSkillButtonRef={addSkillButtonRef}
        handleAddSkillKeyDown={handleAddSkillKeyDown}
        setShowForm={setShowForm}
        handleReset={handleReset}
      />
      <SkillTree
        filteredNodes={filteredNodes}
        highlightedEdges={highlightedEdges}
        handleNodesChange={handleNodesChange}
        handleEdgesChange={handleEdgesChange}
        handleConnect={handleConnect}
        handleNodeToggle={handleNodeToggle}
      />
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
  );
}

export default SkillBuilder;

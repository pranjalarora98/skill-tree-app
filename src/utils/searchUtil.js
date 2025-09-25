import { SKILL_CONSTANTS } from '../../Constant';

// Will Recursively find all prerequisite nodes any node.
export const findAllPrerequisites = (nodeId, edges, pathSet = new Set()) => {

  // Get all nodes that are direct prerequisites.
  const prereqs = edges.filter((e) => e.target === nodeId).map((e) => e.source);

  for (const prereqId of prereqs) {

    // If not  visited before, add to path and recurse again.

    if (!pathSet.has(prereqId)) {
      pathSet.add(prereqId);
      findAllPrerequisites(prereqId, edges, pathSet);
    }
  }
  return pathSet;
};

export const applySearchHighlighting = (nodes, edges, searchTerm) => {
  const searchTermLower = searchTerm.toLowerCase().trim();

  //If search term is not there, clean the highlighted styles.

  if (!searchTermLower) {
    const cleanedNodes = nodes.map((node) => {
      const baseClass =
        node.className
          ?.replace(SKILL_CONSTANTS.NODE_CLASS_DIRECT_MATCH, '')
          .replace(SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT, '')
          .trim() || '';
      return { ...node, className: baseClass };
    });

    const defaultEdges = edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: '#00bcd4',
        strokeWidth: 2,
      },
    }));

    return { highlightedNodes: cleanedNodes, highlightedEdges: defaultEdges };
  }

  //Filter out highlighted nodes
  const nodesWithHighlightInfo = nodes.map((node) => {
    const nodeNameLower = node.data.name?.toLowerCase();
    const isDirectMatch = nodeNameLower?.includes(searchTermLower);

    return {
      ...node,
      isDirectMatch,
      isPathHighlight: false,
    };
  });

  const directMatchNodes = nodesWithHighlightInfo.filter(
    (n) => n.isDirectMatch
  );

  for (const node of nodesWithHighlightInfo) {
    if (!node.isDirectMatch) {
      for (const matchNode of directMatchNodes) {
        const pathSet = findAllPrerequisites(matchNode.id, edges);

        if (pathSet.has(node.id)) {
          node.isPathHighlight = true;
          break;
        }
      }
    }
  }

  //Add highlighted classes to nodes that are being filtered
  const highlightedNodes = nodesWithHighlightInfo.map((node) => {
    const baseClass =
      node.className
        ?.replace(SKILL_CONSTANTS.NODE_CLASS_DIRECT_MATCH, '')
        .replace(SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT, '')
        .trim() || '';

    let customClass = baseClass;

    if (node.isDirectMatch) {
      customClass += ` ${SKILL_CONSTANTS.NODE_CLASS_DIRECT_MATCH}`;
    } else if (node.isPathHighlight) {
      customClass += ` ${SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT}`;
    }

    return {
      ...node,
      className: customClass.trim(),
    };
  });

  // Style edges based on whether they connect highlighted nodes
  const highlightedEdges = edges.map((edge) => {
    const isNodeInPath = (id) => {
      const node = highlightedNodes.find((n) => n.id === id);
      return (
        node?.className?.includes(SKILL_CONSTANTS.NODE_CLASS_DIRECT_MATCH) ||
        node?.className?.includes(SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT)
      );
    };

    const isPathEdge = isNodeInPath(edge.source) && isNodeInPath(edge.target);

    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: isPathEdge ? '#ffeb3b' : '#00bcd4',
        strokeWidth: isPathEdge ? 3 : 2,
      },
    };
  });

  return { highlightedNodes, highlightedEdges };
};

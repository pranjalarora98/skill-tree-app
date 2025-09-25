export function hasCycle({ nodes, edges }) {
  const visitedNodes = new Set();
  const stack = new Set();

  function dfs(nodeId) {
    visitedNodes.add(nodeId); // tracks all visited nodes
    stack.add(nodeId);

    const children = edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => edge.target);

    for (const child of children) {
      if (!visitedNodes.has(child)) {
        if (dfs(child)) return true;
      } else if (stack.has(child)) {
        return true;
      }
    }

    stack.delete(nodeId); // remove from recursion stack after exploring
    return false;
  }

  for (const node of nodes) {
    if (!visitedNodes.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false; // If no cycle found return
}

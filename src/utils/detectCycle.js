export function detectCycle(graph) {
    const visited = new Set();
    const recStack = new Set();

    function dfs(nodeId) {
        visited.add(nodeId);
        recStack.add(nodeId);

        const neighbors = graph.edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor)) return true;
            } else if (recStack.has(neighbor)) {
                return true; // Back edge
            }
        }

        recStack.delete(nodeId);
        return false;
    }

    for (const node of graph.nodes) {
        if (!visited.has(node.id)) {
            if (dfs(node.id)) return true;
        }
    }

    return false;
}
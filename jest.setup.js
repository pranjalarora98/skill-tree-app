import '@testing-library/jest-dom';
import { jest } from '@jest/globals';


jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));


Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


jest.mock('@xyflow/react', async () => {

  const React = await import('react');
  return {
    __esModule: true,
    ReactFlow: ({ children }) =>
      React.createElement('div', { 'data-testid': 'react-flow' }, children),
    ReactFlowProvider: ({ children }) =>
      React.createElement('div', null, children),
    addEdge: (params, edges) => [
      ...edges,
      { ...params, id: `edge-${Date.now()}` },
    ],
    useNodesState: (initial) => [initial || [], () => { }, () => { }],
    useEdgesState: (initial) => [initial || [], () => { }, () => { }],
    Background: () => React.createElement('div', null),
    Controls: () => React.createElement('div', null),
    MiniMap: () => React.createElement('div', null),
    Handle: ({ type, position }) =>
      React.createElement('div', {
        'data-testid': `handle-${type}-${position}`,
      }),
    Position: { Top: 'Top', Bottom: 'Bottom' },
  };
});

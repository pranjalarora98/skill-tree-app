// jest.setup.js
import '@testing-library/jest-dom';

// --------------------
// Mock react-hot-toast
// --------------------
import { jest } from '@jest/globals';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
}

globalThis.ResizeObserver = ResizeObserver;


// --------------------
// Mock @xyflow/react
// --------------------
jest.unstable_mockModule('@xyflow/react', async () => {
  const React = await import('react');
  return {
    __esModule: true,
    ReactFlow: ({ children }) => React.createElement('div', { 'data-testid': 'react-flow' }, children),
    ReactFlowProvider: ({ children }) => React.createElement('div', null, children),
    Handle: () => React.createElement('div', null),
    Position: { Top: 'Top', Bottom: 'Bottom' },
    useNodesState: (initial) => [initial || [], jest.fn(), jest.fn()],
    useEdgesState: (initial) => [initial || [], jest.fn(), jest.fn()],
    addEdge: (params, edges) => [...edges, { ...params, id: `edge-${Date.now()}` }],
    Background: () => React.createElement('div', null),
    Controls: () => React.createElement('div', null),
    MiniMap: () => React.createElement('div', null),
  };
});


// --------------------
// Mock window.matchMedia (for MUI)
// --------------------
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

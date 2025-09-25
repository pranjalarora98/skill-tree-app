
import React from 'react';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, jest, expect, describe, beforeAll } from '@jest/globals';
import App from '../App';
import toast from 'react-hot-toast';

jest.mock('@xyflow/react', () => {
    const React = jest.requireActual('react');
    const Position = {
        Top: 'top',
        Bottom: 'bottom',
        Left: 'left',
        Right: 'right',
    };
    const Handle = () => null;

    return {
        __esModule: true,
        Position,
        Handle,
        ReactFlowProvider: ({ children }) => <>{children}</>,
        ReactFlow: (props) => {
            const {
                nodes = [],
                edges = [],
                onNodeClick,
                onConnect,
                onNodesChange,
                onEdgesChange,
                nodeTypes = {},
            } = props;

            if (typeof globalThis !== 'undefined') {
                globalThis.__rf_nodes = nodes;
                globalThis.__rf_edges = edges;
                globalThis.__rf_onConnect = onConnect;
                globalThis.__rf_onNodesChange = onNodesChange;
                globalThis.__rf_onEdgesChange = onEdgesChange;
            }

            return (
                <div data-testid="reactflow-mock">
                    {nodes.map((node) => {
                        const NodeComp =
                            nodeTypes[node.type] || (({ data }) => <div>{data?.name}</div>);
                        return (
                            <div
                                key={node.id}
                                data-testid={`node-${node.id}`}
                                className={node.data?.completed ? 'completed' : 'locked'}
                                tabIndex={0}
                                onClick={(e) => onNodeClick && onNodeClick(e, node)}
                                onKeyDown={(e) =>
                                    node?.data?.onKeyDown && node.data.onKeyDown(e)
                                }
                            >
                                <NodeComp data={node.data} isConnectable={false} />
                            </div>
                        );
                    })}
                    {props.children}
                </div>
            );
        },
        Background: () => null,
        Controls: () => null,
        MiniMap: () => null,
        useNodesState: (initial) => {
            const [s, set] = React.useState(initial);
            return [s, set, () => { }];
        },
        useEdgesState: (initial) => {
            const [s, set] = React.useState(initial);
            return [s, set, () => { }];
        },
        addEdge: (edge, edges) => edges.concat(edge),
        applyNodeChanges: (_changes, nodes) => nodes,
        applyEdgeChanges: (_changes, edges) => edges,
    };
});

jest.mock('react-hot-toast', () => {
    const mock = { success: jest.fn(), error: jest.fn() };
    return { __esModule: true, default: mock, ...mock };
});

jest.mock('../hooks/useDebounce', () => ({
    __esModule: true,
    default: (value) => value,
}));

import * as searchUtil from '../utils/searchUtil';
import { SKILL_CONSTANTS } from '../../Constant';

describe('App.jsx extra coverage', () => {
    beforeAll(() => {
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { });
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    });

    test('shows search field once a node exists and calls applySearchHighlighting', async () => {
        const spy = jest.spyOn(searchUtil, 'applySearchHighlighting');
        const user = userEvent.setup();
        render(<App />);


        expect(screen.queryByPlaceholderText(/Search by skill name/i)).toBeNull();


        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'NodeA');
        await user.type(screen.getByLabelText(/Description/i), 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const search = await screen.findByPlaceholderText(/Search by skill name/i);
        await user.type(search, 'Node');

        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    test('Clear button resets nodes/edges, hides search, and toasts success', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'TestName1');
        await user.type(screen.getByLabelText(/Description/i), 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        const nameInput = await screen.findByLabelText(/Skill Name/i);
        const descInput = await screen.findByLabelText(/Description/i);
        await user.clear(nameInput);
        await user.clear(descInput);
        await user.type(nameInput, 'TestName2');
        await user.type(descInput, 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        expect(screen.getByText('TestName1')).toBeInTheDocument();
        expect(screen.getByText('TestName2')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /clear/i }));

        expect(screen.queryByText('TestName1')).toBeNull();
        expect(screen.queryByText('TestName2')).toBeNull();
        expect(screen.queryByPlaceholderText(/Search by skill name/i)).toBeNull();
        expect(toast.success).toHaveBeenCalled();
    });

    test('prevents cycles when connecting nodes (cycle error toast path)', async () => {
        const user = userEvent.setup();
        render(<App />);


        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'A');
        await user.type(screen.getByLabelText(/Description/i), 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));


        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        const input = await screen.findByLabelText(/Skill Name/i);
        const descInput = await screen.findByLabelText(/Description/i);
        await user.clear(input);
        await user.clear(descInput);
        await user.type(input, 'B');
        await user.type(descInput, 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const firstNodeId = window.__rf_nodes.find((n) => n.data.name === 'A').id;
        const secondNodeId = window.__rf_nodes.find((n) => n.data.name === 'B').id;

        await act(async () => {
            window.__rf_onConnect &&
                window.__rf_onConnect({ source: firstNodeId, target: secondNodeId });
        });

        await act(async () => {
            window.__rf_onConnect &&
                window.__rf_onConnect({ source: secondNodeId, target: firstNodeId });
        });

        expect(toast.error).toHaveBeenCalledWith(
            expect.stringMatching(/cycle/i),
            expect.any(Object)
        );
    });

    test('locking a completed prerequisite re-locks all dependents recursively', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'JS');
        await user.type(screen.getByLabelText(/Description/i), 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        const input = await screen.findByLabelText(/Skill Name/i);
        const descInput = await screen.findByLabelText(/Description/i);
        await user.clear(input);
        await user.clear(descInput);
        await user.type(input, 'React');
        await user.type(descInput, 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const jsId = window.__rf_nodes.find((n) => n.data.name === 'JS').id;
        const reactId = window.__rf_nodes.find((n) => n.data.name === 'React').id;
        await act(async () => {
            window.__rf_onConnect &&
                window.__rf_onConnect({ source: jsId, target: reactId });
        });

        const jsEl = screen.getAllByText('JS').pop();
        const reactEl = screen.getAllByText('React').pop();

        await user.click(jsEl);
        expect(jsEl.closest('.completed')).not.toBeNull();
        await user.click(reactEl);
        expect(reactEl.closest('.completed')).not.toBeNull();


        await user.click(jsEl);
        expect(jsEl.closest('.completed')).toBeNull();
        expect(reactEl.closest('.completed')).toBeNull();

        expect(toast.success).toHaveBeenCalledWith(
            expect.stringMatching(/locked/i),
            expect.any(Object)
        );
    });
    test('keyboard: Space opens form and Enter/Space toggles node', async () => {
        const user = userEvent.setup();
        render(<App />);

        const addBtn = screen.getByRole('button', { name: /add new skill/i });
        await act(async () => {
            addBtn.focus();
        });
        await user.keyboard(' ');
        const dialog = await screen.findByRole('dialog');
        const nameInput = within(dialog).getByLabelText(/Skill Name/i);
        const descInput = within(dialog).getByLabelText(/Description/i);
        await user.type(nameInput, 'KbdNode');
        await user.type(descInput, 'Description');
        await user.click(
            within(dialog).getByRole('button', { name: /add skill/i })
        );

        let nodeEl = await screen.findByText('KbdNode');
        nodeEl.focus();


        await user.keyboard(' ');
        expect(toast.success).toHaveBeenCalledWith(
            expect.stringMatching(/unlocked/i),
            expect.any(Object)
        );


        await user.keyboard('{Enter}');
        expect(toast.success).toHaveBeenCalledWith(
            expect.stringMatching(/locked/i),
            expect.any(Object)
        );
    });


    test('Add New Skill button responds to keyboard (handleAddSkillKeyDown)', async () => {
        const user = userEvent.setup();
        render(<App />);
        const addBtn = screen.getByRole('button', { name: /add new skill/i });
        await act(async () => {
            addBtn.focus();
        });
        await user.keyboard('{Enter}');
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    test('shows error toast when unlocking node without prerequisites', async () => {
        const user = userEvent.setup();
        render(<App />);


        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'JS');
        await user.type(screen.getByLabelText(/Description/i), 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));


        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        const input = await screen.findByLabelText(/Skill Name/i);
        const descInput = await screen.findByLabelText(/Description/i);
        await user.clear(input);
        await user.clear(descInput);
        await user.type(input, 'React');
        await user.type(descInput, 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const jsId = window.__rf_nodes.find((n) => n.data.name === 'JS').id;
        const reactId = window.__rf_nodes.find((n) => n.data.name === 'React').id;
        await act(async () => {
            window.__rf_onConnect &&
                window.__rf_onConnect({ source: jsId, target: reactId });
        });

        const reactEl = screen.getAllByText('React').pop();
        await user.click(reactEl);

        expect(toast.error).toHaveBeenCalledWith(
            expect.stringMatching(/prerequisites/i),
            expect.any(Object)
        );
    });

    test('Cancel inside SkillForm closes the dialog', async () => {
        const user = userEvent.setup();
        render(<App />);
        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        const dialog = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('handleNodesChange and handleEdgesChange update state and storage', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'NodeToChange');
        await user.type(screen.getByLabelText(/Description/i), 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const node = window.__rf_nodes.find((n) => n.data.name === 'NodeToChange');

        await act(async () => {
            window.__rf_onNodesChange &&
                window.__rf_onNodesChange([
                    { id: node.id, type: 'position', position: { x: 200, y: 200 } },
                ]);
        });

        await act(async () => {
            window.__rf_onEdgesChange &&
                window.__rf_onEdgesChange([
                    { id: 'some-edge-id', type: 'select', selected: true },
                ]);
        });

        expect(localStorage.setItem).toHaveBeenCalledWith(
            SKILL_CONSTANTS.SKILL_TREE_NODES,
            expect.any(String)
        );
        expect(localStorage.setItem).toHaveBeenCalledWith(
            SKILL_CONSTANTS.SKILL_TREE_EDGES,
            expect.any(String)
        );
    });

    test('toggling a node updates UI and shows toast', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'Storable Node');
        await user.type(screen.getByLabelText(/Description/i), 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const nodeEl = await screen.findByText('Storable Node');


        await user.click(nodeEl);

        expect(nodeEl.closest('.completed')).not.toBeNull();
        expect(toast.success).toHaveBeenCalledWith(
            expect.stringMatching(/unlocked/i),
            expect.any(Object)
        );

        await user.click(nodeEl);
        expect(nodeEl.closest('.completed')).toBeNull();
        expect(toast.success).toHaveBeenCalledWith(
            expect.stringMatching(/locked/i),
            expect.any(Object)
        );
    });




    test('after adding a skill the Add New Skill button regains focus', async () => {
        const user = userEvent.setup();
        render(<App />);

        const addBtn = screen.getByRole('button', { name: /add new skill/i });
        await act(async () => {
            addBtn.focus();
        });

        await user.click(addBtn);
        const dialog = await screen.findByRole('dialog');
        const nameInput = within(dialog).getByLabelText(/Skill Name/i);
        const descInput = within(dialog).getByLabelText(/Description/i);

        await user.type(nameInput, 'FocusNode');
        await user.type(descInput, 'Description');

        await user.click(within(dialog).getByRole('button', { name: /add skill/i }));

        expect(document.activeElement).toBe(addBtn);
    });

    test('locking a root prerequisite re-locks multiple dependent levels (deep recursion)', async () => {
        const user = userEvent.setup();
        render(<App />);


        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'A');
        await user.type(screen.getByLabelText(/Description/i), 'Description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));


        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        let input = await screen.findByLabelText(/Skill Name/i);
        let descInput = await screen.findByLabelText(/Description/i);

        await user.clear(input);
        await user.clear(descInput);

        await user.type(input, 'B');
        await user.type(descInput, 'Test description');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        await user.click(screen.getByRole('button', { name: /add new skill/i }));

        input = await screen.findByLabelText(/Skill Name/i);
        descInput = await screen.findByLabelText(/Description/i);

        await user.clear(input);
        await user.clear(descInput);

        await user.type(input, 'C');
        await user.type(descInput, 'Description test');

        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const firstNodeId = window.__rf_nodes.find((n) => n.data.name === 'A').id;
        const secondNodeId = window.__rf_nodes.find((n) => n.data.name === 'B').id;
        const cId = window.__rf_nodes.find((n) => n.data.name === 'C').id;

        await act(async () => {
            window.__rf_onConnect &&
                window.__rf_onConnect({ source: firstNodeId, target: secondNodeId });
        });
        await act(async () => {
            window.__rf_onConnect &&
                window.__rf_onConnect({ source: secondNodeId, target: cId });
        });

        const aEl = screen.getAllByText('A').pop();
        const bEl = screen.getAllByText('B').pop();
        const cEl = screen.getAllByText('C').pop();

        await user.click(aEl);
        expect(aEl.closest('.completed')).not.toBeNull();

        await user.click(bEl);
        expect(bEl.closest('.completed')).not.toBeNull();

        await user.click(cEl);
        expect(cEl.closest('.completed')).not.toBeNull();

        await user.click(aEl);
        expect(aEl.closest('.completed')).toBeNull();
        expect(bEl.closest('.completed')).toBeNull();
        expect(cEl.closest('.completed')).toBeNull();

        expect(toast.success).toHaveBeenCalledWith(
            expect.stringMatching(/locked/i),
            expect.any(Object)
        );
    });
});


test('successful connect stores edges in localStorage', async () => {
    const user = userEvent.setup();

    localStorage.setItem.mockClear();

    render(<App />);


    await user.click(screen.getByRole('button', { name: /add new skill/i }));
    await user.type(screen.getByLabelText(/Skill Name/i), 'SkillName10');
    await user.type(screen.getByLabelText(/Description/i), 'Description');
    await user.click(screen.getByRole('button', { name: /add skill/i }));


    await user.click(screen.getByRole('button', { name: /add new skill/i }));
    const input = await screen.findByLabelText(/Skill Name/i);
    const descInput = await screen.findByLabelText(/Description/i);

    await user.clear(input);
    await user.clear(descInput);

    await user.type(input, 'SkillName3');
    await user.type(descInput, 'Test description');

    await user.click(screen.getByRole('button', { name: /add skill/i }));

    const firstNodeId = window.__rf_nodes.find((n) => n.data.name === 'SkillName10').id;
    const secondNodeId = window.__rf_nodes.find((n) => n.data.name === 'SkillName3').id;

    await act(async () => {
        window.__rf_onConnect &&
            window.__rf_onConnect({ source: firstNodeId, target: secondNodeId });
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
        SKILL_CONSTANTS.SKILL_TREE_EDGES,
        expect.any(String)
    );
});

test('non-Enter/Space key on node does not toggle and does not toast', async () => {
    const user = userEvent.setup();
    toast.success.mockClear();
    toast.error.mockClear();

    render(<App />);


    await user.click(screen.getByRole('button', { name: /add new skill/i }));
    await user.type(screen.getByLabelText(/Skill Name/i), 'NoToggle');
    await user.type(screen.getByLabelText(/Description/i), 'Description');
    await user.click(screen.getByRole('button', { name: /add skill/i }));

    const nodeEl = await screen.findByText('NoToggle');
    nodeEl.focus();

    await user.keyboard('a');

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
});

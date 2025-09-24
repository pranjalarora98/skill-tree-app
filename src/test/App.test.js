import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { jest, describe, test, expect } from '@jest/globals';
import toast from 'react-hot-toast';

// const successFn = jest.fn();
// const errorFn = jest.fn();

// jest.mock('react-hot-toast', () => ({
//     success: successFn,
//     error: errorFn,
// }));



describe('Skill Tree App', () => {
    test('adds new skills and displays them', async () => {
        const user = userEvent.setup();
        render(<App />);

        // Add Skill 1
        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'JS');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        expect(screen.getByText('JS')).toBeInTheDocument();

        // Add Skill 2
        await user.click(screen.getByRole('button', { name: /add new skill/i }));

        const input = await screen.findByLabelText(/Skill Name/i);
        await user.clear(input);

        await user.type(input, 'React');

        await user.click(screen.getByRole('button', { name: /add skill/i }));

        expect(await screen.findByText('React')).toBeInTheDocument();
    });

    test('cannot unlock dependent skill before prerequisite', async () => {
        const user = userEvent.setup();
        render(<App />);

        // Add prerequisite
        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'JS');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        // Add dependent
        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'React');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const reactNode = screen.getByText('React').closest('div');

        // focus / click the node to trigger the unlock logic
        await user.click(reactNode);
        await user.keyboard('{Enter}');

        expect(toast.error).toHaveBeenCalled();
        expect(reactNode).toHaveClass('locked');
    });

    test('unlocks prerequisite first then dependent', async () => {
        const user = userEvent.setup();
        render(<App />);

        // Add JS
        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'JS');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        // Add React
        await user.click(screen.getByRole('button', { name: /add new skill/i }));
        await user.type(screen.getByLabelText(/Skill Name/i), 'React');
        await user.click(screen.getByRole('button', { name: /add skill/i }));

        const jsNodes = screen.getAllByText('JS');
        const jsNode = jsNodes[jsNodes.length - 1].closest('div');

        const reactNodes = screen.getAllByText('React');
        const reactNode = reactNodes[reactNodes.length - 1].closest('div');

        // Unlock JS
        await user.keyboard('{Enter}'); // Assuming JS is first focused
        expect(jsNode).toHaveClass('completed');

        // Unlock React now
        await user.keyboard('{Enter}');
        expect(reactNode).toHaveClass('completed');
        expect(toast.success).toHaveBeenCalled();
    });

    test('prevents cycles in skill dependencies', async () => {
        const { hasCycle } = await import('../utils/detectCycle');

        const nodes = [{ id: '1' }, { id: '2' }];
        const edges = [{ source: '1', target: '2' }];
        const newEdges = [...edges, { source: '2', target: '1' }];

        expect(hasCycle({ nodes, edges: newEdges })).toBe(true);
    });
});

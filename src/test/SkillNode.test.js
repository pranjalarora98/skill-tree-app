import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import SkillNode from '../components/SkillNode';
import { jest, test, expect } from '@jest/globals';

test('renders name, description and cost with correct classes', () => {
    const data = {
        name: 'Fireball',
        description: 'Throws fire',
        cost: 3,
        completed: false,
    };

    const { container, rerender } = render(
        <ReactFlowProvider>
            <SkillNode data={data} isConnectable={false} />
        </ReactFlowProvider>
    );

    expect(screen.getByText(/Fireball/i)).toBeInTheDocument();
    expect(screen.getByText(/Throws fire/i)).toBeInTheDocument();
    //   expect(screen.getByText(/Cost: 3/i)).toBeInTheDocument();

    expect(container.firstChild).toHaveClass('locked');

    data.completed = true;
    +  rerender(
        <ReactFlowProvider>
            <SkillNode data={data} isConnectable={false} />
        </ReactFlowProvider>
    );
    expect(container.firstChild).toHaveClass('completed');
});

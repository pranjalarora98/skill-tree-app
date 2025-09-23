import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkillForm from '../components/SkillForm';
import { jest, test, expect } from '@jest/globals';

test('submits trimmed values and resets form', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();

    render(<SkillForm onSubmit={handleSubmit} onCancel={handleCancel} />);

    await user.type(screen.getByPlaceholderText(/Skill Name/i), '  Swordsmanship  ');
    await user.type(screen.getByPlaceholderText(/Description/i), '  Slice things  ');
    await user.type(screen.getByPlaceholderText(/Cost\/Level/i), '5');

    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Swordsmanship',
        description: 'Slice things',
        cost: '5'
    });

    expect(screen.getByPlaceholderText(/Skill Name/i).value).toBe('');
    expect(screen.getByPlaceholderText(/Description/i).value).toBe('');
    expect(screen.getByPlaceholderText(/Cost\/Level/i).value).toBe('');
});

test('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();

    render(<SkillForm onSubmit={handleSubmit} onCancel={handleCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
});

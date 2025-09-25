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

  await user.type(
    screen.getByPlaceholderText(/Skill Name/i),
    '  Swordsmanship  '
  );
  await user.type(
    screen.getByPlaceholderText(/Description/i),
    '  Slice things  '
  );
  await user.type(screen.getByLabelText(/Cost \/ Level/i), '5');

  await user.click(screen.getByRole('button', { name: /add/i }));

  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'Swordsmanship',
    description: 'Slice things',
    cost: 5,
  });

  expect(screen.getByPlaceholderText(/Skill Name/i).value).toBe('');
  expect(screen.getByPlaceholderText(/Description/i).value).toBe('');
  expect(screen.getByLabelText(/Cost \/ Level/i).value).toBe('');
});

test('calls onCancel when cancel clicked', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();
  const handleCancel = jest.fn();

  render(<SkillForm onSubmit={handleSubmit} onCancel={handleCancel} />);
  await user.click(screen.getByRole('button', { name: /cancel/i }));
  expect(handleCancel).toHaveBeenCalledTimes(1);
});

test('shows validation error and focuses name input when submitting empty name', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();
  const handleCancel = jest.fn();

  render(<SkillForm onSubmit={handleSubmit} onCancel={handleCancel} />);

  const addBtn = screen.getByRole('button', { name: /add skill/i });

  const form = addBtn.closest('form');
  if (form) form.noValidate = true;

  await user.click(addBtn);

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent(/Skill name is required/i);
  expect(handleSubmit).not.toHaveBeenCalled();

  const nameInput = screen.getByLabelText(/Skill Name/i);
  expect(document.activeElement).toBe(nameInput);
});

test('pressing Escape calls onCancel (handleKeyDown)', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();
  const handleCancel = jest.fn();

  render(<SkillForm onSubmit={handleSubmit} onCancel={handleCancel} />);

  const nameInput = screen.getByLabelText(/Skill Name/i);
  nameInput.focus();

  await user.keyboard('{Escape}');

  expect(handleCancel).toHaveBeenCalledTimes(1);
});

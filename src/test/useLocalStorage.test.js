import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { test, expect } from '@jest/globals';

function TestComp() {
  const [val, setVal] = useLocalStorage('test-key', 'init');
  return (
    <div>
      <div data-testid="value">{String(val)}</div>
      <button onClick={() => setVal('updated')}>update</button>
    </div>
  );
}

test('loads initial from localStorage', () => {
  window.localStorage.setItem('test-key', JSON.stringify('stored'));
  render(<TestComp />);
  expect(screen.getByTestId('value').textContent).toBe('stored');
});

test('updates localStorage when setVal is called', async () => {
  const user = userEvent.setup();
  render(<TestComp />);
  await user.click(screen.getByRole('button', { name: /update/i }));
  expect(JSON.parse(window.localStorage.getItem('test-key'))).toBe('updated');
});

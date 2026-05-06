import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActionButton } from './ActionButton';
import React from 'react';

describe('ActionButton', () => {
  it('renders with label', () => {
    render(<ActionButton label="Click Me" onClick={() => {}} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('handles click and shows loading state', async () => {
    const onClick = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<ActionButton label="Click Me" loadingLabel="Loading..." onClick={onClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows error state on failure', async () => {
    const onClick = vi.fn().mockRejectedValue(new Error('Failed'));
    render(<ActionButton label="Click Me" errorLabel="Error!" onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(await screen.findByText('Error!', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('is disabled when requested', () => {
    render(<ActionButton label="Click Me" disabled={true} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

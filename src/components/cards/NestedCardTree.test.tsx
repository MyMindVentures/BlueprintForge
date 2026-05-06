import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NestedCardTree } from './NestedCardTree';
import { CardNode } from '../../types';
import React from 'react';

const mockNodes: CardNode[] = [
  {
    id: '1',
    code: 'SEC-01',
    title: 'Root Section',
    description: 'Root description',
    type: 'section',
    children: [
      {
        id: '2',
        code: 'SCR-01',
        title: 'Child Screen',
        description: 'Child description',
        type: 'screen',
        children: []
      }
    ]
  }
];

describe('NestedCardTree', () => {
  it('renders nodes correctly', () => {
    render(<NestedCardTree nodes={mockNodes} />);
    expect(screen.getByText('Root Section')).toBeInTheDocument();
    expect(screen.getByText('SEC-01')).toBeInTheDocument();
    expect(screen.getByText('Child Screen')).toBeInTheDocument();
  });

  it('toggles expansion', async () => {
    render(<NestedCardTree nodes={mockNodes} />);
    const rootNode = screen.getByText('Root Section').closest('div[id]');
    // By default it starts expanded in my implementation, check NestedCardTree.tsx: `const [isExpanded, setIsExpanded] = useState(true);`
    expect(screen.getByText('Child Screen')).toBeInTheDocument();
    
    // Clicking the root card should collapse it
    fireEvent.click(screen.getByText('Root Section'));

    await waitFor(() => {
      expect(screen.queryByText('Child Screen')).not.toBeInTheDocument();
    });
  });
});

/**
 * chartsLegends utility tests
 *
 * Validates CustomTick SVG component renders correctly.
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { CustomTick } from '../../utils/chartsLegends';

describe('CustomTick', () => {
  it('returns null when payload is missing', () => {
    const { container } = render(
      <svg>
        <CustomTick x={0} y={0} />
      </svg>
    );
    expect(container.querySelector('g')).toBeNull();
  });

  it('returns null when payload.value is empty', () => {
    const { container } = render(
      <svg>
        <CustomTick x={0} y={0} payload={{}} />
      </svg>
    );
    expect(container.querySelector('g')).toBeNull();
  });

  it('renders text element with payload value', () => {
    const { container } = render(
      <svg>
        <CustomTick x={10} y={20} payload={{ value: 'Jan' }} />
      </svg>
    );
    const text = container.querySelector('text');
    expect(text).toBeTruthy();
    expect(text.textContent).toBe('Jan');
  });

  it('applies textAnchor prop', () => {
    const { container } = render(
      <svg>
        <CustomTick x={0} y={0} payload={{ value: 'Feb' }} textAnchor="end" />
      </svg>
    );
    const text = container.querySelector('text');
    expect(text.getAttribute('text-anchor')).toBe('end');
  });

  it('applies fill color', () => {
    const { container } = render(
      <svg>
        <CustomTick x={0} y={0} payload={{ value: 'Mar' }} fill="#ff0000" />
      </svg>
    );
    const text = container.querySelector('text');
    expect(text.getAttribute('fill')).toBe('#ff0000');
  });

  it('applies rotation angle', () => {
    const { container } = render(
      <svg>
        <CustomTick x={0} y={0} payload={{ value: 'Apr' }} angle={-45} />
      </svg>
    );
    const g = container.querySelector('g');
    const text = g.querySelector('text');
    expect(text.getAttribute('transform')).toBe('rotate(-45)');
  });

  it('defaults fontSize to 12 when not specified', () => {
    const { container } = render(
      <svg>
        <CustomTick x={0} y={0} payload={{ value: 'May' }} />
      </svg>
    );
    const text = container.querySelector('text');
    expect(text.getAttribute('font-size')).toBe('12');
  });

  it('applies custom fontSize', () => {
    const { container } = render(
      <svg>
        <CustomTick x={0} y={0} payload={{ value: 'Jun' }} fontSize={16} />
      </svg>
    );
    const text = container.querySelector('text');
    expect(text.getAttribute('font-size')).toBe('16');
  });

  it('applies dx and dy offsets', () => {
    const { container } = render(
      <svg>
        <CustomTick x={10} y={20} payload={{ value: 'Jul' }} dx={5} dy={3} />
      </svg>
    );
    const g = container.querySelector('g');
    expect(g.getAttribute('transform')).toBe('translate(15, 23)');
  });
});

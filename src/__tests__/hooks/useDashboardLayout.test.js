/**
 * useDashboardLayout Hook Tests
 *
 * Validates:
 *  - Default sections order and visibility
 *  - moveSection reordrs sections
 *  - toggleSection flips visibility
 *  - resetLayout restores defaults
 *  - viewMode toggle (cards ↔ compact)
 *  - Persistence via localStorage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardLayout, DEFAULT_SECTIONS } from '../../hooks/useDashboardLayout';

describe('useDashboardLayout', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockClear();
  });

  it('should return default sections when nothing is saved', () => {
    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.sections).toEqual(DEFAULT_SECTIONS);
  });

  it('should return all default sections as visible', () => {
    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.visibleSections).toHaveLength(DEFAULT_SECTIONS.length);
    expect(result.current.visibleSections).toContain('balance-overview');
  });

  it('should default viewMode to "cards"', () => {
    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.viewMode).toBe('cards');
  });

  // ── moveSection ────────────────────────────────────────────────

  it('should reorder sections via moveSection', () => {
    const { result } = renderHook(() => useDashboardLayout());
    const firstId = result.current.sections[0].id;
    const secondId = result.current.sections[1].id;

    act(() => {
      result.current.moveSection(0, 1);
    });

    expect(result.current.sections[0].id).toBe(secondId);
    expect(result.current.sections[1].id).toBe(firstId);
  });

  // ── toggleSection ──────────────────────────────────────────────

  it('should toggle section visibility', () => {
    const { result } = renderHook(() => useDashboardLayout());
    const targetId = DEFAULT_SECTIONS[0].id;

    expect(result.current.sections[0].visible).toBe(true);

    act(() => {
      result.current.toggleSection(targetId);
    });

    expect(result.current.sections[0].visible).toBe(false);
    expect(result.current.visibleSections).not.toContain(targetId);

    act(() => {
      result.current.toggleSection(targetId);
    });

    expect(result.current.sections[0].visible).toBe(true);
    expect(result.current.visibleSections).toContain(targetId);
  });

  // ── resetLayout ────────────────────────────────────────────────

  it('should restore defaults on resetLayout', () => {
    const { result } = renderHook(() => useDashboardLayout());

    // Make changes
    act(() => {
      result.current.moveSection(0, 2);
      result.current.toggleSection(DEFAULT_SECTIONS[1].id);
    });

    // Reset
    act(() => {
      result.current.resetLayout();
    });

    expect(result.current.sections).toEqual(DEFAULT_SECTIONS);
  });

  // ── viewMode ───────────────────────────────────────────────────

  it('should toggle viewMode between cards and compact', () => {
    const { result } = renderHook(() => useDashboardLayout());

    expect(result.current.viewMode).toBe('cards');

    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe('compact');

    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe('cards');
  });

  it('should accept explicit setViewMode', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.setViewMode('compact');
    });

    expect(result.current.viewMode).toBe('compact');
  });

  // ── localStorage persistence ───────────────────────────────────

  it('should persist layout changes to localStorage', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.moveSection(0, 1);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pacifinance-dashboard-layout',
      expect.any(String)
    );
  });

  it('should persist viewMode to localStorage', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.toggleViewMode();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pacifinance-dashboard-viewmode',
      'compact'
    );
  });

  it('should restore layout from localStorage', () => {
    const saved = [
      { id: 'charts', visible: true },
      { id: 'balance-overview', visible: false },
    ];
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'pacifinance-dashboard-layout') return JSON.stringify(saved);
      if (key === 'pacifinance-dashboard-viewmode') return 'compact';
      return null;
    });

    const { result } = renderHook(() => useDashboardLayout());

    // Saved items should come first, with new defaults merged
    expect(result.current.sections[0].id).toBe('charts');
    expect(result.current.sections[1].id).toBe('balance-overview');
    expect(result.current.sections[1].visible).toBe(false);
    expect(result.current.viewMode).toBe('compact');
    // Sections from DEFAULT_SECTIONS not in saved should be appended
    expect(result.current.sections.length).toBeGreaterThan(saved.length);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'pacifinance-dashboard-layout') return 'not-valid-json{';
      return null;
    });

    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.sections).toEqual(DEFAULT_SECTIONS);
  });

  // ── collapsedGroups ────────────────────────────────────────────

  it('should default collapsedGroups to an empty object', () => {
    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.collapsedGroups).toEqual({});
  });

  it('should toggle a group collapsed state independently', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.toggleGroupCollapsed('investments');
    });

    expect(result.current.collapsedGroups.investments).toBe(true);
    expect(result.current.collapsedGroups.liquidity).toBeUndefined();

    act(() => {
      result.current.toggleGroupCollapsed('investments');
    });

    expect(result.current.collapsedGroups.investments).toBe(false);
  });

  it('should persist collapsedGroups to localStorage', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.toggleGroupCollapsed('emergencyFund');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pacifinance-dashboard-collapsed-groups',
      JSON.stringify({ emergencyFund: true })
    );
  });

  it('should restore collapsedGroups from localStorage', () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'pacifinance-dashboard-collapsed-groups') {
        return JSON.stringify({ investments: true });
      }
      return null;
    });

    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.collapsedGroups).toEqual({ investments: true });
  });

  // ── cardDensity ────────────────────────────────────────────────

  it('should default cardDensity to "comfortable"', () => {
    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.cardDensity).toBe('comfortable');
  });

  it('should toggle cardDensity between comfortable and compact', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.toggleCardDensity();
    });

    expect(result.current.cardDensity).toBe('compact');

    act(() => {
      result.current.toggleCardDensity();
    });

    expect(result.current.cardDensity).toBe('comfortable');
  });

  it('should accept explicit setCardDensity', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.setCardDensity('compact');
    });

    expect(result.current.cardDensity).toBe('compact');
  });

  it('should persist cardDensity to localStorage', () => {
    const { result } = renderHook(() => useDashboardLayout());

    act(() => {
      result.current.toggleCardDensity();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pacifinance-dashboard-card-density',
      'compact'
    );
  });

  it('should restore cardDensity from localStorage', () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'pacifinance-dashboard-card-density') return 'compact';
      return null;
    });

    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.cardDensity).toBe('compact');
  });
});

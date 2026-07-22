/**
 * useDashboardLayout Hook
 * 
 * Manages dashboard section order with drag-and-drop.
 * Persists order in localStorage per user.
 * Also manages compact/card view mode.
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pacifinance-dashboard-layout';
const VIEW_MODE_KEY = 'pacifinance-dashboard-viewmode';
const COLLAPSED_GROUPS_KEY = 'pacifinance-dashboard-collapsed-groups';

// Default section order
export const DEFAULT_SECTIONS = [
  { id: 'balance-overview', visible: true },
  { id: 'liquidity-investments', visible: true },
  { id: 'income-expense', visible: true },
  { id: 'charts', visible: true },
  { id: 'financial-insights', visible: true },
  { id: 'goal-tracker', visible: true },
];

export const useDashboardLayout = () => {
  // Load saved layout or use default
  const [sections, setSections] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to add any new sections
        const savedIds = new Set(parsed.map(s => s.id));
        const merged = [
          ...parsed,
          ...DEFAULT_SECTIONS.filter(s => !savedIds.has(s.id)),
        ];
        return merged;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SECTIONS;
  });

  // View mode: 'cards' or 'compact'
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(VIEW_MODE_KEY) || 'cards';
    } catch {
      return 'cards';
    }
  });

  // Persist layout changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    } catch {
      // ignore
    }
  }, [sections]);

  // Persist view mode
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

  // Collapsed state for card sub-groups (e.g. 'liquidity', 'emergencyFund', 'investments')
  // within the card view — independent from top-level section visibility.
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    try {
      const saved = localStorage.getItem(COLLAPSED_GROUPS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_GROUPS_KEY, JSON.stringify(collapsedGroups));
    } catch {
      // ignore
    }
  }, [collapsedGroups]);

  const toggleGroupCollapsed = useCallback((groupId) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);

  // Drag-and-drop: move section from one position to another
  const moveSection = useCallback((fromIndex, toIndex) => {
    setSections(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  // Toggle section visibility
  const toggleSection = useCallback((sectionId) => {
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s)
    );
  }, []);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setSections(DEFAULT_SECTIONS);
  }, []);

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'cards' ? 'compact' : 'cards');
  }, []);

  // Get ordered & visible section IDs
  const visibleSections = sections.filter(s => s.visible).map(s => s.id);

  return {
    sections,
    visibleSections,
    moveSection,
    toggleSection,
    resetLayout,
    viewMode,
    setViewMode,
    toggleViewMode,
    collapsedGroups,
    toggleGroupCollapsed,
  };
};

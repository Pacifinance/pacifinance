import { useState, useEffect } from 'react';

export type ListViewMode = 'cards' | 'table';

const isValidMode = (value: unknown): value is ListViewMode => value === 'cards' || value === 'table';

/**
 * Per-user, localStorage-persisted choice between "cards" (one transaction
 * per visually rich block) and "table" (dense, spreadsheet-like) for a
 * transaction list — same shape as useDashboardLayout's viewMode, applied to
 * the outflow/income lists so the user can pick either layout regardless of
 * screen size, instead of it being forced by a CSS breakpoint.
 */
export const useListViewMode = (storageKey: string, defaultMode: ListViewMode = 'cards') => {
  const [mode, setMode] = useState<ListViewMode>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return isValidMode(stored) ? stored : defaultMode;
    } catch {
      return defaultMode;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, mode);
    } catch {
      // ignore (private mode / storage full)
    }
  }, [storageKey, mode]);

  return [mode, setMode] as const;
};

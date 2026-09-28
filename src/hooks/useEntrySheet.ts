import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ENTRY_MONTH_PARAM, ENTRY_PARAM, isEntryType, parseEntryMonth, type EntryType,
} from '../utils/entrySheet';

interface OpenEntryOptions {
  /** Balance form month as { month (1-12), year }. */
  month?: { month: number; year: number } | null;
}

/**
 * Reads/writes the global `?add=` entry param (see utils/entrySheet.ts).
 * Opening pushes a history entry, so the phone's back button closes the form
 * instead of leaving the page; closing replaces it.
 */
export function useEntrySheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawEntry = searchParams.get(ENTRY_PARAM);
  const entry: EntryType | null = isEntryType(rawEntry) ? rawEntry : null;
  const entryMonth = parseEntryMonth(searchParams.get(ENTRY_MONTH_PARAM));

  const openEntry = useCallback((type: EntryType, options: OpenEntryOptions = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(ENTRY_PARAM, type);
      if (options.month) next.set(ENTRY_MONTH_PARAM, `${options.month.month}-${options.month.year}`);
      else next.delete(ENTRY_MONTH_PARAM);
      return next;
    });
  }, [setSearchParams]);

  const closeEntry = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(ENTRY_PARAM);
      next.delete(ENTRY_MONTH_PARAM);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return { entry, entryMonth, openEntry, closeEntry };
}

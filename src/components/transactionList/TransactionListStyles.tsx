import styled from 'styled-components';

/**
 * Shared styled components for the outflow/income transaction lists —
 * used by both OutflowSection.tsx and IncomeSection.tsx so the two stay
 * visually consistent (cards view, table wrapper, mobile filter panel,
 * cards/table + list/chart segmented switches) instead of drifting apart
 * as separately-maintained copies.
 */

/* ─── Segmented view switch (list/chart, cards/table) ─── */

export const ViewSwitch = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
`;

export const ViewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  color: ${p => p.$active ? '#fff' : p.theme.textColor};
  background: ${p => p.$active ? p.theme.buttonBackgroundColor : 'transparent'};
  opacity: ${p => p.$active ? 1 : 0.7};
  transition: opacity 0.2s ease, background 0.2s ease, transform 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }

  svg {
    font-size: 0.85rem;
  }
`;

/* ─── Table view (scroll wrapper only — columns are file-specific) ─── */

export const TableScroll = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  scrollbar-width: thin;
  scrollbar-color: ${p => p.theme.buttonBackgroundColor}88 transparent;

  &::-webkit-scrollbar { height: 7px; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme.buttonBackgroundColor}88; border-radius: 999px; }
`;

/* ─── Card view wrapper — shown/hidden by JS (viewMode), not by @media ─── */

export const CardViewWrap = styled.div`
  display: block;
`;

/* ─── Mobile filter panel (collapsible) ─── */

export const FilterToggleRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.7rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${p => p.theme.textColor};
  cursor: pointer;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef2f7'};
`;

export const FilterBadge = styled.span`
  background: ${p => p.theme.buttonBackgroundColor};
  color: #fff;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 7px;
  margin-left: 6px;
`;

export const FilterPanel = styled.div`
  display: ${p => p.$open ? 'flex' : 'none'};
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef2f7'};
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc'};
`;

export const FilterRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FilterLabel = styled.label`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  opacity: 0.6;
  color: ${p => p.theme.textColor};
`;

export const FilterInlineRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  > input { flex: 1; min-width: 0; }
`;

export const ClearFiltersBtn = styled.button`
  align-self: flex-start;
  border: none;
  background: rgba(239,68,68,0.13);
  color: #ef4444;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
`;

/* ─── Cards (compact — shrunk from the original size so more fit per screen) ─── */

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
`;

export const TxCard = styled.div`
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  background: ${p => p.$gradient};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
`;

export const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
`;

export const CardCategory = styled.div`
  font-weight: 700;
  font-size: 0.84rem;
  color: ${p => p.theme.textColor};
`;

export const CardAmount = styled.div`
  font-weight: 800;
  font-size: 0.92rem;
  color: ${p => p.theme.textColor};
  white-space: nowrap;
`;

export const CardMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.28rem;
  font-size: 0.72rem;
  color: ${p => p.theme.textColor};
  opacity: 0.75;
  gap: 0.5rem;
`;

export const CardNote = styled.div`
  font-size: 0.72rem;
  color: ${p => p.theme.textColor};
  opacity: 0.65;
  margin-top: 0.22rem;
  overflow-wrap: anywhere;
`;

export const CardActionsRow = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 0.35rem;
  justify-content: flex-end;
`;

export const CardEditGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const TotalCard = styled.div`
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.88rem;
  background: ${p => p.$filtered ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.2)'};
  color: ${p => p.theme.mode === 'dark' ? '#6ee7b7' : '#047857'};
`;

export const ActionBtn = styled.button`
  border: none;
  border-radius: 6px;
  padding: 0;
  font-size: 0.72rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  &:hover:not(:disabled) { transform: scale(1.08); }
  &.delete {
    background: rgba(239,68,68,0.11);
    color: #ef4444;
  }
  &.edit {
    background: rgba(59,130,246,0.11);
    color: #3b82f6;
  }
  &.cancel {
    background: rgba(245,158,11,0.11);
    color: #d97706;
  }
`;

export const InlineInput = styled.input`
  width: 100%;
  min-width: 50px;
  padding: 4px 6px;
  border: 1.5px solid ${p => p.theme.mode === 'dark' ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.3)'};
  border-radius: 6px;
  font-size: 0.82rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc'};
  color: ${p => p.theme.textColor};
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
  }
`;

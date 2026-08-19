/**
 * Shared styled-components for SharedExpensesPanel — mirrors
 * RecurringTransactionsPanel's layout/interaction pattern.
 */
import styled from 'styled-components';

export const EmptyState = styled.p`
  margin: 0.5rem 0 1rem;
  font-size: 0.85rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.55;
  text-align: center;
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
  opacity: ${(p) => (p.$paused ? 0.55 : 1)};
`;

export const RowInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: ${(p) => p.theme.textColor};

  strong { font-size: 0.88rem; }
  span { font-size: 0.75rem; opacity: 0.6; }
`;

export const RowAmount = styled.span`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$isExpense ? '#ef4444' : '#22c55e')};
`;

export const RowActions = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;

  button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
    color: ${(p) => p.theme.textColor};

    &:hover { opacity: 0.8; }
  }
`;

export const FormSection = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.9rem;
  border-top: 1px dashed ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

export const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.72rem;
    color: ${(p) => p.theme.textColor};
    opacity: 0.65;
    min-width: 0;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.85rem;
    outline: none;

    &:focus { border-color: ${(p) => p.theme.buttonBackgroundColor}; }
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.75rem;
`;

export const SecondaryButton = styled.button`
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1')};
  background: transparent;
  color: ${(p) => p.theme.textColor};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
`;

// Plain styled <select> themed via the explicit `theme` prop (like every
// other component in this file) rather than ThemedSelect's ThemeContext —
// SharedExpensesPanel receives `theme` as a prop from its caller, with no
// guarantee a ThemeContext.Provider wraps its mount point.
export const StatusSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
  color: ${(p) => p.theme.textColor};
  font-size: 0.85rem;
  outline: none;

  option {
    background: ${(p) => (p.theme.mode === 'dark' ? '#1e293b' : '#ffffff')};
    color: ${(p) => (p.theme.mode === 'dark' ? '#e2e8f0' : '#1e293b')};
  }

  &:focus { border-color: ${(p) => p.theme.buttonBackgroundColor}; }
`;

export const MonthGroupHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.5rem 0.2rem;
  margin-top: 0.4rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${(p) => p.theme.textColor};
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: capitalize;
  opacity: 0.8;

  span.count {
    font-weight: 500;
    opacity: 0.6;
    text-transform: none;
    margin-left: 0.35rem;
  }

  svg { opacity: 0.6; }
`;

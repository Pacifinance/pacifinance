/**
 * Shared visual language for "something needs the user's attention" cards in
 * the investment-import flow: an amber "closed position" card (a holding that
 * should be marked as sold) and a blue "orphan" card (a sell with no matching
 * buy found anywhere). Used by both the CSV import wizard
 * (`InvestmentImportWizard.tsx`) and the reconciliation panel
 * (`InvestmentReconciliationPanel.tsx`) so the two read as one consistent
 * feature instead of two differently-styled ones.
 */
import styled from 'styled-components';

export const ClosedSection = styled.div`
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h4 {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: #d97706;
  }
`;

export const ClosedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: ${(p) => p.theme.textColor};

  strong { font-weight: 700; }
  span.note { display: block; font-size: 0.72rem; opacity: 0.65; }
`;

export const OrphanSection = styled.div`
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  h4 {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: #3b82f6;
  }
`;

export const OrphanRow = styled.div`
  font-size: 0.78rem;
  color: ${(p) => p.theme.textColor};

  strong { font-weight: 700; }
`;

export const CloseHoldingButton = styled.button`
  flex-shrink: 0;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.4);
  background: transparent;
  color: #d97706;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { opacity: 0.85; }
`;

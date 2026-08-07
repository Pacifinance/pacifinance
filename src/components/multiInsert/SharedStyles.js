/**
 * Shared styled-components for multi-insert modals.
 * Used by MultiOutflowInsert, MultiIncomeInsert, and MultiBalanceInsert.
 */
import styled, { keyframes } from 'styled-components';

/* ─── Animations ─── */
export const slideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ─── Modal Shell ─── */
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.7)'
    : 'rgba(15, 23, 42, 0.35)'};
  backdrop-filter: blur(8px);
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${slideIn} 0.2s ease-out;
  
  @media (max-width: 600px) {
    padding: 0;
    align-items: flex-end;
  }
`;

export const ModalContainer = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'linear-gradient(180deg, #1a1f2e 0%, #151923 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'};
  border: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 20px;
  width: 100%;
  max-width: ${p => p.$maxWidth || '720px'};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${p => p.theme.mode === 'dark'
    ? '0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
    : '0 24px 64px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.04)'};
  overflow: hidden;
  
  @media (max-width: 600px) {
    max-height: 100vh;
    max-height: 100dvh;
    border-radius: 16px 16px 0 0;
    max-width: 100%;
  }
`;

export const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  
  @media (max-width: 600px) {
    padding: 1rem 1.25rem;
  }
`;

export const ModalTitle = styled.div`
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: ${p => p.theme.textColor};
  }
  p {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    color: ${p => p.theme.textColor};
    opacity: 0.5;
  }
  @media (max-width: 600px) {
    h2 { font-size: 1.1rem; }
    p { font-size: 0.75rem; }
  }
`;

export const CloseButton = styled.button`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${p => p.theme.textColor};
  font-size: 1.1rem;
  transition: background 0.2s;
  
  &:hover {
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
  }
`;

export const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  /* Default text color so any plain text inside (not wrapped in its own
     theme-aware styled component) still follows light/dark mode instead of
     falling back to the browser's default black. */
  color: ${p => p.theme.textColor};

  @media (max-width: 600px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
`;

export const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 0.75rem;
  
  @media (max-width: 600px) {
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
    flex-direction: column;
  }
`;

/* ─── Row / Card ─── */
export const RowCard = styled.div`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  border-radius: 14px;
  padding: 1rem;
  animation: ${slideIn} 0.25s ease-out;
  transition: border-color 0.2s;
  position: relative;
  
  @media (max-width: 600px) {
    padding: 0.75rem;
  }
`;

export const RowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  
  @media (max-width: 600px) {
    margin-bottom: 0.5rem;
  }
`;

export const RowBadge = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,107,107,0.7)' : '#ef4444'};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s, color 0.2s;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
`;

/* ─── Form Fields ─── */
export const RowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

export const RowFieldFull = styled.div`
  grid-column: 1 / -1;
`;

export const FieldLabel = styled.label`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${p => p.theme.textColor};
  opacity: 0.6;
  display: block;
  margin-bottom: 4px;
`;

export const FieldInput = styled.input`
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 15px;
  min-height: 40px;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'white'};
  color: ${p => p.theme.textColor};
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
  }
  &[type='date'] {
    -webkit-appearance: none;
    appearance: none;
    padding: 8px 6px;
  }
  @media (max-width: 600px) {
    font-size: 15px;
    &[type='date'] {
      font-size: 14px;
    }
  }
`;

export const CurrencyWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const CurrencySymbolSpan = styled.span`
  position: absolute;
  left: 12px;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#94a3b8'};
  font-size: 0.9rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 1;
`;

export const CurrencyFieldInput = styled(FieldInput)`
  padding-left: 2em;
  text-align: right;
`;

export const NoteInput = styled(FieldInput)`
  font-size: 0.88rem;
`;

/* ─── Action Buttons ─── */
export const ActionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0.25rem 0;
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 2px dashed ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1'};
  background: transparent;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#64748b'};
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    background: ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '08'};
  }
`;

export const DuplicateButton = styled(AddButton)`
  border-style: dashed;
`;

/* ─── Footer Elements ─── */
export const CountBadge = styled.span`
  font-size: 0.85rem;
  color: ${p => p.theme.textColor};
  opacity: 0.6;
`;

export const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, ${p => p.theme.buttonBackgroundColor || '#3b82f6'}, ${p => p.theme.buttonBackgroundColor || '#3b82f6'});
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 14px ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '40'};
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '60'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${p => p.$progress}%;
    background: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`;

/**
 * Build the common MUI Select `sx` object for multi-insert modals.
 * @param {Object} theme - The theme object
 * @returns {Object} MUI sx prop
 */
export const getSelectSx = (theme) => ({
  borderRadius: '10px',
  border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
  fontSize: '0.88rem',
  background: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'white',
  color: theme.textColor,
  minHeight: '40px',
  width: '100%',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiSelect-select': { padding: '7px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  '& .MuiSvgIcon-root': { color: theme.textColor },
});

/* ─── Info hint for disabled fields ─── */
export const InfoHint = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#94a3b8'};
  padding: 6px 0 0;
  line-height: 1.3;

  svg {
    flex-shrink: 0;
    font-size: 14px;
    opacity: 0.7;
  }
`;

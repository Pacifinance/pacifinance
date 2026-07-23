import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 150px;
  padding: 5px 9px;
  border-radius: 6px;
  border: 1px solid ${p => p.$active ? p.$accentColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : '#e2e8f0')};
  background: ${p => p.$active ? `${p.$accentColor}1a` : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#ffffff')};
  color: ${p => p.theme.textColor};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Panel = styled.div`
  position: fixed;
  top: ${p => p.$top}px;
  left: ${p => p.$left}px;
  z-index: 10050;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 190px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'};
  background: ${p => p.theme.mode === 'dark' ? '#1e293b' : '#ffffff'};
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  opacity: 0.6;
  color: ${p => p.theme.textColor};
`;

const CloseBtn = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  padding: 2px;
  &:hover { opacity: 1; }
`;

const FieldRow = styled.label`
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  opacity: 0.85;

  input {
    font-size: 0.85rem;
    padding: 5px 6px;
    border-radius: 6px;
    border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : '#e2e8f0'};
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
    color: ${p => p.theme.textColor};
    color-scheme: ${p => p.theme.mode === 'dark' ? 'dark' : 'light'};
  }
`;

const ClearBtn = styled.button`
  align-self: flex-start;
  border: none;
  background: ${p => `${p.$accentColor}22`};
  color: ${p => p.$accentColor};
  border-radius: 6px;
  padding: 4px 9px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
`;

/**
 * Compact date-range filter for table headers. Renders a small trigger
 * button showing the active range (or a placeholder), and opens a portaled
 * popover with the two date inputs — keeps the table header from being
 * pushed wider or clipped by the table's horizontal scroll container.
 */
export default function DateFilterPopover({
  theme,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  onClear,
  min,
  max,
  accentColor = '#3b82f6',
  labels,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const isActive = Boolean(startValue || endValue);

  const formatShort = (value) => {
    if (!value) return '';
    const [, m, d] = value.split('-');
    return `${d}/${m}`;
  };

  const buttonLabel = !isActive
    ? labels.all
    : startValue && endValue
      ? `${formatShort(startValue)} - ${formatShort(endValue)}`
      : startValue
        ? `≥ ${formatShort(startValue)}`
        : `≤ ${formatShort(endValue)}`;

  const openPanel = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelWidth = 220;
    const left = Math.min(
      Math.max(8, rect.right - panelWidth),
      window.innerWidth - panelWidth - 8,
    );
    setCoords({ top: rect.bottom + 6, left });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        panelRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <Trigger
        type="button"
        ref={triggerRef}
        theme={theme}
        $active={isActive}
        $accentColor={accentColor}
        onClick={() => (open ? setOpen(false) : openPanel())}
        title={labels.date}
      >
        <FontAwesomeIcon icon={faCalendarAlt} />
        <span>{buttonLabel}</span>
      </Trigger>

      {open && createPortal(
        <Panel theme={theme} $top={coords.top} $left={coords.left} ref={panelRef}>
          <PanelHeader theme={theme}>
            {labels.date}
            <CloseBtn theme={theme} onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </CloseBtn>
          </PanelHeader>
          <FieldRow theme={theme}>
            {labels.from}
            <input
              type="date"
              value={startValue || ''}
              onChange={(e) => onStartChange(e.target.value)}
              min={min}
              max={max}
            />
          </FieldRow>
          <FieldRow theme={theme}>
            {labels.to}
            <input
              type="date"
              value={endValue || ''}
              onChange={(e) => onEndChange(e.target.value)}
              min={min}
              max={max}
            />
          </FieldRow>
          {isActive && (
            <ClearBtn $accentColor={accentColor} onClick={onClear}>
              {labels.clear}
            </ClearBtn>
          )}
        </Panel>,
        document.body,
      )}
    </>
  );
}

// Belongs in components/ despite reading ThemeContext: it's a generic, cross-feature
// primitive, not tied to a business domain (see CONTRIBUTING.md's components/ vs sections/ rule).
import React, { useContext } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';

/* ─── Base styled native <select> with theme-aware colors ─── */
const StyledNativeSelect = styled.select`
  padding: ${p => p.$compact ? '4px 6px' : '6px 12px'};
  border-radius: ${p => p.$compact ? '6px' : '8px'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'};
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#ffffff'};
  color: ${p => p.theme.textColor};
  font-size: ${p => p.$compact ? '0.82rem' : '0.9rem'};
  font-weight: 500;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
  }

  /* Theme-aware option dropdown styling */
  option {
    background: ${p => p.theme.mode === 'dark' ? '#1e293b' : '#ffffff'};
    color: ${p => p.theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
  }
`;

/**
 * ThemedSelect — A native <select> with platform-consistent theme colors.
 *
 * Use this whenever you need a native <select> element that respects
 * the app's dark/light theme, including the dropdown popup.
 *
 * Props:
 *  - compact: boolean — smaller padding/font for inline/table usage
 *  - All standard <select> props (value, onChange, children, style, etc.)
 */
const ThemedSelect = React.forwardRef(({ compact, children, ...rest }, ref) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledNativeSelect ref={ref} theme={theme} $compact={compact} {...rest}>
      {children}
    </StyledNativeSelect>
  );
});

ThemedSelect.displayName = 'ThemedSelect';

export default ThemedSelect;

/**
 * getMuiSelectMenuProps — Returns themed MenuProps for MUI <Select> components.
 *
 * Use this with <Select MenuProps={getMuiSelectMenuProps(theme)}> to ensure
 * the dropdown popup has correct background/text colors in dark/light mode.
 */
export const getMuiSelectMenuProps = (theme) => ({
  style: { zIndex: 10003 },
  PaperProps: {
    style: {
      background: theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.95)' : '#ffffff',
      color: theme.textColor,
      borderRadius: '10px',
    },
  },
});

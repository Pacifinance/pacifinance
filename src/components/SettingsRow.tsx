import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Container = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')};
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')};
  text-decoration: none;
  ${(p) => p.$clickable && `
    cursor: pointer;
    transition: background 0.15s ease;
  `}
`;

const TextBlock = styled.div`
  min-width: 0;
`;

const Label = styled.span`
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.15rem;
`;

const Subtitle = styled.span`
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)')};
  font-size: 0.75rem;
`;

const ExternalArrow = styled.span`
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')};
  font-size: 0.8rem;
  flex-shrink: 0;
`;

interface SettingsRowProps {
  theme: any;
  icon?: IconDefinition;
  label: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  href?: string;
  external?: boolean;
  style?: React.CSSProperties;
}

/** A single "label + subtitle on the left, control on the right" settings row. */
export default function SettingsRow({ theme, icon, label, subtitle, children, href, external, style }: SettingsRowProps) {
  const content = (
    <>
      <TextBlock>
        <Label theme={theme}>
          {icon && <FontAwesomeIcon icon={icon} style={{ marginRight: '0.4rem', fontSize: '0.85rem' }} />}
          {label}
        </Label>
        {subtitle && <Subtitle theme={theme}>{subtitle}</Subtitle>}
      </TextBlock>
      {children}
      {external && <ExternalArrow theme={theme}>↗</ExternalArrow>}
    </>
  );

  if (href) {
    return (
      <Container
        as="a"
        theme={theme}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        $clickable
        style={style}
      >
        {content}
      </Container>
    );
  }

  return <Container theme={theme} style={style}>{content}</Container>;
}

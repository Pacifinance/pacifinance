import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Card = styled.div<{ $danger?: boolean }>`
  margin-bottom: 1rem;
  padding: 1.25rem;
  border-radius: 14px;
  background: ${(p) => (p.$danger
    ? (p.theme.mode === 'dark' ? 'rgba(220,53,69,0.1)' : '#fff5f5')
    : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'))};
  border: ${(p) => (p.$danger
    ? `2px solid ${p.theme.mode === 'dark' ? 'rgba(220,53,69,0.3)' : '#feb2b2'}`
    : `1px solid ${p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`)};
  box-shadow: ${(p) => (p.$danger ? '0 4px 16px rgba(220,53,69,0.1)' : '0 4px 16px rgba(0,0,0,0.06)')};
`;

const Header = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};
  user-select: none;
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Title = styled.h3<{ $danger?: boolean }>`
  margin: 0;
  color: ${(p) => (p.$danger ? '#dc3545' : p.theme.textColor)};
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const Description = styled.p<{ $danger?: boolean }>`
  margin: 0.3rem 0 0;
  color: ${(p) => (p.$danger ? '#dc3545' : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'))};
  font-size: 0.78rem;
  line-height: 1.5;
`;

const Badge = styled.span`
  background: ${(p) => p.theme.buttonBackgroundColor};
  color: #fff;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
`;

const Chevron = styled(FontAwesomeIcon)<{ $open?: boolean }>`
  color: ${(p) => p.theme.textColor};
  opacity: 0.5;
  font-size: 0.85rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')});
`;

const Body = styled.div<{ $open: boolean }>`
  display: ${(p) => (p.$open ? 'block' : 'none')};
  margin-top: 0.85rem;
`;

const SubHeadingText = styled.h4`
  margin: 0 0 0.5rem;
  color: ${(p) => p.theme.textColor};
  font-size: 0.85rem;
  font-weight: 700;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const SubDescriptionText = styled.p`
  margin: -0.3rem 0 0.75rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.7;
  font-size: 0.8rem;
  line-height: 1.4;
`;

/** A smaller uppercase heading for a sub-block inside a SettingsGroup (e.g. one of two related selects sharing a card). */
export function SettingsSubHeading({
  theme, icon, description, children,
}: { theme: any; icon?: IconDefinition; description?: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      <SubHeadingText theme={theme}>
        {icon && <FontAwesomeIcon icon={icon} style={{ marginRight: '0.4rem' }} />}
        {children}
      </SubHeadingText>
      {description && <SubDescriptionText theme={theme}>{description}</SubDescriptionText>}
    </>
  );
}

/** Visual separator between sub-blocks stacked inside the same SettingsGroup. */
export const SettingsDivider = styled.div`
  height: 1px;
  margin: 1rem 0;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
`;

interface SettingsGroupProps {
  theme: any;
  icon: IconDefinition;
  title: string;
  description?: string;
  danger?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  badge?: string | number;
  children: React.ReactNode;
}

/**
 * A single settings "card": icon + title (+ optional description), with the
 * body always visible unless `collapsible` is set — in which case the whole
 * header toggles it, and `badge` can show a count (e.g. custom categories)
 * while collapsed so the section stays informative without taking up space.
 */
export default function SettingsGroup({
  theme,
  icon,
  title,
  description,
  danger = false,
  collapsible = false,
  defaultOpen = true,
  badge,
  children,
}: SettingsGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open : true;

  return (
    <Card theme={theme} $danger={danger}>
      <Header
        theme={theme}
        $clickable={collapsible}
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? isOpen : undefined}
      >
        <TitleBlock>
          <Title theme={theme} $danger={danger}>
            <FontAwesomeIcon
              icon={icon}
              style={{ marginRight: '0.6rem', color: danger ? '#dc3545' : theme.buttonBackgroundColor, fontSize: '0.95rem' }}
            />
            {title}
            {badge !== undefined && badge !== null && badge !== '' && <Badge theme={theme}>{badge}</Badge>}
          </Title>
          {description && <Description theme={theme} $danger={danger}>{description}</Description>}
        </TitleBlock>
        {collapsible && <Chevron theme={theme} icon={faChevronDown} $open={isOpen} />}
      </Header>
      <Body $open={isOpen}>{children}</Body>
    </Card>
  );
}

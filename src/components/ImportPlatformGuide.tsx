// Belongs in components/ despite reading LanguageContext: it's a generic, fully
// prop-driven guide reused across two unrelated import flows (investments and
// expenses/incomes), not tied to one business domain (see CONTRIBUTING.md's
// components/ vs sections/ rule).
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';

/**
 * Collapsible "where do I find this file" guide, shown next to every CSV
 * import drop zone (investments and expenses/incomes) so the user doesn't
 * have to guess which export to download from their platform. Content is
 * sourced from docs/INVESTMENT_IMPORT_RESEARCH.md's verified formats — only
 * platforms this app actually auto-detects or explicitly supports are listed,
 * so the guide never promises something that isn't backed by a real parser.
 */

interface ImportPlatformGuideProps {
  theme: unknown;
  /** Which platforms to show instructions for, in this order. */
  platformIds: string[];
}

const Wrapper = styled.div`
  margin-bottom: 0.75rem;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.4rem 0;
  color: ${(p) => p.theme.buttonBackgroundColor};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:hover { opacity: 0.85; }
`;

const GuideList = styled.div`
  margin: 0.4rem 0 0;
  padding: 0.35rem 0.5rem;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)')};
`;

const EntryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.6rem 0.45rem;
  border: 0;
  border-bottom: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'};
  background: transparent;
  color: ${(p) => p.theme.textColor};
  font-size: 0.8rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  &:hover { color: ${(p) => p.theme.buttonBackgroundColor}; }
  &:focus-visible { outline: 2px solid ${(p) => p.theme.buttonBackgroundColor}; outline-offset: -2px; border-radius: 6px; }
`;

const EntryDetails = styled.div`
  padding: 0.15rem 1.5rem 0.7rem 0.45rem;
  border-bottom: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'};
  color: ${(p) => p.theme.textColor};
  opacity: 0.78;
  font-size: 0.78rem;
  line-height: 1.45;
`;

export default function ImportPlatformGuide({ theme, platformIds }: ImportPlatformGuideProps) {
  const { translations } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const [openEntries, setOpenEntries] = useState<Set<string>>(() => new Set());
  const t = translations.importGuide;
  if (!t) return null;

  const entries = platformIds
    .map((id) => ({ id, label: t.platforms?.[id]?.label, steps: t.platforms?.[id]?.steps }))
    .filter((entry) => entry.label && entry.steps);

  if (entries.length === 0) return null;

  return (
    <Wrapper>
      <ToggleButton type="button" theme={theme} onClick={() => setOpen((v) => !v)}>
        <FontAwesomeIcon icon={faCircleQuestion} />
        {t.toggleLabel || 'Where do I find this file?'}
        <FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} style={{ fontSize: '0.7rem', marginLeft: 'auto' }} />
      </ToggleButton>
      {open && (
        <GuideList theme={theme}>
          {entries.map((entry) => {
            const entryOpen = openEntries.has(entry.id);
            const detailsId = `import-guide-${entry.id}`;
            return <div key={entry.id}>
              <EntryButton
                type="button"
                theme={theme}
                aria-expanded={entryOpen}
                aria-controls={detailsId}
                onClick={() => setOpenEntries((current) => {
                  const next = new Set(current);
                  if (next.has(entry.id)) next.delete(entry.id); else next.add(entry.id);
                  return next;
                })}
              >
                {entry.label}
                <FontAwesomeIcon icon={entryOpen ? faChevronDown : faChevronRight} style={{ fontSize: '0.7rem' }} />
              </EntryButton>
              {entryOpen && <EntryDetails id={detailsId} theme={theme}>{entry.steps}</EntryDetails>}
            </div>;
          })}
        </GuideList>
      )}
    </Wrapper>
  );
}

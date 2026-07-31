import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import Sidebar from '../sections/Sidebar';
import type { CommunityPriceWithInstrumentDto } from '../types/api';
import { CalendarCheck2, CheckCircle2 } from 'lucide-react';

const ContentWrapper = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  min-height: 100vh;
  margin-left: 0;
  margin-top: 80px;
  padding: 1.5rem;
  width: 100%;

  @media (min-width: 768px) {
    margin-left: 5.5rem;
    margin-top: 0;
    width: calc(100% - 5.5rem);
    padding: 2rem;
  }
`;

const PageTitle = styled.h1`
  color: ${(p) => p.theme.textColor};
  font-size: 1.4rem;
  margin: 0 0 0.25rem;
`;

const PageSubtitle = styled.p`
  color: ${(p) => p.theme.textColor};
  opacity: 0.65;
  font-size: 0.85rem;
  margin: 0 0 1.5rem;
  max-width: 40rem;
`;

const PageContent = styled.div`
  width: 100%;
  max-width: 70rem;
`;

const EmptyState = styled.div`
  min-height: 18rem;
  border-radius: 18px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.8)')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: ${(p) => p.theme.textColor};

  svg { width: 2rem; height: 2rem; color: #10b981; margin-bottom: 1rem; }
  strong { font-size: 1.05rem; }
  p { max-width: 30rem; margin: 0.5rem 0 0; opacity: 0.62; font-size: 0.88rem; }
`;

const SubmissionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 12px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0')};
`;

const SubmissionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;

  .instrument { font-weight: 600; color: ${(p) => p.theme.textColor}; }
`;

const ReferenceDate = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.65rem;
  border-radius: 9px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.22);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;

  svg { width: 0.9rem; height: 0.9rem; }
`;

const SubmissionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.82rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.8;
`;

const SubmittedAt = styled.span`
  opacity: 0.62;
`;

const NoteInput = styled.input`
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
  color: ${(p) => p.theme.textColor};
  font-size: 0.82rem;
  flex: 1;
  min-width: 10rem;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant: 'approve' | 'reject' }>`
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  background: ${(p) => (p.$variant === 'approve' ? '#10b981' : '#ef4444')};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { opacity: 0.85; }
`;

/**
 * Admin-only moderation queue for community-submitted historical prices - see
 * server/src/db/models/investments.ts' "Community-verified historical
 * prices" section. Gated by AppRouter's AdminRoute, but /pending and /verify
 * both re-check isAdmin server-side, so this page is convenience UI only,
 * never the actual security boundary.
 */
function AdminPriceReviewPage() {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { investmentService } = useDemoServices();
  const auth = useAuth();
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = auth;
  const t = translations.investments.adminPriceReview;

  const [submissions, setSubmissions] = useState<CommunityPriceWithInstrumentDto[] | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    investmentService.getPendingCommunityPrices()
      .then((result) => { if (!cancelled) setSubmissions(result); })
      .catch((error) => {
        console.error('AdminPriceReviewPage: failed to load pending submissions', error);
        if (!cancelled) setSubmissions([]);
      });
    return () => { cancelled = true; };
  }, [investmentService]);

  const resolve = async (id: number, action: 'approve' | 'reject') => {
    if (processingId !== null) return;
    setProcessingId(id);
    try {
      await investmentService.verifyCommunityPrice({ id, action, rejection_note: notes[id] || null });
      setSubmissions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } catch (error) {
      console.error('AdminPriceReviewPage: failed to resolve submission', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <SEOHead title={`${t.title} | Pacifinance`} noindex={true} />
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <ContentWrapper theme={theme}>
        <PageContent>
          <PageTitle theme={theme}>{t.title}</PageTitle>
          <PageSubtitle theme={theme}>{t.subtitle}</PageSubtitle>

          {submissions === null && <EmptyState theme={theme}><p>{t.loading}</p></EmptyState>}
          {submissions !== null && submissions.length === 0 && (
            <EmptyState theme={theme}>
              <CheckCircle2 aria-hidden="true" />
              <strong>{t.emptyTitle}</strong>
              <p>{t.emptyDescription}</p>
            </EmptyState>
          )}
          {submissions?.map((submission) => (
          <SubmissionCard key={submission.id} theme={theme}>
            <SubmissionHeader theme={theme}>
              <span className="instrument">
                {submission.instrument ? `${submission.instrument.symbol} — ${submission.instrument.name}` : `#${submission.instrumentId}`}
              </span>
              <ReferenceDate>
                <CalendarCheck2 aria-hidden="true" />
                {t.referenceDateLabel}: {submission.referenceDate || submission.monthKey}
              </ReferenceDate>
            </SubmissionHeader>
            <SubmissionMeta theme={theme}>
              <span>{t.rawPriceLabel}: {submission.rawPrice.toLocaleString()} {submission.rawCurrency}</span>
              <span>≈ {formatAmount(submission.priceEur)}</span>
              <SubmittedAt>{t.submittedOn} {new Date(submission.submittedAt).toLocaleDateString()}</SubmittedAt>
            </SubmissionMeta>
            <ActionsRow>
              <NoteInput
                theme={theme}
                placeholder={t.rejectionNotePlaceholder}
                value={notes[submission.id] ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [submission.id]: e.target.value }))}
              />
              <ActionButton $variant="approve" disabled={processingId === submission.id} onClick={() => resolve(submission.id, 'approve')}>
                {t.approveButton}
              </ActionButton>
              <ActionButton $variant="reject" disabled={processingId === submission.id || !(notes[submission.id] ?? '').trim()} onClick={() => resolve(submission.id, 'reject')}>
                {t.rejectButton}
              </ActionButton>
            </ActionsRow>
          </SubmissionCard>
          ))}
        </PageContent>
      </ContentWrapper>
    </>
  );
}

export default AdminPriceReviewPage;

import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody,
} from './multiInsert/SharedStyles';
import { ClosedSection, ClosedRow, OrphanSection, OrphanRow, CloseHoldingButton } from './investmentImport/ReconciliationStyles';
import { loadInvestmentSnapshot } from '../utils/investmentImport/loadSnapshot';
import { toImportedTransaction } from '../utils/investmentImport/entryBuilders';
import { closeStaleHolding } from '../utils/investmentImport/closeStaleHolding';
import { findReconciliationIssues, StaleClosedHolding, StandingOrphan } from '../utils/investmentImport/reconciliation';
import type { InvestmentInstrumentDto } from '../types/api';

interface InvestmentReconciliationPanelProps {
  onClose: () => void;
  onChanged: () => Promise<void> | void;
}

interface StaleClosedCandidate extends StaleClosedHolding {
  status: 'pending' | 'closing' | 'closed' | 'error';
}

/**
 * Re-derives closed-position inconsistencies directly from already-persisted
 * data - no new CSV needed. The CSV import wizard only ever notices a
 * position is fully sold when a FILE reveals it (see recomputeFromMerged in
 * InvestmentImportWizard.tsx); if that file is never (re-)uploaded, a
 * genuinely closed position can be left showing as an active holding
 * indefinitely. This panel runs the exact same detection
 * (findReconciliationIssues, reusing the wizard's own closedPositions logic)
 * against the complete transaction ledger on its own, so the user can catch
 * and fix that gap without needing to re-import anything.
 *
 * Always analyzes the WHOLE portfolio, not just the asset key of whichever
 * "Holding dettagliati" modal happened to host the trigger button -
 * closed-position detection doesn't respect asset-key boundaries, and
 * scoping it would risk false-positive "orphan" sells for instruments
 * actually held under a different asset key.
 */
export default function InvestmentReconciliationPanel({ onClose, onChanged }: InvestmentReconciliationPanelProps) {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const { convertAmountToEUR } = useContext(CurrencyContext);
  const { investmentService } = useDemoServices();
  const t = translations.investments.holdings;

  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [staleClosedCandidates, setStaleClosedCandidates] = useState<StaleClosedCandidate[]>([]);
  const [standingOrphans, setStandingOrphans] = useState<(StandingOrphan & { instrument: InvestmentInstrumentDto | null })[]>([]);
  const [recordedHistoryByInstrumentId, setRecordedHistoryByInstrumentId] = useState<Map<number, Map<string, number | null>>>(new Map());
  const [recordedQuantityByInstrumentId, setRecordedQuantityByInstrumentId] = useState<Map<number, Map<string, number | null>>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        const snapshot = await loadInvestmentSnapshot(investmentService);
        const transactions = snapshot.transactions.map(toImportedTransaction);
        const { staleClosedHoldings, standingOrphans: orphans } = findReconciliationIssues(transactions, snapshot.holdings);

        const orphanIsins = Array.from(new Set(orphans.map((o) => o.isin).filter((v): v is string => Boolean(v))));
        let orphanIsinMatches: Record<string, InvestmentInstrumentDto | null> = {};
        if (orphanIsins.length > 0) {
          try {
            orphanIsinMatches = await investmentService.searchInstrumentsByIsins(orphanIsins);
          } catch {
            orphanIsinMatches = {};
          }
        }

        if (cancelled) return;
        setStaleClosedCandidates(staleClosedHoldings.map((c) => ({ ...c, status: 'pending' })));
        setStandingOrphans(orphans.map((o) => ({ ...o, instrument: o.isin ? (orphanIsinMatches[o.isin.toUpperCase()] ?? null) : null })));
        setRecordedHistoryByInstrumentId(snapshot.recordedHistoryByInstrumentId);
        setRecordedQuantityByInstrumentId(snapshot.recordedQuantityByInstrumentId);
        setStatus('done');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markSold = async (candidate: StaleClosedCandidate) => {
    setStaleClosedCandidates((prev) => prev.map((c) => (c.holding.id === candidate.holding.id ? { ...c, status: 'closing' } : c)));
    try {
      await closeStaleHolding({
        investmentService,
        holding: candidate.holding,
        transactions: candidate.transactions,
        lastTransactionDate: candidate.lastTransactionDate,
        recordedHistoryByInstrumentId,
        recordedQuantityByInstrumentId,
        convertAmountToEUR,
        // Every transaction here already exists server-side verbatim - nothing
        // new to confirm, and resending would incorrectly re-stamp `source`
        // on historical rows that didn't actually change.
        transactionEntries: [],
      });
      setStaleClosedCandidates((prev) => prev.map((c) => (c.holding.id === candidate.holding.id ? { ...c, status: 'closed' } : c)));
      await onChanged();
    } catch {
      setStaleClosedCandidates((prev) => prev.map((c) => (c.holding.id === candidate.holding.id ? { ...c, status: 'error' } : c)));
    }
  };

  const pendingCandidates = staleClosedCandidates.filter((c) => c.status !== 'closed');
  const hasIssues = pendingCandidates.length > 0 || standingOrphans.length > 0;

  return (
    <Overlay theme={theme} onClick={onClose}>
      <ModalContainer theme={theme} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.reconciliationTitle || 'Analizza le tue transazioni'}</h2>
            <p>{t.reconciliationSubtitle || 'Controlla i tuoi dati già salvati alla ricerca di incongruenze, senza dover ricaricare nessun file.'}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          {status === 'loading' && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: theme.textColor, opacity: 0.7 }}>
              <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />
              {t.reconciliationAnalyzing || 'Analisi in corso…'}
            </p>
          )}

          {status === 'error' && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {t.reconciliationError || "Impossibile completare l'analisi. Riprova più tardi."}
            </p>
          )}

          {status === 'done' && !hasIssues && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: theme.textColor, opacity: 0.7 }}>
              {t.reconciliationNoIssues || 'Nessuna incongruenza trovata.'}
            </p>
          )}

          {status === 'done' && pendingCandidates.length > 0 && (
            <ClosedSection>
              <h4>{t.reconciliationStaleClosedTitle || 'Posizioni chiuse rilevate'}</h4>
              {pendingCandidates.map((candidate) => (
                <ClosedRow key={candidate.holding.id} theme={theme}>
                  <span>
                    <strong>{candidate.holding.instrument?.symbol}</strong> — {candidate.holding.instrument?.name}
                    <span className="note">
                      {t.reconciliationStaleClosedNote || 'Già tra i tuoi holding, ma le transazioni registrate mostrano che è stato venduto completamente.'}
                    </span>
                  </span>
                  <CloseHoldingButton
                    type="button"
                    onClick={() => markSold(candidate)}
                    disabled={candidate.status === 'closing'}
                  >
                    {candidate.status === 'error'
                      ? (t.reconciliationRetry || 'Riprova')
                      : (t.reconciliationMarkSold || 'Segna come venduto')}
                  </CloseHoldingButton>
                </ClosedRow>
              ))}
            </ClosedSection>
          )}

          {status === 'done' && standingOrphans.length > 0 && (
            <OrphanSection theme={theme}>
              <h4>{t.reconciliationOrphanTitle || 'Vendita senza acquisto corrispondente'}</h4>
              {standingOrphans.map((orphan) => (
                <OrphanRow key={orphan.key} theme={theme}>
                  {(t.reconciliationOrphanNote || "{ticker} — hai ancora una vendita registrata senza un acquisto corrispondente. Probabilmente l'acquisto si trova in un file che non hai ancora caricato — caricalo per riconciliare automaticamente questa transazione.")
                    .replace('{ticker}', orphan.ticker || orphan.name || orphan.isin || '?')}
                </OrphanRow>
              ))}
            </OrphanSection>
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
}

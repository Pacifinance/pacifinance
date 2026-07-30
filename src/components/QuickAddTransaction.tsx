/**
 * QuickAddTransaction — floating action button that opens a popup to record
 * an outflow or income in seconds: amount + category, everything else
 * optional. Two entry modes inside the popup:
 *   - Manuale: amount + category (via the shared CategoryPicker, including
 *     the user's own custom sub-categories) + optional note.
 *   - Testo o voce: paste free text, or dictate it via the device keyboard's
 *     own microphone button, and a client-side parser (smartPasteParser.ts)
 *     guesses the amount + category. Nothing is ever sent anywhere for this —
 *     no speech-to-text API, no OCR — it's plain regex + keyword matching
 *     running in the browser. The guess always lands back in the editable
 *     manual fields for the user to confirm before saving.
 *
 * Deliberately minimal (Fase 1 — insertion friction): date is always today,
 * payment type defaults to "single payment" for outflows. An optional balance
 * source (which account/holding the money came from or went to) can be picked
 * too — same concept as InsertValues.tsx, reimplemented independently here
 * for the "current month only" case (no past-month handling needed since the
 * date is always today), to avoid touching InsertValues' larger, more fragile
 * balance-delta logic.
 */
import React, { useContext, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faCheck, faTimes, faKeyboard, faCommentDots, faMagic, faPencil, faFileImport, faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { useDemoServices } from '../hooks/useDemoServices';
import { getOutflowsTags, getIncomesTags, getPaymentTags, getCustomCategories, getCurrentBalance } from '../utils/userDataSelectors';
import { parseSmartPasteText } from '../utils/smartPasteParser';
import { detectPlatform } from '../utils/platformDetection';
import { ASSET_KEYS, buildSnapshotWithDeltas } from '../constants/balanceSchema';
import CategoryPicker from './CategoryPicker';
import {
  Overlay as ModalOverlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody,
} from './multiInsert/SharedStyles';

const DataImportWizard = lazy(() => import('./DataImportWizard'));
const InvestmentImportWizard = lazy(() => import('./InvestmentImportWizard'));

/* Bottom-right, above the mobile BottomNavBar (66-74px tall, see index.css). */
const Fab = styled.button`
  position: fixed;
  right: 1.5rem;
  bottom: 1.75rem;
  z-index: 950;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #079164 0%, #056b4a 100%);
  box-shadow: 0 6px 18px rgba(7, 145, 100, 0.4);
  cursor: pointer;
  font-size: 1.3rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(7, 145, 100, 0.5); }

  @media (max-width: 839px) {
    bottom: calc(66px + env(safe-area-inset-bottom, 0px) + 0.75rem);
    right: 1rem;
    width: 3.1rem;
    height: 3.1rem;
    font-size: 1.15rem;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  /* Matches every other modal's Overlay (multiInsert/SharedStyles.js) — the
   * mobile BottomNavBar renders via a portal at z-index 9999, so anything
   * lower gets its bottom edge (here, the submit button) covered by it. */
  z-index: 10002;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
  }
`;

const Popup = styled.div`
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  background: ${p => p.theme.componentBackground || (p.theme.mode === 'dark' ? '#15171c' : '#fff')};
  border-radius: 1.25rem 1.25rem 0 0;
  padding: 1.1rem 1.25rem 1.4rem;
  box-shadow: 0 -8px 30px rgba(0,0,0,0.25);

  @media (min-width: 640px) {
    border-radius: 1.25rem;
    margin-bottom: 2rem;
    max-height: 80vh;
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${p => p.theme.textColor};
`;

const CloseBtn = styled.button`
  border: none;
  background: transparent;
  color: ${p => p.theme.textColor};
  opacity: 0.6;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.3rem;

  &:hover { opacity: 1; }
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MenuItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 0.9rem;
  border-radius: 0.9rem;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)')};
  color: ${(p) => p.theme.textColor};
  font-size: 0.92rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;

  svg { flex-shrink: 0; font-size: 1.1rem; opacity: 0.75; }

  &:hover { background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)')}; }
`;

const EntryModeSwitch = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const EntryModeButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.7rem;
  border: 1.5px solid ${p => p.$active ? p.theme.buttonBackgroundColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')};
  background: ${p => p.$active ? `${p.theme.buttonBackgroundColor}18` : 'transparent'};
  color: ${p => p.$active ? p.theme.buttonBackgroundColor : p.theme.textColor};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  opacity: ${p => p.$active ? 1 : 0.75};
`;

const TypeSwitch = styled.div`
  display: inline-flex;
  border-radius: 0.6rem;
  overflow: hidden;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
  margin-bottom: 0.9rem;
`;

const TypeButton = styled.button`
  border: none;
  padding: 0.4rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: ${p => p.$active ? (p.$income ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)') : 'transparent'};
  color: ${p => p.$active ? (p.$income ? '#22c55e' : '#ef4444') : p.theme.textColor};
  opacity: ${p => p.$active ? 1 : 0.6};
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  opacity: 0.65;
  margin-bottom: 0.35rem;
`;

const AmountWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'};
  border-radius: 0.6rem;
  padding: 0.5rem 0.8rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
  color: ${p => p.theme.textColor};
  margin-bottom: 0.9rem;

  input {
    border: none;
    outline: none;
    background: transparent;
    color: inherit;
    font-size: 1.2rem;
    font-weight: 700;
    width: 100%;
    font-variant-numeric: tabular-nums;
  }
`;

const CategoryFieldWrap = styled.div`
  margin-bottom: 0.9rem;
`;

const SourceSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.9rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'};
  border-radius: 0.6rem;
  padding: 0.5rem 0.7rem;
  font-size: 0.85rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
  color: ${p => p.theme.textColor};
  outline: none;

  &:focus { border-color: ${p => p.theme.buttonBackgroundColor}; }
`;

const NoteToggle = styled.button`
  border: none;
  background: transparent;
  color: ${p => p.theme.textColor};
  opacity: 0.55;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0.2rem;
  margin-bottom: 0.6rem;

  &:hover { opacity: 0.9; }
`;

const NoteInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.9rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
  border-radius: 0.6rem;
  padding: 0.5rem 0.7rem;
  font-size: 0.85rem;
  background: transparent;
  color: ${p => p.theme.textColor};
  outline: none;
`;

const SubmitButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 0.7rem;
  padding: 0.7rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  color: #fff;
  background: ${p => p.$done
    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    : 'linear-gradient(135deg, #079164 0%, #056b4a 100%)'};
  transition: filter 0.15s;

  &:hover:not(:disabled) { filter: brightness(1.08); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const PasteTextarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 5rem;
  resize: vertical;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'};
  border-radius: 0.6rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  font-family: inherit;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
  color: ${p => p.theme.textColor};
  outline: none;
  margin-bottom: 0.6rem;

  &:focus { border-color: ${p => p.theme.buttonBackgroundColor}; }
`;

const PasteHint = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  line-height: 1.4;
  color: ${p => p.theme.textColor};
  opacity: 0.6;

  svg { margin-right: 0.3rem; opacity: 0.8; }
`;

const RecognizeButton = styled.button`
  width: 100%;
  border: 1.5px dashed ${p => p.theme.buttonBackgroundColor};
  border-radius: 0.7rem;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: transparent;
  color: ${p => p.theme.buttonBackgroundColor};
  margin-bottom: 0.5rem;

  &:hover:not(:disabled) { background: ${p => p.theme.buttonBackgroundColor}10; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const ParseFeedback = styled.p`
  margin: 0 0 0.9rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${p => p.$found ? '#22c55e' : '#f59e0b'};
`;

const sanitizeAmount = (raw) => {
  let cleaned = String(raw).replace(/,/g, '.').replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot !== -1) cleaned = cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, '');
  return cleaned;
};

// Local date, NOT toISOString().split (UTC-midnight bug, see CLAUDE.md)
const todayLocalISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function QuickAddTransaction({ theme }) {
  const { translations } = useContext(LanguageContext);
  const { currencySymbol, toEUR } = useContext(CurrencyContext);
  const { userData, handleSetIsUpdated, addCustomCategory } = useContext(UserContext) || {};
  const { showError, showWarning } = useToast();
  const { financeService, investmentService, liquidityAccountService } = useDemoServices();

  const t = translations?.dashboard?.quickAdd || {};

  /** Tapping the Fab opens this small action menu first (manual entry / CSV
   * import outflows-income / CSV import investments) - picking "manual entry"
   * closes it and opens `open` below, unchanged from before this menu existed. */
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDataImport, setShowDataImport] = useState(false);
  const [showInvestmentImport, setShowInvestmentImport] = useState(false);
  const [open, setOpen] = useState(false);
  const [entryMode, setEntryMode] = useState('manual'); // 'manual' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [parseFeedback, setParseFeedback] = useState(null); // { found: boolean, message: string } | null

  const [isOutflow, setIsOutflow] = useState(true);
  const [amount, setAmount] = useState('');
  const [categoryIndex, setCategoryIndex] = useState('');
  const [userCategoryId, setUserCategoryId] = useState(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('');
  const [investmentHoldings, setInvestmentHoldings] = useState([]);
  const [liquidityAccounts, setLiquidityAccounts] = useState([]);

  useEffect(() => {
    investmentService.getHoldings().then((holdings) => setInvestmentHoldings(Array.isArray(holdings) ? holdings : []));
    liquidityAccountService.getAccounts().then((accounts) => setLiquidityAccounts(Array.isArray(accounts) ? accounts : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional "which account" selector — same concept as InsertValues.tsx's
  // getBalanceSourceEntries, reimplemented independently (see file doc comment).
  const sourceEntries = useMemo(() => {
    const entries = ASSET_KEYS
      .map((key) => ({ label: translations?.assets?.[key] || key, assetKey: key, detailType: null, detailId: null }));
    const seen = new Set(entries.map((e) => e.label));
    const addEntry = (entry) => {
      if (!entry.label || seen.has(entry.label)) return;
      seen.add(entry.label);
      entries.push(entry);
    };
    liquidityAccounts.forEach((account) => {
      if (!account?.assetKey || !account?.label) return;
      addEntry({
        label: `${translations?.assets?.[account.assetKey] || account.assetKey} / ${account.label}`,
        assetKey: account.assetKey,
        detailType: 'liquidity',
        detailId: account.id,
      });
    });
    investmentHoldings.forEach((holding) => {
      // A "closed" holding (fully sold) is never deleted, just set to quantity
      // 0 (see closeStaleHolding.ts) - excluded here since this is an insert-
      // only flow (no edit/delete-existing-transaction path in this component,
      // unlike InsertValues.tsx's getBalanceSourceEntries), so there's no
      // historical-resolution reason to keep it selectable.
      if (!holding?.assetKey || (holding.quantity ?? 0) <= 0) return;
      const detailLabel = holding?.instrument?.symbol || holding?.instrument?.name || holding?.notes || `#${holding?.id}`;
      addEntry({
        label: `${translations?.assets?.[holding.assetKey] || holding.assetKey} / ${detailLabel}`,
        assetKey: holding.assetKey,
        detailType: 'investment',
        detailId: holding.id,
      });
    });
    return entries;
  }, [translations, liquidityAccounts, investmentHoldings]);

  const sourceMeta = useMemo(
    () => Object.fromEntries(sourceEntries.map((entry) => [entry.label, entry])),
    [sourceEntries],
  );

  const tags = useMemo(
    () => (isOutflow ? getOutflowsTags(userData) : getIncomesTags(userData)),
    [userData, isOutflow],
  );
  const customCategories = useMemo(() => getCustomCategories(userData), [userData]);
  const singlePaymentIndex = useMemo(() => {
    const paymentTags = getPaymentTags(userData);
    return paymentTags.find((tag) => tag.label === 'single payment')?.index ?? 1;
  }, [userData]);

  const amountNumber = Number(amount) || 0;
  const canSubmit = amountNumber > 0 && categoryIndex !== '' && !submitting;
  // Mobile keyboards show their own mic button next to any text field; desktop
  // needs a different hint (OS-level dictation shortcut) since there's no such button.
  const isMobilePlatform = useMemo(() => {
    const platform = detectPlatform();
    return platform === 'ios' || platform === 'android';
  }, []);

  const resetCategory = () => { setCategoryIndex(''); setUserCategoryId(null); };

  const resetAndClose = () => {
    setOpen(false);
    setEntryMode('manual');
    setPasteText('');
    setParseFeedback(null);
    setShowNote(false);
  };

  const handleRecognize = () => {
    const result = parseSmartPasteText(pasteText);
    if (result.isIncome !== null) setIsOutflow(!result.isIncome);
    if (result.amount !== null) setAmount(String(result.amount));
    if (result.categoryIndex !== null) { setCategoryIndex(result.categoryIndex); setUserCategoryId(null); }

    if (result.amount === null && result.categoryIndex === null) {
      setParseFeedback({ found: false, message: t.pasteNotFound || 'Non ho trovato importo o categoria — inseriscili qui sotto.' });
    } else {
      setParseFeedback({ found: true, message: t.pasteFound || 'Trovato! Controlla i campi e conferma.' });
    }
    setEntryMode('manual');
  };

  // Applies the signed EUR delta (current month only, quick-add is always "today")
  // to whichever balance source was picked — base asset, a liquidity sub-account,
  // or an investment holding. Best-effort: logged but never blocks the already-
  // successful transaction insert.
  const applySourceDelta = async (source, deltaEUR) => {
    if (!source || !deltaEUR) return;
    try {
      if (source.detailType === 'liquidity') {
        const account = liquidityAccounts.find((item) => item.id === source.detailId);
        if (!account) return;
        const newValue = (Number(account.currentValue) || 0) + deltaEUR;
        await liquidityAccountService.saveAccount({
          id: account.id,
          asset_key: account.assetKey,
          label: account.label,
          current_value: newValue,
          currency: account.currency,
          notes: account.notes,
        });
        // Negative balances are allowed (real overdrafts happen), but it's more often
        // a sign the account wasn't kept up to date — nudge the user, don't block them.
        if (newValue < 0) {
          const warning = (translations.insert.warnings?.negativeAccountBalance || '')
            .replace('{account}', account.label);
          if (warning) showWarning(warning, 6000);
        }
        return;
      }
      if (source.detailType === 'investment') {
        const holding = investmentHoldings.find((item) => item.id === source.detailId);
        if (!holding?.instrument?.id) return;
        const holdingValue = holding.currentValue ?? holding.investedAmount ?? 0;
        await investmentService.saveHolding({
          id: holding.id,
          instrument_id: holding.instrument.id,
          asset_key: holding.assetKey,
          position_type: holding.positionType,
          quantity: holding.quantity,
          average_price: holding.averagePrice,
          current_value: holdingValue + deltaEUR,
          invested_amount: holding.investedAmount,
          currency: holding.currency,
          notes: holding.notes,
        });
        return;
      }
      const balancePayload = buildSnapshotWithDeltas(todayLocalISO(), getCurrentBalance(userData), { [source.assetKey]: deltaEUR });
      await financeService.addBalance(balancePayload);
    } catch (error) {
      console.error('Quick add: failed to apply balance source delta', error);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const source = sourceMeta[sourceLabel] || null;
      const response = await financeService.addExpenseOrIncome({
        expense: {
          date: todayLocalISO(),
          amount: toEUR(amountNumber),
          is_expense: isOutflow,
          payment_type: isOutflow ? singlePaymentIndex : 0,
          category_tag: categoryIndex,
          user_category_id: userCategoryId,
          notes: note,
          balance_source: source ? { asset_key: source.assetKey, detail_type: source.detailType, detail_id: source.detailId } : null,
        },
      });
      if (response.status === 200) {
        if (source) {
          const deltaEUR = toEUR(amountNumber) * (isOutflow ? -1 : 1);
          await applySourceDelta(source, deltaEUR);
        }
        setJustAdded(true);
        handleSetIsUpdated?.(false); // triggers the userData refetch
        setTimeout(() => {
          setJustAdded(false);
          resetAndClose();
          setAmount('');
          resetCategory();
          setNote('');
        }, 900);
      } else {
        showError(isOutflow ? translations.insert.errors.outflowAddFailed : translations.insert.errors.incomeAddFailed);
      }
    } catch (error) {
      console.error('Quick add failed:', error);
      showError(isOutflow ? translations.insert.errors.outflowAddFailed : translations.insert.errors.incomeAddFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Fab
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label={t.title || 'Aggiunta rapida'}
        data-umami-event="quickAddFabOpen"
      >
        <FontAwesomeIcon icon={faPlus} />
      </Fab>

      {menuOpen && (
        <Overlay onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}>
          <Popup theme={theme}>
            <HeaderRow>
              <Title theme={theme}>{t.menuTitle || 'Cosa vuoi fare?'}</Title>
              <CloseBtn theme={theme} onClick={() => setMenuOpen(false)} aria-label={translations?.general?.close || 'Chiudi'}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseBtn>
            </HeaderRow>
            <MenuList>
              <MenuItemButton type="button" theme={theme} onClick={() => { setMenuOpen(false); setOpen(true); }}>
                <FontAwesomeIcon icon={faPencil} />
                {t.menuManual || 'Inserisci manualmente'}
              </MenuItemButton>
              <MenuItemButton type="button" theme={theme} onClick={() => { setMenuOpen(false); setShowDataImport(true); }}>
                <FontAwesomeIcon icon={faFileImport} />
                {t.menuImportOutflowsIncome || 'Importa CSV — spese/entrate'}
              </MenuItemButton>
              <MenuItemButton type="button" theme={theme} onClick={() => { setMenuOpen(false); setShowInvestmentImport(true); }}>
                <FontAwesomeIcon icon={faChartLine} />
                {t.menuImportInvestments || 'Importa investimenti da CSV'}
              </MenuItemButton>
            </MenuList>
          </Popup>
        </Overlay>
      )}

      {showDataImport && (
        <Suspense fallback={null}>
          <ModalOverlay theme={theme} onClick={() => setShowDataImport(false)}>
            <ModalContainer theme={theme} $maxWidth="960px" onClick={(e) => e.stopPropagation()}>
              <ModalHeader theme={theme}>
                <ModalTitle theme={theme}>
                  <h2>{t.menuImportOutflowsIncome || 'Importa CSV — spese/entrate'}</h2>
                </ModalTitle>
                <CloseButton theme={theme} onClick={() => setShowDataImport(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseButton>
              </ModalHeader>
              <ModalBody theme={theme}>
                <DataImportWizard
                  onClose={() => setShowDataImport(false)}
                  onImportComplete={() => { setShowDataImport(false); handleSetIsUpdated?.(false); }}
                />
              </ModalBody>
            </ModalContainer>
          </ModalOverlay>
        </Suspense>
      )}

      {showInvestmentImport && (
        <Suspense fallback={null}>
          <InvestmentImportWizard
            onClose={() => setShowInvestmentImport(false)}
            onImported={async () => { setShowInvestmentImport(false); handleSetIsUpdated?.(false); }}
          />
        </Suspense>
      )}

      {open && (
        <Overlay onClick={(e) => { if (e.target === e.currentTarget) resetAndClose(); }}>
          <Popup theme={theme}>
            <HeaderRow>
              <Title theme={theme}>{t.title || 'Aggiunta rapida'}</Title>
              <CloseBtn theme={theme} onClick={resetAndClose} aria-label={translations?.general?.close || 'Chiudi'}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseBtn>
            </HeaderRow>

            <EntryModeSwitch>
              <EntryModeButton
                type="button"
                theme={theme}
                $active={entryMode === 'manual'}
                onClick={() => setEntryMode('manual')}
              >
                <FontAwesomeIcon icon={faKeyboard} />
                {t.manualMode || 'Manuale'}
              </EntryModeButton>
              <EntryModeButton
                type="button"
                theme={theme}
                $active={entryMode === 'paste'}
                onClick={() => setEntryMode('paste')}
              >
                <FontAwesomeIcon icon={faCommentDots} />
                {t.pasteMode || 'Testo o voce'}
              </EntryModeButton>
            </EntryModeSwitch>

            {entryMode === 'paste' ? (
              <>
                <PasteHint theme={theme}>
                  {isMobilePlatform
                    ? (t.pasteHint || 'Scrivi o incolla una frase, oppure usa il microfono della tastiera del telefono per dettarla. Es. "24,90 spesa al supermercato". Tutto resta sul tuo dispositivo.')
                    : (t.pasteHintDesktop || 'Scrivi o incolla una frase, oppure usa la dettatura vocale del tuo sistema (Win+H su Windows, doppio tap su Fn su Mac). Es. "24,90 spesa al supermercato". Tutto resta sul tuo dispositivo.')}
                </PasteHint>
                <PasteTextarea
                  theme={theme}
                  autoFocus
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={isMobilePlatform
                    ? (t.pastePlaceholder || 'Es. "40 euro benzina" oppure detta col microfono della tastiera...')
                    : (t.pastePlaceholderDesktop || 'Es. "40 euro benzina" oppure detta con la dettatura vocale del sistema...')}
                />
                <RecognizeButton
                  type="button"
                  theme={theme}
                  onClick={handleRecognize}
                  disabled={!pasteText.trim()}
                >
                  <FontAwesomeIcon icon={faMagic} />
                  {t.recognizeButton || 'Riconosci'}
                </RecognizeButton>
              </>
            ) : (
              <>
                {parseFeedback && (
                  <ParseFeedback $found={parseFeedback.found}>{parseFeedback.message}</ParseFeedback>
                )}

                <TypeSwitch theme={theme}>
                  <TypeButton
                    type="button"
                    theme={theme}
                    $active={isOutflow}
                    onClick={() => { setIsOutflow(true); resetCategory(); }}
                  >
                    {t.outflow || translations?.general?.outflows || 'Uscita'}
                  </TypeButton>
                  <TypeButton
                    type="button"
                    theme={theme}
                    $active={!isOutflow}
                    $income
                    onClick={() => { setIsOutflow(false); resetCategory(); }}
                  >
                    {t.income || translations?.general?.incomes || 'Entrata'}
                  </TypeButton>
                </TypeSwitch>

                <FieldLabel theme={theme}>{t.amountLabel || 'Importo'}</FieldLabel>
                <AmountWrap theme={theme}>
                  <span>{currencySymbol}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    aria-label={t.amountLabel || 'Importo'}
                    onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                  />
                </AmountWrap>

                <FieldLabel theme={theme}>{translations?.general?.category || 'Categoria'}</FieldLabel>
                <CategoryFieldWrap>
                  <CategoryPicker
                    theme={theme}
                    officialTags={tags}
                    customCategories={customCategories}
                    categoryType={isOutflow ? 'expense' : 'income'}
                    categoryKey={categoryIndex}
                    userCategoryId={userCategoryId}
                    onSelect={({ categoryKey, userCategoryId: selectedUserCategoryId }) => {
                      setCategoryIndex(categoryKey);
                      setUserCategoryId(selectedUserCategoryId);
                    }}
                    onCreateCategory={(parentIndex, label) =>
                      addCustomCategory({ label, parent_index: parentIndex, is_expense: isOutflow })
                    }
                    placeholder={translations?.insert?.outflowSection?.placeholderCategory || 'Seleziona una categoria'}
                  />
                </CategoryFieldWrap>

                <FieldLabel theme={theme}>{t.sourceLabel || 'Conto (opzionale)'}</FieldLabel>
                <SourceSelect
                  theme={theme}
                  value={sourceLabel}
                  onChange={(e) => setSourceLabel(e.target.value)}
                >
                  <option value="">{t.sourceNone || 'Nessuno'}</option>
                  {sourceEntries.map((entry) => (
                    <option key={entry.label} value={entry.label}>{entry.label}</option>
                  ))}
                </SourceSelect>

                <NoteToggle type="button" theme={theme} onClick={() => setShowNote((v) => !v)}>
                  + {t.note || 'nota'}
                </NoteToggle>

                {showNote && (
                  <NoteInput
                    theme={theme}
                    maxLength={64}
                    placeholder={t.notePlaceholder || 'Nota (opzionale)'}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                  />
                )}

                <SubmitButton
                  type="button"
                  $done={justAdded}
                  disabled={!canSubmit && !justAdded}
                  onClick={handleSubmit}
                  data-umami-event="quickAddTransaction"
                >
                  <FontAwesomeIcon icon={justAdded ? faCheck : faPlus} />
                  {justAdded ? (t.added || 'Aggiunta!') : (t.add || 'Aggiungi')}
                </SubmitButton>
              </>
            )}
          </Popup>
        </Overlay>
      )}
    </>
  );
}

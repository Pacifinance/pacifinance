/**
 * QuickAddTransaction — floating action button that opens a popup to record
 * an outflow or income in seconds: amount + category, everything else
 * optional. Two entry modes inside the popup:
 *   - Manuale: the same minimal fields (category pills + amount) as before.
 *   - Testo o voce: paste free text, or dictate it via the device keyboard's
 *     own microphone button, and a client-side parser (smartPasteParser.ts)
 *     guesses the amount + category. Nothing is ever sent anywhere for this —
 *     no speech-to-text API, no OCR — it's plain regex + keyword matching
 *     running in the browser. The guess always lands back in the editable
 *     manual fields for the user to confirm before saving.
 *
 * Deliberately minimal (Fase 1 — insertion friction): date is always today,
 * payment type defaults to "single payment" for outflows, no balance source.
 * Anything richer belongs to the full insert page, linked contextually.
 */
import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck, faTimes, faKeyboard, faCommentDots, faMagic } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { useDemoServices } from '../hooks/useDemoServices';
import { getOutflowsTags, getIncomesTags, getPaymentTags } from '../utils/userDataSelectors';
import { translateTag } from '../data/tagTranslations';
import { getCategoryColor } from '../data/categoryColors';
import { parseSmartPasteText } from '../utils/smartPasteParser';

/* Sits above the BuyMeACoffee floating widget (#bmc-wbtn, see src/index.css)
 * and the mobile BottomNavBar — offsets are hand-tuned, not pixel-derived. */
const Fab = styled.button`
  position: fixed;
  right: 1.25rem;
  bottom: 5.6rem;
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
    bottom: 8.8rem;
    right: 1rem;
    width: 3.1rem;
    height: 3.1rem;
    font-size: 1.15rem;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
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
  background: ${p => p.theme.componentBackground || (p.theme.mode === 'dark' ? '#15171c' : '#fff')};
  border-radius: 1.25rem 1.25rem 0 0;
  padding: 1.1rem 1.25rem 1.4rem;
  box-shadow: 0 -8px 30px rgba(0,0,0,0.25);

  @media (min-width: 640px) {
    border-radius: 1.25rem;
    margin-bottom: 2rem;
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

const CategoryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.9rem;
`;

const CategoryPill = styled.button`
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  border: 1.5px solid ${p => p.$active ? p.$color : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)')};
  background: ${p => p.$active ? `${p.$color}22` : 'transparent'};
  color: ${p => p.$active ? p.$color : p.theme.textColor};
  opacity: ${p => p.$active ? 1 : 0.75};
  transition: all 0.12s ease;

  &:hover { opacity: 1; }
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
  const { language, translations } = useContext(LanguageContext);
  const { currencySymbol, toEUR } = useContext(CurrencyContext);
  const { userData, handleSetIsUpdated } = useContext(UserContext) || {};
  const { showError } = useToast();
  const { financeService } = useDemoServices();

  const t = translations?.dashboard?.quickAdd || {};

  const [open, setOpen] = useState(false);
  const [entryMode, setEntryMode] = useState('manual'); // 'manual' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [parseFeedback, setParseFeedback] = useState(null); // { found: boolean, message: string } | null

  const [isOutflow, setIsOutflow] = useState(true);
  const [amount, setAmount] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const tags = useMemo(
    () => (isOutflow ? getOutflowsTags(userData) : getIncomesTags(userData)),
    [userData, isOutflow],
  );
  const singlePaymentIndex = useMemo(() => {
    const paymentTags = getPaymentTags(userData);
    return paymentTags.find((tag) => tag.label === 'single payment')?.index ?? 1;
  }, [userData]);

  const amountNumber = Number(amount) || 0;
  const canSubmit = amountNumber > 0 && categoryIndex !== null && !submitting;
  const tagType = isOutflow ? 'expense' : 'income';

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
    if (result.categoryIndex !== null) setCategoryIndex(result.categoryIndex);

    if (result.amount === null && result.categoryIndex === null) {
      setParseFeedback({ found: false, message: t.pasteNotFound || 'Non ho trovato importo o categoria — inseriscili qui sotto.' });
    } else {
      setParseFeedback({ found: true, message: t.pasteFound || 'Trovato! Controlla i campi e conferma.' });
    }
    setEntryMode('manual');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const response = await financeService.addExpenseOrIncome({
        expense: {
          date: todayLocalISO(),
          amount: toEUR(amountNumber),
          is_expense: isOutflow,
          payment_type: isOutflow ? singlePaymentIndex : 0,
          category_tag: categoryIndex,
          user_category_id: null,
          notes: note,
          balance_source: null,
        },
      });
      if (response.status === 200) {
        setJustAdded(true);
        handleSetIsUpdated?.(false); // triggers the userData refetch
        setTimeout(() => {
          setJustAdded(false);
          resetAndClose();
          setAmount('');
          setCategoryIndex(null);
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
        onClick={() => setOpen(true)}
        aria-label={t.title || 'Aggiunta rapida'}
        data-umami-event="quickAddFabOpen"
      >
        <FontAwesomeIcon icon={faPlus} />
      </Fab>

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
                  {t.pasteHint || 'Scrivi o incolla una frase, oppure usa il microfono della tastiera del telefono per dettarla. Es. "24,90 spesa al supermercato". Tutto resta sul tuo dispositivo.'}
                </PasteHint>
                <PasteTextarea
                  theme={theme}
                  autoFocus
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={t.pastePlaceholder || 'Es. "40 euro benzina" oppure detta col microfono della tastiera...'}
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
                    onClick={() => { setIsOutflow(true); setCategoryIndex(null); }}
                  >
                    {t.outflow || translations?.general?.outflows || 'Uscita'}
                  </TypeButton>
                  <TypeButton
                    type="button"
                    theme={theme}
                    $active={!isOutflow}
                    $income
                    onClick={() => { setIsOutflow(false); setCategoryIndex(null); }}
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
                <CategoryGrid>
                  {tags.map((tag) => {
                    const label = translateTag(tag.label, language, tagType);
                    const color = getCategoryColor(label, language);
                    return (
                      <CategoryPill
                        key={tag.index}
                        type="button"
                        theme={theme}
                        $active={categoryIndex === tag.index}
                        $color={color}
                        onClick={() => setCategoryIndex(tag.index)}
                      >
                        {label}
                      </CategoryPill>
                    );
                  })}
                </CategoryGrid>

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

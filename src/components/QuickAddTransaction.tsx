/**
 * QuickAddTransaction — dashboard widget to record an outflow or income in
 * under 10 seconds: amount + category, everything else optional.
 *
 * Deliberately minimal (Fase 1 — insertion friction): date is always today,
 * payment type defaults to "single payment" for outflows, no balance source.
 * Anything richer belongs to the full insert page, linked contextually.
 */
import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { useDemoServices } from '../hooks/useDemoServices';
import { getOutflowsTags, getIncomesTags, getPaymentTags } from '../utils/userDataSelectors';
import { translateTag } from '../data/tagTranslations';
import { getCategoryColor } from '../data/categoryColors';

const Card = styled.div`
  background: ${p => p.theme.componentBackground || (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff')};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  display: flex;
  align-items: center;
  gap: 0.45rem;

  svg { color: #f59e0b; font-size: 0.85rem; }
`;

const ModeSwitch = styled.div`
  display: inline-flex;
  border-radius: 0.6rem;
  overflow: hidden;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
`;

const ModeButton = styled.button`
  border: none;
  padding: 0.35rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  background: ${p => p.$active ? (p.$income ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)') : 'transparent'};
  color: ${p => p.$active ? (p.$income ? '#22c55e' : '#ef4444') : p.theme.textColor};
  opacity: ${p => p.$active ? 1 : 0.6};
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const AmountWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'};
  border-radius: 0.6rem;
  padding: 0.4rem 0.7rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
  color: ${p => p.theme.textColor};

  input {
    border: none;
    outline: none;
    background: transparent;
    color: inherit;
    font-size: 1.05rem;
    font-weight: 600;
    width: 6.5rem;
    font-variant-numeric: tabular-nums;
  }
`;

const CategoryScroller = styled.div`
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding: 0.15rem 0;
  flex: 1;
  min-width: 0;
  scrollbar-width: thin;
`;

const CategoryPill = styled.button`
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
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

const SubmitButton = styled.button`
  border: none;
  border-radius: 0.6rem;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #fff;
  background: ${p => p.$done
    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    : 'linear-gradient(135deg, #079164 0%, #056b4a 100%)'};
  transition: filter 0.15s;

  &:hover:not(:disabled) { filter: brightness(1.08); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const NoteToggle = styled.button`
  border: none;
  background: transparent;
  color: ${p => p.theme.textColor};
  opacity: 0.55;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0.2rem;

  &:hover { opacity: 0.9; }
`;

const NoteInput = styled.input`
  width: 100%;
  margin-top: 0.55rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
  border-radius: 0.6rem;
  padding: 0.45rem 0.7rem;
  font-size: 0.85rem;
  background: transparent;
  color: ${p => p.theme.textColor};
  outline: none;
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

  const [mode, setMode] = useState('outflow');
  const [amount, setAmount] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutflow = mode === 'outflow';
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
        setAmount('');
        setNote('');
        setShowNote(false);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
        handleSetIsUpdated?.(false); // triggers the userData refetch
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

  const tagType = isOutflow ? 'expense' : 'income';

  return (
    <Card theme={theme}>
      <HeaderRow>
        <Title theme={theme}>
          <FontAwesomeIcon icon={faBolt} />
          {t.title || 'Aggiunta rapida'}
        </Title>
        <ModeSwitch theme={theme}>
          <ModeButton
            type="button"
            theme={theme}
            $active={isOutflow}
            onClick={() => { setMode('outflow'); setCategoryIndex(null); }}
          >
            {t.outflow || translations?.general?.outflows || 'Uscita'}
          </ModeButton>
          <ModeButton
            type="button"
            theme={theme}
            $active={!isOutflow}
            $income
            onClick={() => { setMode('income'); setCategoryIndex(null); }}
          >
            {t.income || translations?.general?.incomes || 'Entrata'}
          </ModeButton>
        </ModeSwitch>
      </HeaderRow>

      <InputRow>
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

        <CategoryScroller>
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
        </CategoryScroller>

        <NoteToggle type="button" theme={theme} onClick={() => setShowNote((v) => !v)}>
          + {t.note || 'nota'}
        </NoteToggle>

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
      </InputRow>

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
    </Card>
  );
}

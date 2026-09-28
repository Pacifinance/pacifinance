import { useCallback, useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import {
  getExpensesArray, getMonthlySpendingLimit, isMonthlySpendingLimitAlertEnabled,
} from '../utils/userDataSelectors';
import {
  isInCurrentMonth, isLimitAlertMuted, muteLimitAlertForMonth, shouldAlertSpendingLimit,
} from '../utils/spendingLimitAlert';

interface SpendingLimitCheck {
  /** Amount of the expense just saved, in EUR (what counts toward the limit). */
  amountEUR: number;
  /** Transaction date "YYYY-MM-DD" — only current-month expenses count. */
  date: string;
}

/**
 * Call right after an expense (purpose "expense") is saved. Uses the
 * pre-save month total from userData (not yet refreshed at that point), so
 * previous + amount is the new total. See utils/spendingLimitAlert.ts for
 * when it fires.
 */
export function useSpendingLimitAlert() {
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { userData } = useContext(UserContext) || {};
  const { showWarning } = useToast();

  return useCallback(({ amountEUR, date }: SpendingLimitCheck) => {
    if (!userData || !isMonthlySpendingLimitAlertEnabled(userData)) return;
    if (!isInCurrentMonth(date) || isLimitAlertMuted()) return;
    const limit = getMonthlySpendingLimit(userData);
    const previousTotal = Number(getExpensesArray(userData)?.[0]) || 0;
    const newTotal = previousTotal + (Number(amountEUR) || 0);
    if (!shouldAlertSpendingLimit(previousTotal, newTotal, limit)) return;

    const t = translations?.insert?.limitAlert || {};
    const message = (t.message || '')
      .replace('{total}', formatAmount(newTotal))
      .replace('{limit}', formatAmount(limit))
      .replace('{over}', formatAmount(newTotal - limit));
    if (!message) return;
    showWarning(message, 9000, {
      label: t.muteForMonth,
      onClick: () => muteLimitAlertForMonth(),
    });
  }, [userData, translations, formatAmount, showWarning]);
}

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import {
  getEntriesForMonthKey,
  getCategoryBreakdownForEntries,
  indexToMonthKey,
} from '../utils/userDataSelectors';
import { resolveTagKeyFromLocalized, translateTag } from '../data/tagTranslations';
import { compactNumber } from '../utils/customGraphsInfo.jsx';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, FieldLabel, FieldInput,
} from './multiInsert/SharedStyles';

// UI accent colors for "which month" in the comparison chart/table — not asset/category
// colors (those stay centralized in src/data/categoryColors.js), just two fixed, distinct
// series colors for a two-month comparison view.
const MONTH_A_COLOR = '#6c5ce7'; // matches the ETF/Investimenti purple used elsewhere
const monthBColor = (theme) => theme.buttonBackgroundColor || '#079164';

/**
 * Modal comparing category breakdowns between two arbitrary months (any
 * history, on demand via fetchMonthDetail) as a grouped bar chart + delta
 * table — clearer than comparing two separate pie charts by eye.
 */
function MonthComparisonModal({ theme, userData, isHidden, initialFlow = 'outflows', onClose }) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { fetchMonthDetail } = useContext(UserContext) || {};

  const [flow, setFlow] = useState(initialFlow === 'incomes' ? 'incomes' : 'outflows');
  const [monthA, setMonthA] = useState(indexToMonthKey(1)); // last month
  const [monthB, setMonthB] = useState(indexToMonthKey(0)); // current month
  const [isLoading, setIsLoading] = useState(false);

  const maxMonth = indexToMonthKey(0);
  const minMonth = indexToMonthKey(120);
  const monthBHex = monthBColor(theme);

  const entriesA = getEntriesForMonthKey(userData, monthA, flow);
  const entriesB = getEntriesForMonthKey(userData, monthB, flow);

  useEffect(() => {
    if (!fetchMonthDetail) return;
    const keysToFetch = [...new Set([entriesA === null ? monthA : null, entriesB === null ? monthB : null].filter(Boolean))];
    if (keysToFetch.length === 0) return;
    setIsLoading(true);
    Promise.all(keysToFetch.map((key) => {
      const [y, m] = key.split('-').map(Number);
      return fetchMonthDetail(y, m);
    })).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthA, monthB, flow, entriesA, entriesB]);

  const categoryType = flow === 'incomes' ? 'income' : 'expense';
  const t = translations?.graphs?.statsOutflows?.compareMonthsModal || {};

  const monthLabel = (key) => {
    const [y, m] = key.split('-');
    const names = Object.values(translations?.months || {});
    const label = names[Number(m) - 1] || m;
    return `${label} ${y}`;
  };

  const { chartData, totalA, totalB } = useMemo(() => {
    const breakdownA = entriesA ? getCategoryBreakdownForEntries(entriesA, categoryType) : {};
    const breakdownB = entriesB ? getCategoryBreakdownForEntries(entriesB, categoryType) : {};
    const keys = new Set([...Object.keys(breakdownA), ...Object.keys(breakdownB)]);
    const rows = Array.from(keys).map((key) => {
      const tagLabel = resolveTagKeyFromLocalized(key, 'en', categoryType);
      const translatedName = tagLabel ? translateTag(tagLabel, language, categoryType) : key;
      return {
        key,
        name: translatedName,
        monthA: breakdownA[key]?.amount || 0,
        monthB: breakdownB[key]?.amount || 0,
      };
    })
      .filter((row) => row.monthA > 0 || row.monthB > 0)
      .sort((a, b) => (b.monthA + b.monthB) - (a.monthA + a.monthB));

    return {
      chartData: rows,
      totalA: rows.reduce((s, r) => s + r.monthA, 0),
      totalB: rows.reduce((s, r) => s + r.monthB, 0),
    };
  }, [entriesA, entriesB, categoryType, language]);

  return (
    <Overlay theme={theme} onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <ModalContainer theme={theme} $maxWidth="900px">
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.title || 'Confronto tra mesi'}</h2>
            <p>{t.subtitle || 'Confronta le categorie di due mesi diversi'}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose} aria-label={t.close || 'Chiudi'}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            {[
              { key: 'outflows', label: translations.general.outflows },
              { key: 'incomes', label: translations.general.incomes },
            ].map((option) => {
              const active = flow === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFlow(option.key)}
                  style={{
                    border: `1px solid ${active ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)')}`,
                    borderRadius: 999,
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: active ? theme.buttonBackgroundColor : 'transparent',
                    color: active ? '#fff' : theme.textColor,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 160px' }}>
              <FieldLabel theme={theme}>{t.monthA || 'Mese A'}</FieldLabel>
              <FieldInput
                theme={theme}
                type="month"
                value={monthA}
                min={minMonth}
                max={maxMonth}
                onChange={(e) => e.target.value && setMonthA(e.target.value)}
                style={{ colorScheme: theme.mode === 'dark' ? 'dark' : 'light' }}
              />
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <FieldLabel theme={theme}>{t.monthB || 'Mese B'}</FieldLabel>
              <FieldInput
                theme={theme}
                type="month"
                value={monthB}
                min={minMonth}
                max={maxMonth}
                onChange={(e) => e.target.value && setMonthB(e.target.value)}
                style={{ colorScheme: theme.mode === 'dark' ? 'dark' : 'light' }}
              />
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: theme.textColor, opacity: 0.6 }}>
              {translations?.graphs?.loading?.incomeOutflow || 'Caricamento...'}
            </div>
          ) : chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: theme.textColor, opacity: 0.6 }}>
              {t.noData || 'Nessun dato per i mesi selezionati'}
            </div>
          ) : (
            <>
              <div style={{ width: '100%', height: Math.max(220, chartData.length * 34) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: theme.textColor, fontSize: 11 }}
                      tickFormatter={(v) => (isHidden ? '****' : compactNumber(v))}
                    />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: theme.textColor, fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        isHidden ? '****' : formatAmount(value, { maximumFractionDigits: 0 }),
                        name === 'monthA' ? monthLabel(monthA) : monthLabel(monthB),
                      ]}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 12, color: '#333' }}
                    />
                    <Legend formatter={(value) => (value === 'monthA' ? monthLabel(monthA) : monthLabel(monthB))} wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="monthA" fill={MONTH_A_COLOR} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="monthB" fill={monthBHex} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                      <th style={{ textAlign: 'left', padding: '0.4rem 0.3rem', color: theme.textColor, opacity: 0.6, fontWeight: 600 }}>{t.category || 'Categoria'}</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem 0.3rem', color: MONTH_A_COLOR, fontWeight: 600 }}>{monthLabel(monthA)}</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem 0.3rem', color: monthBHex, fontWeight: 600 }}>{monthLabel(monthB)}</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem 0.3rem', color: theme.textColor, opacity: 0.6, fontWeight: 600 }}>{t.delta || 'Δ'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row) => {
                      const delta = row.monthB - row.monthA;
                      const deltaPct = row.monthA > 0 ? (delta / row.monthA) * 100 : null;
                      const isBad = flow === 'outflows' ? delta > 0 : delta < 0;
                      const deltaColor = delta === 0 ? theme.textColor : (isBad ? '#e74c3c' : '#27ae60');
                      return (
                        <tr key={row.key} style={{ borderBottom: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` }}>
                          <td style={{ padding: '0.4rem 0.3rem', color: theme.textColor }}>{row.name}</td>
                          <td style={{ padding: '0.4rem 0.3rem', textAlign: 'right', color: theme.textColor }}>{isHidden ? '****' : formatAmount(row.monthA, { maximumFractionDigits: 0 })}</td>
                          <td style={{ padding: '0.4rem 0.3rem', textAlign: 'right', color: theme.textColor }}>{isHidden ? '****' : formatAmount(row.monthB, { maximumFractionDigits: 0 })}</td>
                          <td style={{ padding: '0.4rem 0.3rem', textAlign: 'right', color: deltaColor, fontWeight: 600 }}>
                            {isHidden ? '****' : `${delta >= 0 ? '+' : ''}${formatAmount(delta, { maximumFractionDigits: 0 })}${deltaPct !== null ? ` (${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(0)}%)` : ''}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: '0.5rem 0.3rem', fontWeight: 700, color: theme.textColor }}>{t.total || 'Totale'}</td>
                      <td style={{ padding: '0.5rem 0.3rem', textAlign: 'right', fontWeight: 700, color: theme.textColor }}>{isHidden ? '****' : formatAmount(totalA, { maximumFractionDigits: 0 })}</td>
                      <td style={{ padding: '0.5rem 0.3rem', textAlign: 'right', fontWeight: 700, color: theme.textColor }}>{isHidden ? '****' : formatAmount(totalB, { maximumFractionDigits: 0 })}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
}

export default React.memo(MonthComparisonModal);

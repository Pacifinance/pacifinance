/**
 * SharedExpensesPanel — view and settle "credito verso terzi" receivables
 * created when the user paid for a group (e.g. Uber/dinner) and only their
 * own share was recorded as a real outflow (see OutflowSection's "Ho pagato
 * per il gruppo" toggle). Settling a receivable never creates an income
 * record — money coming back is a balance-only event, not real income.
 *
 * Grouped by month (newest first, collapsible) with a filter panel (search,
 * status, date range) — mirrors OutflowSection/IncomeSection's list filter
 * pattern (FilterToggleRow/FilterPanel/FilterRow) for consistency.
 */
import React, { useContext, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faCheck, faFilter, faSortUp, faSortDown, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody,
} from '../components/multiInsert/SharedStyles';
import {
  EmptyState, Row, RowInfo, RowAmount, RowActions, FormSection, FieldsGrid, FooterRow, SecondaryButton,
  MonthGroupHeader, StatusSelect,
} from '../components/SharedExpensesPanelStyles';
import {
  FilterToggleRow, FilterBadge, FilterPanel, FilterRow, FilterLabel, FilterInlineRow, ClearFiltersBtn,
} from '../components/transactionList/TransactionListStyles';
import { ModernActionButton } from '../styles/MyStyled';

const monthKeyFor = (isoDate) => (isoDate ? isoDate.slice(0, 7) : 'unknown');

export default function SharedExpensesPanel({ theme, items, onClose, onChanged }) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { sharedExpenseService } = useDemoServices();
  const t = translations?.insert?.sharedExpensesPanel || {};

  const [settlingId, setSettlingId] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [collapsedMonths, setCollapsedMonths] = useState(() => new Set());

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return '';
    const locale = language === 'it' ? 'it-IT' : 'en-US';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMonthLabel = (key) => {
    if (key === 'unknown') return t.unknownMonth || '—';
    const d = new Date(`${key}-01T00:00:00`);
    if (Number.isNaN(d.getTime())) return key;
    const locale = language === 'it' ? 'it-IT' : 'en-US';
    return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  const statusLabel = (status) => {
    if (status === 'settled') return t.statusSettled || 'Recovered';
    if (status === 'partial') return t.statusPartial || 'Partially recovered';
    return t.statusPending || 'Pending';
  };

  const activeFilterCount = [searchFilter, statusFilter, dateFilterStart, dateFilterEnd].filter(Boolean).length;

  const filteredItems = useMemo(() => items.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (searchFilter && !(item.notes || '').toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (dateFilterStart && item.date < dateFilterStart) return false;
    if (dateFilterEnd && item.date > dateFilterEnd) return false;
    return true;
  }), [items, statusFilter, searchFilter, dateFilterStart, dateFilterEnd]);

  const groupedByMonth = useMemo(() => {
    const groups = new Map();
    filteredItems.forEach((item) => {
      const key = monthKeyFor(item.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()]
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
      .map(([key, groupItems]) => ({
        key,
        items: groupItems.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
      }));
  }, [filteredItems]);

  const toggleMonth = (key) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const startSettle = (item) => {
    setSettlingId(item.id);
    setSettleAmount(String((item.receivableAmount - item.settledAmount).toFixed(2)));
  };

  const cancelSettle = () => {
    setSettlingId(null);
    setSettleAmount('');
  };

  const handleConfirmSettle = async (item) => {
    const amount = Number(settleAmount);
    if (!Number.isFinite(amount) || amount <= 0 || saving) return;
    setSaving(true);
    try {
      await sharedExpenseService.settleReceivable({ id: item.id, amount });
      cancelSettle();
      await onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await sharedExpenseService.deleteReceivable({ id });
    if (settlingId === id) cancelSettle();
    await onChanged();
  };

  const renderRow = (item) => {
    const outstanding = item.receivableAmount - item.settledAmount;
    return (
      <Row key={item.id} theme={theme} $paused={item.status === 'settled'}>
        <RowInfo theme={theme}>
          <strong>{item.notes || (t.untitled || 'Group expense')}</strong>
          <span>
            {formatDate(item.date)}
            {' · '}
            {statusLabel(item.status)}
          </span>
        </RowInfo>
        <RowAmount theme={theme} $isExpense={item.status !== 'settled'}>
          {formatAmount(outstanding)}
        </RowAmount>
        <RowActions theme={theme}>
          {item.status !== 'settled' && settlingId !== item.id && (
            <button type="button" onClick={() => startSettle(item)} aria-label={t.markReceived || 'Mark amount received'}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          )}
          <button type="button" onClick={() => handleDelete(item.id)} aria-label={t.deleteButton || 'Delete'}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </RowActions>

        {settlingId === item.id && (
          <FormSection theme={theme} style={{ gridColumn: '1 / -1' }}>
            <FieldsGrid theme={theme}>
              <label>
                {t.amountReceivedLabel || 'Amount received'}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                />
              </label>
            </FieldsGrid>
            <FooterRow>
              <SecondaryButton theme={theme} onClick={cancelSettle}>
                {translations?.general?.cancel || 'Cancel'}
              </SecondaryButton>
              <ModernActionButton theme={theme} onClick={() => handleConfirmSettle(item)} disabled={saving}>
                {t.confirmSettle || 'Confirm'}
              </ModernActionButton>
            </FooterRow>
          </FormSection>
        )}
      </Row>
    );
  };

  return (
    <Overlay theme={theme} onClick={onClose}>
      <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.title || 'Shared expenses'}</h2>
            <p>{t.subtitle || 'Money owed by others for group expenses you fronted'}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          {items.length === 0 && (
            <EmptyState theme={theme}>
              {t.emptyState || 'No shared expenses yet. Check "I paid for the group" when adding an outflow and the receivable will show up here.'}
            </EmptyState>
          )}

          {items.length > 0 && (
            <>
              <FilterToggleRow theme={theme} type="button" onClick={() => setShowFilters((v) => !v)}>
                <span className="filter-toggle-label">
                  <FontAwesomeIcon icon={faFilter} />
                  {translations?.general?.filterTransactions || translations?.general?.filters || 'Filters'}
                  {activeFilterCount > 0 && <FilterBadge theme={theme}>{activeFilterCount}</FilterBadge>}
                </span>
                <FontAwesomeIcon icon={showFilters ? faSortUp : faSortDown} />
              </FilterToggleRow>
              <FilterPanel theme={theme} $open={showFilters}>
                <FilterRow>
                  <FilterLabel theme={theme}>{t.searchLabel || translations?.general?.note || 'Note'}</FilterLabel>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder || translations?.general?.filterByNote || 'Search...'}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </FilterRow>
                <FilterRow>
                  <FilterLabel theme={theme}>{t.statusFilterLabel || 'Status'}</FilterLabel>
                  <StatusSelect
                    theme={theme}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">{translations?.general?.all || 'All'}</option>
                    <option value="pending">{t.statusPending || 'Pending'}</option>
                    <option value="partial">{t.statusPartial || 'Partially recovered'}</option>
                    <option value="settled">{t.statusSettled || 'Recovered'}</option>
                  </StatusSelect>
                </FilterRow>
                <FilterRow>
                  <FilterLabel theme={theme}>{translations?.general?.date || 'Date'}</FilterLabel>
                  <FilterInlineRow>
                    <input
                      type="date"
                      value={dateFilterStart}
                      onChange={(e) => setDateFilterStart(e.target.value)}
                    />
                    <span style={{ fontSize: '0.75em', opacity: 0.7 }}>-</span>
                    <input
                      type="date"
                      value={dateFilterEnd}
                      onChange={(e) => setDateFilterEnd(e.target.value)}
                    />
                  </FilterInlineRow>
                </FilterRow>
                {activeFilterCount > 0 && (
                  <ClearFiltersBtn
                    type="button"
                    onClick={() => {
                      setSearchFilter('');
                      setStatusFilter('');
                      setDateFilterStart('');
                      setDateFilterEnd('');
                    }}
                  >
                    {translations?.general?.clearAllFilters || 'Clear filters'}
                  </ClearFiltersBtn>
                )}
              </FilterPanel>

              {filteredItems.length === 0 && (
                <EmptyState theme={theme}>
                  {t.noMatchingResults || 'No shared expenses match these filters.'}
                </EmptyState>
              )}

              {groupedByMonth.map((group) => {
                const collapsed = collapsedMonths.has(group.key);
                return (
                  <div key={group.key}>
                    <MonthGroupHeader theme={theme} type="button" onClick={() => toggleMonth(group.key)}>
                      <span>
                        {formatMonthLabel(group.key)}
                        <span className="count">({group.items.length})</span>
                      </span>
                      <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronDown} />
                    </MonthGroupHeader>
                    {!collapsed && group.items.map(renderRow)}
                  </div>
                );
              })}
            </>
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
}

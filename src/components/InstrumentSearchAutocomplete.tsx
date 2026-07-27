import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faMagnifyingGlass, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useDemoServices } from '../hooks/useDemoServices';
import { ASSET_KEY_TO_KIND, KIND_TO_SEARCH_SOURCE } from '../constants/investmentSchema';
import { formatInstrumentDetails } from '../utils/instrumentDisplay';
import type { InvestmentAssetKey, InvestmentInstrumentDto } from '../types/api';

// Two-stage debounce: the local catalog (no rate limit, cheap) can be
// queried almost immediately for a snappy feel, but the external provider
// (OpenFIGI/CoinGecko, rate-limited) is only consulted after a longer pause.
// Typing a 12-character ISIN one keystroke at a time otherwise fires a
// provider search on every intermediate fragment ("US0", "US03", ...) —
// each one a wasted call that can exhaust the shared rate-limit budget
// before the complete, valid ISIN is ever actually searched.
const LOCAL_DEBOUNCE_MS = 150;
const PROVIDER_DEBOUNCE_MS = 700;
const MIN_QUERY_LENGTH = 2;

interface InstrumentSearchAutocompleteProps {
  assetKey: InvestmentAssetKey;
  onSelect: (instrument: InvestmentInstrumentDto) => void;
  disabled?: boolean;
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIconWrapper = styled.span`
  position: absolute;
  left: 0.7rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.35;
  font-size: 0.85rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.55rem 0.7rem 0.55rem 2rem;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
  border-radius: 8px;
  color: ${(p) => p.theme.textColor};
  font-size: 0.88rem;
  font-weight: 500;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: ${(p) => p.theme.buttonBackgroundColor};
    box-shadow: 0 0 0 3px ${(p) => p.theme.buttonBackgroundColor}15;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Dropdown = styled.ul`
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.3rem;
  list-style: none;
  max-height: 280px;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#1e293b' : '#ffffff')};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
`;

const DropdownMessage = styled.div`
  padding: 0.6rem 0.7rem;
  font-size: 0.82rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const ResultItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.55rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  color: ${(p) => p.theme.textColor};

  &:hover {
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')};
  }
`;

const ResultInfo = styled.div`
  min-width: 0;
`;

const ResultSymbol = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultName = styled.div`
  font-size: 0.72rem;
  opacity: 0.55;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultDetails = styled.div`
  font-size: 0.66rem;
  opacity: 0.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;

  svg { width: 10px; height: 10px; }
`;

const Attribution = styled.div`
  padding: 0.4rem 0.6rem 0.1rem;
  font-size: 0.65rem;
  opacity: 0.45;
  color: ${(p) => p.theme.textColor};

  a { color: inherit; }
`;

const AddManualButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.55rem 0.6rem;
  margin-top: 0.2rem;
  border: 1px dashed ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : '#cbd5e1')};
  border-radius: 8px;
  background: transparent;
  color: ${(p) => p.theme.textColor};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.85;

  &:hover:not(:disabled) { opacity: 1; }
  &:disabled { cursor: wait; opacity: 0.5; }
`;

const ManualHint = styled.p`
  margin: 0.3rem 0.2rem 0;
  font-size: 0.68rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.55;
`;

export default function InstrumentSearchAutocomplete({ assetKey, onSelect, disabled }: InstrumentSearchAutocompleteProps) {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const { investmentService } = useDemoServices();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<InvestmentInstrumentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [creatingManual, setCreatingManual] = useState(false);
  const localDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const providerDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestIdRef = useRef(0);

  const kind = ASSET_KEY_TO_KIND[assetKey];
  const source = kind ? KIND_TO_SEARCH_SOURCE[kind] : null;
  const t = translations.investments.search;

  useEffect(() => {
    if (localDebounceRef.current) clearTimeout(localDebounceRef.current);
    if (providerDebounceRef.current) clearTimeout(providerDebounceRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH || !kind || !source) {
      setResults([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const trimmedQuery = query.trim();
    setLoading(true);

    const runSearch = (withProvider: boolean) => async () => {
      let found: InvestmentInstrumentDto[] = [];
      try {
        found = await investmentService.searchInstruments({
          query: trimmedQuery, kind, limit: 15, ...(withProvider ? { source } : {}),
        });
      } catch (error) {
        console.error('InstrumentSearchAutocomplete: search request failed', error);
      } finally {
        if (requestIdRef.current === requestId) {
          setResults(found);
          setLoading(false);
        }
      }
    };

    // Fast pass: local catalog only, no provider/rate-limit involved.
    localDebounceRef.current = setTimeout(runSearch(false), LOCAL_DEBOUNCE_MS);
    // Slow pass: only once typing has paused for real — this is the one that
    // may call OpenFIGI/CoinGecko.
    providerDebounceRef.current = setTimeout(runSearch(true), PROVIDER_DEBOUNCE_MS);

    return () => {
      clearTimeout(localDebounceRef.current);
      clearTimeout(providerDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, kind, source]);

  const handleSelect = (instrument: InvestmentInstrumentDto) => {
    onSelect(instrument);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleAddManual = async () => {
    if (!kind || creatingManual) return;
    const trimmed = query.trim();
    if (!trimmed) return;
    setCreatingManual(true);
    try {
      const created = await investmentService.createManualInstrument({
        kind, symbol: trimmed.slice(0, 20).toUpperCase(), name: trimmed, currency: null,
      });
      handleSelect(created);
    } catch (error) {
      console.error('InstrumentSearchAutocomplete: manual instrument creation failed', error);
    } finally {
      setCreatingManual(false);
    }
  };

  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <Wrapper theme={theme}>
      <InputRow>
        <SearchIconWrapper theme={theme}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </SearchIconWrapper>
        <SearchInput
          theme={theme}
          type="text"
          value={query}
          disabled={disabled || !kind}
          placeholder={t.placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </InputRow>

      {showDropdown && (
        <Dropdown theme={theme}>
          {loading && (
            <DropdownMessage theme={theme}>
              <FontAwesomeIcon icon={faSpinner} spin />
              {t.loading}
            </DropdownMessage>
          )}
          {!loading && results.length === 0 && (
            <>
              <DropdownMessage theme={theme}>{t.noResults}</DropdownMessage>
              <AddManualButton
                type="button"
                theme={theme}
                disabled={creatingManual}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleAddManual}
              >
                {creatingManual
                  ? <FontAwesomeIcon icon={faSpinner} spin />
                  : (t.addManual || 'Add "{query}" as unverified').replace('{query}', query.trim())}
              </AddManualButton>
              <ManualHint theme={theme}>{t.addManualHint || "Won't be verified, and won't count toward comparisons with other users."}</ManualHint>
            </>
          )}
          {!loading && results.map((instrument) => (
            <ResultItem
              key={instrument.id}
              theme={theme}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(instrument)}
            >
              <ResultInfo>
                <ResultSymbol>{instrument.symbol}</ResultSymbol>
                <ResultName>{instrument.name}</ResultName>
                {formatInstrumentDetails(instrument) !== '' && (
                  <ResultDetails>{formatInstrumentDetails(instrument)}</ResultDetails>
                )}
              </ResultInfo>
              {instrument.provider !== 'manual' && (
                <VerifiedBadge title={t.provider[instrument.provider] || instrument.provider}>
                  <FontAwesomeIcon icon={faCircleCheck} />
                  {t.verifiedBadge}
                </VerifiedBadge>
              )}
            </ResultItem>
          ))}
          {!loading && source === 'coingecko' && (
            <Attribution theme={theme}>
              <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">
                {translations.investments.attribution.coingecko}
              </a>
            </Attribution>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
}

import styled from 'styled-components';
import { X } from 'lucide-react';
import type { InvestmentDividendSummaryDto, InvestmentHoldingDto } from '../types/api';

interface HoldingAssetDetailsProps {
  holding: InvestmentHoldingDto;
  dividend?: InvestmentDividendSummaryDto;
  formatAmount: (value: number) => string;
  labels: Record<string, string>;
  onClose: () => void;
}

const Panel = styled.aside`
  position: absolute;
  z-index: 8;
  inset: auto 0 0 0;
  margin: 0.75rem;
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.12)'};
  background: ${(p) => p.theme.mode === 'dark' ? 'rgba(30,41,59,.98)' : 'rgba(255,255,255,.98)'};
  color: ${(p) => p.theme.textColor};
  box-shadow: 0 12px 28px rgba(0,0,0,.25);

  header { display: flex; justify-content: space-between; gap: .7rem; }
  h5 { margin: 0; font-size: .92rem; }
  .symbol { opacity: .62; font-size: .72rem; margin-top: .15rem; }
  button { border: 0; background: transparent; color: inherit; cursor: pointer; padding: 2px; }
  dl { display: grid; grid-template-columns: minmax(90px, auto) 1fr; gap: .35rem .65rem; margin: .7rem 0 0; font-size: .75rem; }
  dt { opacity: .6; }
  dd { margin: 0; overflow-wrap: anywhere; }
`;

export default function HoldingAssetDetails({ holding, dividend, formatAmount, labels, onClose }: HoldingAssetDetailsProps) {
  const instrument = holding.instrument;
  const rows = [
    [labels.value, formatAmount(Number(holding.currentValue ?? holding.investedAmount ?? 0))],
    [labels.invested, holding.investedAmount != null ? formatAmount(holding.investedAmount) : null],
    [labels.quantity, holding.quantity],
    [labels.sector, instrument?.sector],
    [labels.industry, instrument?.industry],
    [labels.country, instrument?.country],
    [labels.exchange, instrument?.exchange],
    [labels.isin, instrument?.isin],
    [labels.dividends, dividend ? `${formatAmount(dividend.totalAmount)} · ${dividend.paymentCount} ${labels.payments}` : null],
    [labels.lastDividend, dividend?.lastPaidDate],
    [labels.notes, holding.notes || null],
  ].filter((row) => row[1] !== null && row[1] !== undefined && row[1] !== '');

  return (
    <Panel role="dialog" aria-label={labels.details}>
      <header>
        <div><h5>{instrument?.name || instrument?.symbol || holding.notes}</h5><div className="symbol">{instrument?.symbol} · {labels[holding.assetKey] || holding.assetKey}</div></div>
        <button type="button" onClick={onClose} aria-label={labels.close}><X size={17} /></button>
      </header>
      <dl>{rows.map(([label, value]) => <><dt key={`${label}-label`}>{label}</dt><dd key={`${label}-value`}>{String(value)}</dd></>)}</dl>
    </Panel>
  );
}

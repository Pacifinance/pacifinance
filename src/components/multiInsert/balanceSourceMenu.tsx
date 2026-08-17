/**
 * Shared renderer for the balance-source dropdown options.
 *
 * Detailed sub-account entries (liquidity accounts, investment holdings) are
 * nested under their parent asset instead of being listed as flat
 * "Parent / Detail" rows. The MenuItem VALUES stay the full translated labels
 * already used across insert/edit/delete state — only the presentation is
 * grouped, so no consumer state or payload changes shape.
 *
 * Callers that don't pass `balanceSourceMeta` keep the original flat list.
 */
import React from 'react';
import { MenuItem } from '@mui/material';

export interface BalanceSourceEntryMeta {
  label: string;
  assetKey: string;
  detailType?: 'liquidity' | 'investment';
  detailId?: number;
  /** Fixed denomination (e.g. €8/meal voucher) — set only for liquidity accounts that have one. */
  unitValue?: number | null;
  /** Current EUR balance — only populated for liquidity account entries, used to cap the voucher portion of a split. */
  availableBalance?: number;
  /** Liquidity account id configured as this account's default remainder source. */
  fallbackAccountId?: number | null;
}

export type BalanceSourceMetaMap = Record<string, BalanceSourceEntryMeta>;

export interface StoredBalanceSourceLike {
  balanceAssetKey?: string | null;
  balanceDetailType?: 'liquidity' | 'investment' | null;
  balanceDetailId?: number | null;
}

/**
 * Reverse lookup: from a transaction's stored balance-source fields
 * (balanceAssetKey/balanceDetailType/balanceDetailId, as returned by
 * TransactionDto) back to the translated label used as the Select value in
 * balanceSourceMeta. Falls back from the specific sub-account (it may have
 * been deleted/renamed since) to the parent asset field; returns '' when
 * nothing was stored or nothing matches.
 */
export function resolveBalanceSourceLabel(
  balanceSourceMeta: BalanceSourceMetaMap | null | undefined,
  row: StoredBalanceSourceLike | null | undefined,
): string {
  if (!row?.balanceAssetKey || !balanceSourceMeta) return '';
  const entries = Object.entries(balanceSourceMeta);
  if (row.balanceDetailType && row.balanceDetailId != null) {
    const detail = entries.find(([, meta]) =>
      meta.detailType === row.balanceDetailType &&
      meta.detailId === row.balanceDetailId &&
      meta.assetKey === row.balanceAssetKey);
    if (detail) return detail[0];
  }
  const base = entries.find(([, meta]) => !meta.detailType && meta.assetKey === row.balanceAssetKey);
  return base?.[0] || '';
}

/** Reverse lookup: from a liquidity account id (e.g. a denomination account's configured fallbackAccountId) to its translated balance-source label. */
export function resolveFallbackAccountLabel(
  balanceSourceMeta: BalanceSourceMetaMap | null | undefined,
  fallbackAccountId: number | null | undefined,
): string {
  if (fallbackAccountId == null || !balanceSourceMeta) return '';
  const entry = Object.entries(balanceSourceMeta).find(([, meta]) =>
    meta.detailType === 'liquidity' && meta.detailId === fallbackAccountId);
  return entry?.[0] || '';
}

interface DetailLabelProps {
  parentLabel: string;
  fullLabel: string;
}

/** "Banca / Revolut" rendered with a dimmed parent prefix, so the closed
 * Select still shows the full context while the open menu reads as nested. */
function DetailLabel({ parentLabel, fullLabel }: DetailLabelProps) {
  const prefix = parentLabel + ' / ';
  const detailText = fullLabel.startsWith(prefix) ? fullLabel.slice(prefix.length) : fullLabel;
  return (
    <span>
      <span style={{ opacity: 0.55, fontSize: '0.85em' }}>{parentLabel} / </span>
      {detailText}
    </span>
  );
}

/**
 * Builds the MenuItem list for a balance-source Select: parent assets in
 * their canonical order, each followed by its indented sub-accounts.
 */
export function renderBalanceSourceMenuItems(
  balanceOptions: Record<string, unknown> | null | undefined,
  balanceSourceMeta?: BalanceSourceMetaMap | null,
) {
  const labels = Object.keys(balanceOptions || {});
  if (!balanceSourceMeta) {
    return labels.map((option) => (
      <MenuItem key={option} value={option}>{option}</MenuItem>
    ));
  }

  const baseLabels = labels.filter((label) => !balanceSourceMeta[label]?.detailType);
  const detailLabels = labels.filter((label) => balanceSourceMeta[label]?.detailType);

  const detailsByAssetKey: Record<string, string[]> = {};
  detailLabels.forEach((label) => {
    const assetKey = balanceSourceMeta[label].assetKey;
    if (!detailsByAssetKey[assetKey]) detailsByAssetKey[assetKey] = [];
    detailsByAssetKey[assetKey].push(label);
  });

  const items: React.ReactElement[] = [];
  const renderedDetails = new Set<string>();

  baseLabels.forEach((baseLabel) => {
    items.push(<MenuItem key={baseLabel} value={baseLabel}>{baseLabel}</MenuItem>);
    const assetKey = balanceSourceMeta[baseLabel]?.assetKey;
    (assetKey ? detailsByAssetKey[assetKey] || [] : []).forEach((detailLabel) => {
      renderedDetails.add(detailLabel);
      items.push(
        <MenuItem key={detailLabel} value={detailLabel} sx={{ pl: 4 }}>
          <DetailLabel parentLabel={baseLabel} fullLabel={detailLabel} />
        </MenuItem>,
      );
    });
  });

  // Safety net: details whose parent label isn't among the options stay visible, flat.
  detailLabels
    .filter((label) => !renderedDetails.has(label))
    .forEach((label) => {
      items.push(<MenuItem key={label} value={label}>{label}</MenuItem>);
    });

  return items;
}

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
}

export type BalanceSourceMetaMap = Record<string, BalanceSourceEntryMeta>;

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

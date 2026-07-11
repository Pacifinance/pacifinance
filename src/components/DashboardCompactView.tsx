/**
 * DashboardCompactView Component
 * 
 * Table-based summary view of all dashboard data.
 * Alternative to the card-based layout.
 */

import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { assetColors } from '../data/assetColors';
import { BsArrowUpRight, BsArrowDownLeft, BsWallet2, BsChevronDown } from 'react-icons/bs';
import { GiUmbrella } from 'react-icons/gi';
import { LIQUIDITY_KEYS } from '../constants/balanceSchema';
import { isVerifiableAssetKey } from '../constants/investmentSchema';

const CompactContainer = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${props => props.theme.textColor};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 1rem;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  
  @media (max-width: 768px) {
    border-radius: 0.75rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const Thead = styled.thead`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: ${props => props.$align || 'left'};
  font-weight: 600;
  font-size: 0.8rem;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.6rem;
    font-size: 0.65rem;
  }
`;

const Tr = styled.tr`
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
  transition: background 0.15s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TrTotal = styled(Tr)`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.04)'};
  font-weight: 600;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.06)'};
  }
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  text-align: ${props => props.$align || 'left'};
  color: ${props => props.theme.textColor};
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.6rem;
  }
`;

const AssetNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  
  .icon-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .asset-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    gap: 0.4rem;
    
    .icon-dot {
      width: 8px;
      height: 8px;
    }
    .asset-icon {
      font-size: 0.85rem;
    }
  }
`;

const ValueCell = styled.span`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${props => props.$color || props.theme.textColor};
`;

const PercentageCell = styled.span`
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  background: ${props => props.$color ? `${props.$color}15` : 'transparent'};
  color: ${props => props.$color || 'inherit'};
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.1rem 0.35rem;
  }
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 0.4rem;
  border: none;
  background: transparent;
  color: ${props => props.theme.textColor};
  opacity: 0.5;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 0.75rem;
  transition: transform 0.15s ease, opacity 0.15s ease;
  transform: rotate(${props => (props.$expanded ? '180deg' : '0deg')});

  &:hover {
    opacity: 0.9;
  }
`;

const SubRow = styled(Tr)`
  background: ${props => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)')};

  &:hover {
    background: ${props => (props.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)')};
  }
`;

const SubAssetNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1.6rem;
  font-size: 0.82rem;
  opacity: 0.8;

  @media (max-width: 768px) {
    padding-left: 1.1rem;
    font-size: 0.7rem;
  }
`;

const DashboardCompactView = ({
  theme,
  isHidden,
  traditionalAssets,
  emergencyFundAsset,
  investments,
  incExpData,
  totalBalance,
  totalTraditional,
  totalInvestments,
  totalEmergencySecurity,
  formatCurrency,
  formatPercentage,
  holdingsByAssetKey = {},
  liquidityAccountsByAssetKey = {},
  categoryPreMonthTotals = null,
}) => {
  const { translations } = useContext(LanguageContext);
  useContext(MediaQueryContext);
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  const t = translations?.dashboardLayout || {};

  // Signed percentage change vs previous month, or null when not computable
  // (no previous snapshot). Percent-only: safe to show in privacy mode too.
  const renderPrevMonthDelta = (current, previous) => {
    if (!categoryPreMonthTotals || !previous || previous <= 0) {
      return <span style={{ opacity: 0.4 }}>—</span>;
    }
    const pct = ((current - previous) / previous) * 100;
    const color = pct >= 0 ? '#22c55e' : '#ef4444';
    return (
      <PercentageCell $color={color}>
        {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
      </PercentageCell>
    );
  };

  // All assets for the overview table
  const allAssetRows = [
    ...traditionalAssets.filter(a => a.value > 0).map(a => ({
      ...a,
      category: translations?.dashboard?.liquidity || 'Liquidità',
    })),
    ...(emergencyFundAsset.value > 0 ? [{
      ...emergencyFundAsset,
      category: translations?.dashboard?.emergencySecurity || 'Emergenza',
    }] : []),
    ...investments.map(inv => ({
      ...inv,
      category: translations?.general?.investments || 'Investimenti',
    })),
  ];

  const getSubItemsForAsset = (assetKey) => (
    LIQUIDITY_KEYS.includes(assetKey)
      ? (liquidityAccountsByAssetKey[assetKey] || [])
      : isVerifiableAssetKey(assetKey)
        ? (holdingsByAssetKey[assetKey] || [])
        : []
  );

  const toggleExpanded = (assetKey) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(assetKey)) next.delete(assetKey);
      else next.add(assetKey);
      return next;
    });
  };

  return (
    <CompactContainer>
      {/* Assets Overview Table */}
      <SectionTitle theme={theme}>
        📊 {t.assetOverview || 'Panoramica Asset'}
      </SectionTitle>
      <TableWrapper theme={theme}>
        <Table>
          <Thead theme={theme}>
            <tr>
              <Th theme={theme}>{t.asset || 'Asset'}</Th>
              <Th theme={theme}>{t.category || 'Categoria'}</Th>
              <Th theme={theme} $align="right">{t.value || translations?.general?.value || 'Valore'}</Th>
              <Th theme={theme} $align="right">{t.ofTotal || '% Totale'}</Th>
            </tr>
          </Thead>
          <tbody>
            {allAssetRows.map((asset) => {
              const IconComponent = asset.icon;
              const subItems = isHidden ? [] : getSubItemsForAsset(asset.key);
              const hasSubItems = subItems.length > 0;
              const expanded = expandedKeys.has(asset.key);
              return (
                <React.Fragment key={asset.key}>
                  <Tr theme={theme}>
                    <Td theme={theme}>
                      <AssetNameCell>
                        <div className="icon-dot" style={{ backgroundColor: asset.color }} />
                        {IconComponent && <IconComponent className="asset-icon" style={{ color: asset.color }} />}
                        <span>{isHidden ? '****' : asset.name}</span>
                        {hasSubItems && (
                          <ExpandButton
                            type="button"
                            theme={theme}
                            $expanded={expanded}
                            onClick={() => toggleExpanded(asset.key)}
                            aria-label={expanded
                              ? translations?.insert?.balanceSection?.collapseDetails
                              : translations?.insert?.balanceSection?.expandDetails}
                          >
                            <BsChevronDown />
                          </ExpandButton>
                        )}
                      </AssetNameCell>
                    </Td>
                    <Td theme={theme}>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{asset.category}</span>
                    </Td>
                    <Td theme={theme} $align="right">
                      <ValueCell theme={theme}>{formatCurrency(asset.value)}</ValueCell>
                    </Td>
                    <Td theme={theme} $align="right">
                      <PercentageCell $color={asset.color}>
                        {formatPercentage(asset.value, totalBalance)}
                      </PercentageCell>
                    </Td>
                  </Tr>
                  {hasSubItems && expanded && subItems.map((item) => {
                    const itemValue = item.currentValue ?? item.investedAmount ?? 0;
                    return (
                      <SubRow key={item.id} theme={theme}>
                        <Td theme={theme} colSpan={2}>
                          <SubAssetNameCell>
                            {item.instrument?.symbol || item.instrument?.name || item.label}
                          </SubAssetNameCell>
                        </Td>
                        <Td theme={theme} $align="right">
                          <ValueCell theme={theme}>
                            {formatCurrency(itemValue)}
                          </ValueCell>
                        </Td>
                        <Td theme={theme} $align="right">
                          {/* Share of the PARENT asset, not of the total */}
                          <PercentageCell $color={asset.color} style={{ opacity: 0.85 }}>
                            {formatPercentage(itemValue, asset.value)}
                          </PercentageCell>
                        </Td>
                      </SubRow>
                    );
                  })}
                </React.Fragment>
              );
            })}
            {/* Total Row */}
            <TrTotal theme={theme}>
              <Td theme={theme}>
                <strong>{translations?.general?.total || 'Totale'}</strong>
              </Td>
              <Td theme={theme} />
              <Td theme={theme} $align="right">
                <ValueCell theme={theme} $color="#22c55e">{formatCurrency(totalBalance)}</ValueCell>
              </Td>
              <Td theme={theme} $align="right">
                <PercentageCell $color="#22c55e">100%</PercentageCell>
              </Td>
            </TrTotal>
          </tbody>
        </Table>
      </TableWrapper>

      {/* Category Breakdown */}
      <SectionTitle theme={theme} style={{ marginTop: '1.5rem' }}>
        📋 {t.categoryBreakdown || 'Riepilogo per Categoria'}
      </SectionTitle>
      <TableWrapper theme={theme}>
        <Table>
          <Thead theme={theme}>
            <tr>
              <Th theme={theme}>{t.category || 'Categoria'}</Th>
              <Th theme={theme} $align="right">{t.value || translations?.general?.value || 'Valore'}</Th>
              <Th theme={theme} $align="right">{t.ofTotal || '% Totale'}</Th>
              <Th theme={theme} $align="right">{t.vsPrevMonth || 'vs mese prec.'}</Th>
            </tr>
          </Thead>
          <tbody>
            {[
              {
                key: 'liquidity',
                label: translations?.dashboard?.liquidity || 'Liquidità',
                color: assetColors.totalLiquidity,
                value: totalTraditional,
                preMonth: categoryPreMonthTotals?.liquidity,
              },
              ...(totalEmergencySecurity > 0 ? [{
                key: 'emergency',
                label: translations?.dashboard?.emergencySecurity || 'Emergenza & Sicurezza',
                color: emergencyFundAsset.color,
                value: totalEmergencySecurity,
                preMonth: categoryPreMonthTotals?.emergency,
              }] : []),
              {
                key: 'investments',
                label: translations?.general?.investments || 'Investimenti',
                color: assetColors.totalInvestments,
                value: totalInvestments,
                preMonth: categoryPreMonthTotals?.investments,
              },
            ].map((row) => (
              <Tr key={row.key} theme={theme}>
                <Td theme={theme}>
                  <AssetNameCell>
                    <div className="icon-dot" style={{ backgroundColor: row.color }} />
                    {row.label}
                  </AssetNameCell>
                </Td>
                <Td theme={theme} $align="right">
                  <ValueCell theme={theme}>{formatCurrency(row.value)}</ValueCell>
                </Td>
                <Td theme={theme} $align="right">
                  <PercentageCell $color={row.color}>
                    {formatPercentage(row.value, totalBalance)}
                  </PercentageCell>
                </Td>
                <Td theme={theme} $align="right">
                  {renderPrevMonthDelta(row.value, row.preMonth)}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      {/* Income / Expenses Summary */}
      <SectionTitle theme={theme} style={{ marginTop: '1.5rem' }}>
        💶 {translations?.dashboard?.titleGraph3 || 'Entrate | Uscite'}
      </SectionTitle>
      <TableWrapper theme={theme}>
        <Table>
          <Thead theme={theme}>
            <tr>
              <Th theme={theme}>{t.type || 'Tipo'}</Th>
              <Th theme={theme} $align="right">{t.amount || 'Importo'}</Th>
              <Th theme={theme} $align="right">{t.ofIncomes || '% Entrate'}</Th>
            </tr>
          </Thead>
          <tbody>
            {(() => {
              const incomesValue = incExpData.find((item) => item.name === translations?.general?.incomes)?.value || 0;
              return incExpData.map((item, index) => (
                <Tr key={index} theme={theme}>
                  <Td theme={theme}>
                    <AssetNameCell>
                      <div className="icon-dot" style={{ backgroundColor: item.color }} />
                      {item.name === translations?.general?.incomes && <BsArrowUpRight style={{ color: item.color }} />}
                      {item.name === translations?.general?.outflows && <BsArrowDownLeft style={{ color: item.color }} />}
                      {item.name === translations?.general?.saved && <BsWallet2 style={{ color: item.color }} />}
                      <span>{isHidden ? '****' : item.name}</span>
                    </AssetNameCell>
                  </Td>
                  <Td theme={theme} $align="right">
                    <ValueCell theme={theme} $color={item.color}>{formatCurrency(item.value)}</ValueCell>
                  </Td>
                  <Td theme={theme} $align="right">
                    {/* Outflows as share of incomes; the "saved" row's share IS the saving rate */}
                    {incomesValue > 0 ? (
                      <PercentageCell $color={item.color}>
                        {formatPercentage(item.value, incomesValue)}
                      </PercentageCell>
                    ) : (
                      <span style={{ opacity: 0.4 }}>—</span>
                    )}
                  </Td>
                </Tr>
              ));
            })()}
          </tbody>
        </Table>
      </TableWrapper>
    </CompactContainer>
  );
};

export default DashboardCompactView;

import React, { useContext, useEffect, useState, useMemo } from 'react';
import styled from "styled-components";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { assetIcons } from '../data/assetIcons';
import { assetColors } from '../data/assetColors';
import { useDemoServices } from '../hooks/useDemoServices';
import { 
  getStocksValue, getEtfValue, getBankValue, getCashValue, getCryptoValue, 
  getBitcoinValue, getDigitalServicesValue, getBondsValue, getFundsValue, 
  getGoldValue, getTotalValue, getEmergencyFund,
  getStocksValuePreMonth, getEtfValuePreMonth, getBankValuePreMonth, getCashValuePreMonth, 
  getCryptoValuePreMonth, getBitcoinValuePreMonth, getDigitalServicesValuePreMonth, 
  getBondsValuePreMonth, getFundsValuePreMonth, getGoldValuePreMonth, getTotalValuePreMonth, getEmergencyFundPreMonth,
  getStocksValuePreYearSameMonth, getEtfValuePreYearSameMonth, getBankValuePreYearSameMonth, getCashValuePreYearSameMonth, 
  getCryptoValuePreYearSameMonth, getBitcoinValuePreYearSameMonth, getDigitalServicesValuePreYearSameMonth, 
  getBondsValuePreYearSameMonth, getFundsValuePreYearSameMonth, getGoldValuePreYearSameMonth, getTotalValuePreYearSameMonth, getEmergencyFundPreYearSameMonth,
} from '../utils/userDataSelectors';

/* ─── Styled Components (matching InOutStats design) ─── */

const Container = styled.div`
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.92)'
  };
  border: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${p => p.theme.mode === 'dark'
      ? '0 6px 20px rgba(0, 0, 0, 0.25)'
      : '0 6px 20px rgba(0, 0, 0, 0.06)'
    };
  }

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const Header = styled.div`
  padding: 0.85rem 1rem 0.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'
  };

  @media (max-width: 768px) {
    padding: 0.7rem 0.75rem 0.5rem;
  }
`;

const HeaderTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    font-size: 0.88rem;
  }
`;

const PeriodLabel = styled.span`
  font-size: 0.78rem;
  font-weight: 500;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'
  };
`;

const SummaryCell = styled.div`
  padding: 0.7rem 0.75rem;
  text-align: center;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 1px;
    background: ${p => p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)'
    };
  }

  @media (max-width: 768px) {
    padding: 0.55rem 0.4rem;
  }
`;

const SummaryCellLabel = styled.div`
  font-size: 0.73rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${p => p.$color || (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)')};
  margin-bottom: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

const SummaryCellValue = styled.div`
  font-size: 1.08rem;
  font-weight: 700;
  color: ${p => p.$color || p.theme.textColor};
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 0.92rem;
  }
`;

const ComparisonTable = styled.div`
  padding: 0;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr 1fr;
  padding: 0.4rem 0.75rem;
  background: ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(0, 0, 0, 0.015)'
  };
  border-bottom: 1px solid ${p => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(0, 0, 0, 0.03)'
  };

  @media (max-width: 768px) {
    padding: 0.35rem 0.5rem;
  }
`;

const TableHeaderCell = styled.div`
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'};
  text-align: ${p => p.$align || 'left'};

  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

const ComparisonRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr 1fr;
  padding: 0.5rem 0.75rem;
  align-items: center;
  transition: background 0.15s ease;

  &:not(:last-child) {
    border-bottom: 1px solid ${p => p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)'
    };
  }

  &:hover {
    background: ${p => p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.015)'
    };
  }

  @media (max-width: 768px) {
    padding: 0.45rem 0.5rem;
  }
`;

const MetricName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};

  @media (max-width: 768px) {
    font-size: 0.78rem;
    gap: 0.25rem;
  }
`;


const ValueCell = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.08rem;
  min-width: 0;
`;

const CurrentAmount = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${p => p.theme.textColor};

  @media (max-width: 768px) {
    font-size: 0.72rem;
  }
`;

const CurrentPercent = styled.span`
  font-size: 0.66rem;
  font-weight: 500;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.38)'};

  @media (max-width: 768px) {
    font-size: 0.58rem;
  }
`;

const DetailRow = styled(ComparisonRow)`
  padding-top: 0.38rem;
  padding-bottom: 0.38rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)'};
`;

const DetailName = styled(MetricName)`
  padding-left: 1.4rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.62)'};

  @media (max-width: 768px) {
    padding-left: 0.7rem;
    font-size: 0.7rem;
  }
`;

const DetailMarker = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${p => p.$color};
  flex-shrink: 0;
  opacity: 0.85;
`;

const AssetIcon = styled.span`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: ${p => p.$color};
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: 0.75rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const ChangeCell = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
`;

const ChangeAmount = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${p => p.$isPositive ? '#27ae60' : p.$isNeutral ? (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)') : '#e74c3c'};
  display: flex;
  align-items: center;
  gap: 0.15rem;

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 0.72rem;
  }
`;

const ChangePercent = styled.span`
  font-size: 0.68rem;
  font-weight: 500;
  color: ${p => p.$isPositive ? 'rgba(39, 174, 96, 0.7)' : p.$isNeutral ? (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : 'rgba(231, 76, 60, 0.7)'};

  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

/* ─── Helpers ─── */

function getPercentage(current, previous) {
  if (isNaN(current) || isNaN(previous) || previous === 0) return null;
  return (((current - previous) / Math.abs(previous)) * 100).toFixed(1);
}

function isPositiveVal(current, previous) {
  if (current === previous) return null;
  return current > previous;
}

/* ─── Component ─── */

function BalancesStats({ theme, userData, isHidden }) {
    const { language, translations } = useContext(LanguageContext);
    const { formatAmount } = useContext(CurrencyContext);
    const { investmentService, liquidityAccountService } = useDemoServices();
    const fmt = (val) => formatAmount(val);

    const [current, setCurrent] = useState({});
    const [prevMonth, setPrevMonth] = useState({});
    const [prevYear, setPrevYear] = useState({});
    const [investmentHoldings, setInvestmentHoldings] = useState([]);
    const [liquidityAccounts, setLiquidityAccounts] = useState([]);

    useEffect(() => {
        if (!userData) return;
        try {
            setCurrent({
                bank: getBankValue(userData) || 0,
                cash: getCashValue(userData) || 0,
                emergencyFund: getEmergencyFund(userData) || 0,
                digitalServices: getDigitalServicesValue(userData) || 0,
                stocks: getStocksValue(userData) || 0,
                etf: getEtfValue(userData) || 0,
                bitcoin: getBitcoinValue(userData) || 0,
                crypto: getCryptoValue(userData) || 0,
                bonds: getBondsValue(userData) || 0,
                funds: getFundsValue(userData) || 0,
                gold: getGoldValue(userData) || 0,
                total: getTotalValue(userData) || 0,
            });
            setPrevMonth({
                bank: getBankValuePreMonth(userData) || 0,
                cash: getCashValuePreMonth(userData) || 0,
                emergencyFund: getEmergencyFundPreMonth(userData) || 0,
                digitalServices: getDigitalServicesValuePreMonth(userData) || 0,
                stocks: getStocksValuePreMonth(userData) || 0,
                etf: getEtfValuePreMonth(userData) || 0,
                bitcoin: getBitcoinValuePreMonth(userData) || 0,
                crypto: getCryptoValuePreMonth(userData) || 0,
                bonds: getBondsValuePreMonth(userData) || 0,
                funds: getFundsValuePreMonth(userData) || 0,
                gold: getGoldValuePreMonth(userData) || 0,
                total: getTotalValuePreMonth(userData) || 0,
            });
            setPrevYear({
                bank: getBankValuePreYearSameMonth(userData) || 0,
                cash: getCashValuePreYearSameMonth(userData) || 0,
                emergencyFund: getEmergencyFundPreYearSameMonth(userData) || 0,
                digitalServices: getDigitalServicesValuePreYearSameMonth(userData) || 0,
                stocks: getStocksValuePreYearSameMonth(userData) || 0,
                etf: getEtfValuePreYearSameMonth(userData) || 0,
                bitcoin: getBitcoinValuePreYearSameMonth(userData) || 0,
                crypto: getCryptoValuePreYearSameMonth(userData) || 0,
                bonds: getBondsValuePreYearSameMonth(userData) || 0,
                funds: getFundsValuePreYearSameMonth(userData) || 0,
                gold: getGoldValuePreYearSameMonth(userData) || 0,
                total: getTotalValuePreYearSameMonth(userData) || 0,
            });
        } catch (e) {
            console.error('Error computing balance stats:', e);
        }
    }, [userData]);

    useEffect(() => {
        let cancelled = false;

        const loadDetailedAssets = async () => {
            try {
                const [holdings, accounts] = await Promise.all([
                    investmentService.getHoldings(),
                    liquidityAccountService.getAccounts(),
                ]);

                if (!cancelled) {
                    setInvestmentHoldings(Array.isArray(holdings) ? holdings : []);
                    setLiquidityAccounts(Array.isArray(accounts) ? accounts : []);
                }
            } catch (error) {
                console.error('Error loading detailed balance assets:', error);
            }
        };

        loadDetailedAssets();
        return () => { cancelled = true; };
    }, [investmentService, liquidityAccountService]);

    const getHoldingValue = (holding) => Number(holding?.currentValue ?? holding?.investedAmount ?? 0) || 0;
    const getHoldingLabel = (holding) => holding?.instrument?.symbol || holding?.instrument?.name || holding?.notes || ('Holding #' + holding?.id);

    const detailRowsByAsset = useMemo(() => {
        const grouped = {};
        const pushRow = (assetKey, row) => {
            if (!assetKey || !row.value) return;
            grouped[assetKey] = grouped[assetKey] || [];
            grouped[assetKey].push(row);
        };

        liquidityAccounts.forEach((account) => {
            const value = Number(account?.currentValue ?? 0) || 0;
            pushRow(account?.assetKey, {
                id: 'account-' + account?.id,
                label: account?.label || translations.assets?.[account?.assetKey] || 'Account',
                value,
            });
        });

        investmentHoldings.forEach((holding) => {
            const value = getHoldingValue(holding);
            pushRow(holding?.assetKey, {
                id: 'holding-' + holding?.id,
                label: getHoldingLabel(holding),
                value,
            });
        });

        Object.values(grouped).forEach((rows) => rows.sort((a, b) => b.value - a.value));
        return grouped;
    }, [investmentHoldings, liquidityAccounts, translations.assets]);

    // Asset configuration
    const assetsConfig = [
        { key: 'bank', icon: assetIcons.bank, color: assetColors.bank.primary, label: translations.assets.bank },
        { key: 'cash', icon: assetIcons.cash, color: assetColors.cash.primary, label: translations.assets.cash },
        { key: 'emergencyFund', icon: assetIcons.emergencyFund, color: assetColors.emergencyFund.primary, label: translations.assets.emergencyFund },
        { key: 'digitalServices', icon: assetIcons.digitalServices, color: assetColors.digitalServices.primary, label: translations.assets.digitalServices },
        { key: 'stocks', icon: assetIcons.stocks, color: assetColors.stocks.primary, label: translations.assets.stocks },
        { key: 'etf', icon: assetIcons.etf, color: assetColors.etf.primary, label: translations.assets.etf },
        { key: 'bitcoin', icon: assetIcons.bitcoin, color: assetColors.bitcoin.primary, label: translations.assets.bitcoin },
        { key: 'crypto', icon: assetIcons.crypto, color: assetColors.crypto.primary, label: translations.assets.crypto },
        { key: 'bonds', icon: assetIcons.bonds, color: assetColors.bonds.primary, label: translations.assets.bonds },
        { key: 'funds', icon: assetIcons.funds, color: assetColors.funds.primary, label: translations.assets.funds },
        { key: 'gold', icon: assetIcons.gold, color: assetColors.gold.primary, label: translations.assets.gold },
    ];

    // Only show assets with non-zero values
    const visibleAssets = assetsConfig.filter(a =>
        (current[a.key] || 0) !== 0 || (prevMonth[a.key] || 0) !== 0 || (prevYear[a.key] || 0) !== 0 || (detailRowsByAsset[a.key]?.length || 0) > 0
    );

    // Period labels
    const periodLabels = useMemo(() => {
        const now = new Date();
        const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const py = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        const locale = language === 'it' ? 'it-IT' : 'en-US';
        return {
            month: `vs ${pm.toLocaleDateString(locale, { month: 'short', year: '2-digit' })}`,
            year: `vs ${py.toLocaleDateString(locale, { month: 'short', year: '2-digit' })}`,
        };
    }, [language]);

    // Summary totals
    const totalCurrent = current.total || 0;
    const totalMonthDiff = totalCurrent - (prevMonth.total || 0);
    const totalYearDiff = totalCurrent - (prevYear.total || 0);
    const totalMonthPct = getPercentage(totalCurrent, prevMonth.total || 0);
    const totalYearPct = getPercentage(totalCurrent, prevYear.total || 0);
    const totalMonthPositive = isPositiveVal(totalCurrent, prevMonth.total || 0);
    const totalYearPositive = isPositiveVal(totalCurrent, prevYear.total || 0);

    const getChangeColor = (positive) => {
        if (positive === null) return undefined;
        return positive ? '#27ae60' : '#e74c3c';
    };

    const renderChange = (cur, prev) => {
        const diff = cur - prev;
        const positive = isPositiveVal(cur, prev);
        const pct = getPercentage(cur, prev);
        const isNeutral = positive === null;
        
        const sign = diff >= 0 ? '+' : '';
        const formattedDiff = `${sign}${fmt(Math.abs(diff))}`;
        const formattedPct = pct !== null ? `${pct > 0 ? '+' : ''}${pct}%` : 'N/A';
        
        const TrendIcon = isNeutral ? Minus : positive ? ArrowUpRight : ArrowDownRight;

        return (
            <ChangeCell>
                <ChangeAmount $isPositive={positive} $isNeutral={isNeutral} theme={theme}>
                    <TrendIcon />
                    {isHidden ? '••••' : formattedDiff}
                </ChangeAmount>
                <ChangePercent $isPositive={positive} $isNeutral={isNeutral} theme={theme}>
                    {isHidden ? '••••' : formattedPct}
                </ChangePercent>
            </ChangeCell>
        );
    };

    const renderCurrentValue = (value) => {
        const pct = totalCurrent ? ((value / totalCurrent) * 100).toFixed(1) : '0.0';
        return (
            <ValueCell>
                <CurrentAmount theme={theme}>{isHidden ? '****' : fmt(value)}</CurrentAmount>
                <CurrentPercent theme={theme}>{isHidden ? '****' : (pct + '%')}</CurrentPercent>
            </ValueCell>
        );
    };

    const tStats = translations?.graphs?.statsBalance || {};
    const tGeneral = translations?.general || {};

    const formatSummaryChange = (diff, pct) => {
        if (isHidden) return '••••';
        const sign = diff >= 0 ? '+' : '';
        const val = `${sign}${fmt(Math.abs(diff))}`;
        const pctStr = pct !== null ? ` (${pct > 0 ? '+' : ''}${pct}%)` : '';
        return `${val}${pctStr}`;
    };

    return (
        <Container theme={theme}>
            {/* Header */}
            <Header theme={theme}>
                <HeaderTitle theme={theme}>
                    <TrendingUp />
                    {tStats.detailedVision || 'Balance Statistics'}
                </HeaderTitle>
                <PeriodLabel theme={theme}>
                    {tGeneral.currentMonth || translations?.graphs?.financialOverview?.currentMonth || 'Current month'}
                </PeriodLabel>
            </Header>

            {/* Summary: Total balance + month/year changes */}
            <SummaryRow theme={theme}>
                <SummaryCell theme={theme}>
                    <SummaryCellLabel theme={theme}>
                        {tGeneral.total || 'Total'}
                    </SummaryCellLabel>
                    <SummaryCellValue theme={theme}>
                        {isHidden ? '••••' : fmt(totalCurrent)}
                    </SummaryCellValue>
                </SummaryCell>
                <SummaryCell theme={theme}>
                    <SummaryCellLabel $color={getChangeColor(totalMonthPositive)} theme={theme}>
                        {periodLabels.month}
                    </SummaryCellLabel>
                    <SummaryCellValue $color={getChangeColor(totalMonthPositive)} theme={theme}>
                        {formatSummaryChange(totalMonthDiff, totalMonthPct)}
                    </SummaryCellValue>
                </SummaryCell>
                <SummaryCell theme={theme}>
                    <SummaryCellLabel $color={getChangeColor(totalYearPositive)} theme={theme}>
                        {periodLabels.year}
                    </SummaryCellLabel>
                    <SummaryCellValue $color={getChangeColor(totalYearPositive)} theme={theme}>
                        {formatSummaryChange(totalYearDiff, totalYearPct)}
                    </SummaryCellValue>
                </SummaryCell>
            </SummaryRow>

            {/* Comparison table: per-asset rows */}
            <ComparisonTable>
                <TableHeader theme={theme}>
                    <TableHeaderCell theme={theme}>{tStats.asset || 'Asset'}</TableHeaderCell>
                    <TableHeaderCell theme={theme} $align="right">
                        {tGeneral.value || 'Valore'}
                    </TableHeaderCell>
                    <TableHeaderCell theme={theme} $align="right">
                        {periodLabels.month}
                    </TableHeaderCell>
                    <TableHeaderCell theme={theme} $align="right">
                        {periodLabels.year}
                    </TableHeaderCell>
                </TableHeader>

                {visibleAssets.map(asset => {
                    const IconComponent = asset.icon;
                    const cur = current[asset.key] || 0;
                    const pm = prevMonth[asset.key] || 0;
                    const py = prevYear[asset.key] || 0;

                    const detailRows = detailRowsByAsset[asset.key] || [];

                    return (
                        <React.Fragment key={asset.key}>
                            <ComparisonRow theme={theme}>
                                <MetricName theme={theme}>
                                    <AssetIcon $color={asset.color}>
                                        <IconComponent />
                                    </AssetIcon>
                                    {asset.label}
                                </MetricName>
                                {renderCurrentValue(cur)}
                                {renderChange(cur, pm)}
                                {renderChange(cur, py)}
                            </ComparisonRow>
                            {detailRows.map((detail) => (
                                <DetailRow key={detail.id} theme={theme}>
                                    <DetailName theme={theme}>
                                        <DetailMarker $color={asset.color} />
                                        {detail.label}
                                    </DetailName>
                                    {renderCurrentValue(detail.value)}
                                    <ChangeCell />
                                    <ChangeCell />
                                </DetailRow>
                            ))}
                        </React.Fragment>
                    );
                })}
            </ComparisonTable>
        </Container>
    );
}

export default React.memo(BalancesStats);
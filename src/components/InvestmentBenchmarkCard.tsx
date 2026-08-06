import {useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import {ShieldCheck, Users} from 'lucide-react';
import {LanguageContext} from '../contexts/LanguageContext';
import {CurrencyContext} from '../contexts/CurrencyContext';
import type {InvestmentBenchmarkResponse} from '../types/api';
import type {StatsService} from '../services/statsService';

const Card = styled.section`
  margin-top: 1.25rem; padding: 1.25rem; border: 1px solid ${({theme}) => theme.borderColor};
  border-radius: 16px; background: ${({theme}) => theme.cardBackground}; color: ${({theme}) => theme.textColor};
`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;margin-top:1rem;`;
const Metric = styled.div`padding:.9rem;border-radius:12px;background:${({theme}) => theme.secondaryColor}18; span{display:block;opacity:.7;font-size:.78rem} strong{font-size:1.05rem}`;

type Props = {theme: Record<string, string>; service: StatsService; hidden: boolean};
export default function InvestmentBenchmarkCard({theme, service, hidden}: Props) {
  const {translations} = useContext(LanguageContext);
  const {formatCurrency} = useContext(CurrencyContext);
  const [data, setData] = useState<InvestmentBenchmarkResponse | null>(null);
  useEffect(() => { let active = true; service.getInvestmentBenchmark().then((result) => active && setData(result)).catch(() => active && setData(null)); return () => { active = false; }; }, [service]);
  if (!data?.personal) return null;
  const t = translations.graphs.investmentBenchmark;
  const metrics = data.comparison.metrics;
  const reliabilityLabel = data.comparison.reliability === 'high' ? t.highReliability : t.mediumReliability;
  const value = (personal: number | null, median: number | null | undefined, formatter: (number: number) => string) =>
    `${hidden ? '•••' : personal == null ? t.notEnoughHistory : formatter(personal)} / ${hidden ? '•••' : median == null ? '—' : formatter(median)}`;
  return <Card theme={theme}>
    <h3><Users size={18}/> {t.title}</h3><p>{t.description}</p>
    {!data.comparison.available ? <p><ShieldCheck size={15}/> {data.comparison.reason === 'consent_required' ? t.consentRequired : t.minimumCohort.replace('{minimum}', String(data.comparison.minimumCohortSize))}</p> : <>
      <small>{t.legend.replace('{count}', String(data.comparison.cohortSize))} · {reliabilityLabel}</small>
      <Grid>
        <Metric theme={theme}><span>{t.consistency}</span><strong>{value(data.personal.consistencyPercent, metrics?.consistencyPercent.median, (v) => `${v.toFixed(1)}%`)}</strong></Metric>
        <Metric theme={theme}><span>{t.monthlyContribution}</span><strong>{value(data.personal.averageMonthlyContribution, metrics?.averageMonthlyContribution.median, formatCurrency)}</strong></Metric>
        <Metric theme={theme}><span>{t.moneyWeighted}</span><strong>{value(data.personal.moneyWeightedReturn, metrics?.moneyWeightedReturn.median, (v) => `${v.toFixed(1)}%`)}</strong></Metric>
        <Metric theme={theme}><span>{t.timeWeighted}</span><strong>{value(data.personal.timeWeightedReturn, metrics?.timeWeightedReturn.median, (v) => `${v.toFixed(1)}%`)}</strong></Metric>
      </Grid><p><small>{t.methodNote}</small></p>
    </>}
  </Card>;
}

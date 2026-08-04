export interface IncomeOutflowInputRow {
  name: string;
  incomes: number;
  outflows: number;
}

export interface IncomeOutflowChartRow extends IncomeOutflowInputRow {
  net: number;
  savingsRate: number | null;
}

export interface IncomeOutflowKpis {
  totalIncomes: number;
  totalOutflows: number;
  net: number;
  savingsRate: number | null;
  averageMonthlyNet: number;
  deficitMonths: number;
}

export interface CategoryRankRow {
  key: string;
  value: number;
  percentage: number;
}

const finiteAbsolute = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.abs(number) : 0;
};

export function normalizeIncomeOutflowRows(
  rows: IncomeOutflowInputRow[] | null | undefined,
): IncomeOutflowChartRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const incomes = finiteAbsolute(row?.incomes);
    const outflows = finiteAbsolute(row?.outflows);
    const net = incomes - outflows;
    return {
      name: typeof row?.name === 'string' ? row.name : '',
      incomes,
      outflows,
      net,
      savingsRate: incomes === 0 ? null : (net / incomes) * 100,
    };
  });
}

export function calculateIncomeOutflowKpis(rows: IncomeOutflowChartRow[]): IncomeOutflowKpis {
  const totals = rows.reduce((sum, row) => ({
    incomes: sum.incomes + row.incomes,
    outflows: sum.outflows + row.outflows,
  }), {incomes: 0, outflows: 0});
  const net = totals.incomes - totals.outflows;
  return {
    totalIncomes: totals.incomes,
    totalOutflows: totals.outflows,
    net,
    savingsRate: totals.incomes === 0 ? null : (net / totals.incomes) * 100,
    averageMonthlyNet: rows.length === 0 ? 0 : net / rows.length,
    deficitMonths: rows.filter((row) => row.net < 0).length,
  };
}

export function buildIncomeOutflowComparison(
  allRows: IncomeOutflowChartRow[],
  visibleRows: IncomeOutflowChartRow[],
): Array<IncomeOutflowChartRow & {comparisonNet: number | null}> {
  if (visibleRows.length === 0) return [];
  const firstIndex = allRows.findIndex((row) => row.name === visibleRows[0].name);
  return visibleRows.map((row, index) => {
    const comparisonIndex = firstIndex - visibleRows.length + index;
    return {
      ...row,
      comparisonNet: comparisonIndex >= 0 ? allRows[comparisonIndex]?.net ?? null : null,
    };
  });
}

export function rankCategoryBreakdown(
  breakdown: Record<string, number> | null | undefined,
  limit: number,
): CategoryRankRow[] {
  if (!breakdown) return [];
  const sorted = Object.entries(breakdown)
    .map(([key, value]) => ({key, value: finiteAbsolute(value)}))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, row) => sum + row.value, 0);
  const safeLimit = Math.max(1, Math.floor(limit));
  const visible = sorted.slice(0, safeLimit);
  const overflow = sorted.slice(safeLimit).reduce((sum, row) => sum + row.value, 0);
  const result = overflow > 0 ? [...visible, {key: '__other__', value: overflow}] : visible;
  return result.map((row) => ({...row, percentage: total === 0 ? 0 : (row.value / total) * 100}));
}

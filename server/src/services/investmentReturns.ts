export type DatedCashFlow = {date: string; amount: number}
export type MonthlyValuation = {month: string; value: number}

const YEAR_MS = 365.2425 * 24 * 60 * 60 * 1000

/** Annualized money-weighted return (XIRR). Purchases are negative, proceeds and terminal value positive. */
export function calculateXirr(cashFlows: DatedCashFlow[]): number | null {
    const flows = cashFlows.filter((flow) => Number.isFinite(flow.amount)).sort((a, b) => a.date.localeCompare(b.date))
    if (flows.length < 2 || !flows.some((f) => f.amount < 0) || !flows.some((f) => f.amount > 0)) return null
    const start = new Date(`${flows[0].date}T00:00:00Z`).getTime()
    const end = new Date(`${flows[flows.length - 1].date}T00:00:00Z`).getTime()
    // Annualizing a few days of performance creates spectacular but useless
    // peer comparisons. Require one quarter before exposing XIRR.
    if (end - start < 90 * 24 * 60 * 60 * 1000) return null
    const npv = (rate: number) => flows.reduce((sum, flow) => {
        const years = (new Date(`${flow.date}T00:00:00Z`).getTime() - start) / YEAR_MS
        return sum + flow.amount / Math.pow(1 + rate, years)
    }, 0)
    let low = -0.9999
    let high = 10
    let lowValue = npv(low)
    let highValue = npv(high)
    for (let i = 0; i < 8 && lowValue * highValue > 0; i++) {
        high *= 2
        highValue = npv(high)
    }
    if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || lowValue * highValue > 0) return null
    for (let i = 0; i < 100; i++) {
        const middle = (low + high) / 2
        const value = npv(middle)
        if (Math.abs(value) < 0.000001) return middle * 100
        if (value * lowValue > 0) {
            low = middle
            lowValue = value
        } else high = middle
    }
    return ((low + high) / 2) * 100
}

/** Approximate monthly TWR. Cash flows are assumed to occur at period end, matching monthly snapshots. */
export function calculateTimeWeightedReturn(valuations: MonthlyValuation[], netFlowsByMonth: Map<string, number>): number | null {
    const points = [...valuations].filter((point) => point.value >= 0).sort((a, b) => a.month.localeCompare(b.month))
    if (points.length < 2) return null
    let factor = 1
    let periods = 0
    for (let index = 1; index < points.length; index++) {
        const start = points[index - 1].value
        if (start <= 0) continue
        const flow = netFlowsByMonth.get(points[index].month) ?? 0
        const periodReturn = (points[index].value - flow - start) / start
        if (!Number.isFinite(periodReturn) || periodReturn <= -1) continue
        factor *= 1 + periodReturn
        periods++
    }
    return periods > 0 ? (factor - 1) * 100 : null
}

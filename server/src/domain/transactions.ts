export const TRANSACTION_PURPOSES = [
    "income",
    "expense",
    "investment",
    "transfer",
    "debt",
    "tax",
    "refund",
    "other",
] as const

export type TransactionPurpose = typeof TRANSACTION_PURPOSES[number]

export function isTransactionPurpose(value: unknown): value is TransactionPurpose {
    return typeof value === "string" && (TRANSACTION_PURPOSES as readonly string[]).includes(value)
}

export function inferTransactionPurpose(
    direction: "income" | "outflow",
    categoryIndex: number,
    explicitPurpose?: unknown,
): TransactionPurpose | null {
    if (explicitPurpose !== undefined && !isTransactionPurpose(explicitPurpose)) return null
    if (explicitPurpose !== undefined) return explicitPurpose
    if (direction === "income") return "income"
    if (categoryIndex === 8) return "investment"
    if (categoryIndex === 10) return "tax"
    return "expense"
}

export function isPurposeCompatible(
    direction: "income" | "outflow",
    purpose: TransactionPurpose,
): boolean {
    if (direction === "outflow") return purpose !== "income" && purpose !== "refund"
    return purpose !== "expense" && purpose !== "tax"
}

import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    insert: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    getMostRecentByUserId: vi.fn(),
    insertNew: vi.fn(),
    getAccountsByUserId: vi.fn(),
    updateAccount: vi.fn(),
    getHoldingsByUserId: vi.fn(),
    updateHolding: vi.fn(),
}))

vi.mock("../src/db/supabase", () => ({
    default: {
        from: vi.fn((table: string) => {
            if (table === "transactions") return {insert: mocks.insert}
            if (table === "recurring_transactions") return {update: mocks.update}
            throw new Error(`unexpected table in test: ${table}`)
        }),
    },
}))
vi.mock("../src/db/crypto", () => ({
    encryptField: (value: string) => (value ? `encrypted:${value}` : null),
    decryptField: (value: string) => value?.replace("encrypted:", "") ?? "",
}))
vi.mock("../src/db/models/tags", () => ({
    default: {
        TagType: {expense: {value: 0}, income: {value: 1}, payment: {value: 2}},
        getReferenceByIndexAndType: vi.fn(),
    },
}))
vi.mock("../src/db/models/balances", () => ({
    default: {
        getMostRecentByUserId: mocks.getMostRecentByUserId,
        insertNew: mocks.insertNew,
    },
}))
vi.mock("../src/db/models/liquidityAccounts", () => ({
    default: {
        getAccountsByUserId: mocks.getAccountsByUserId,
        updateAccount: mocks.updateAccount,
    },
}))
vi.mock("../src/db/models/investments", () => ({
    default: {
        getHoldingsByUserId: mocks.getHoldingsByUserId,
        updateHolding: mocks.updateHolding,
    },
}))

import { runDueTemplate } from "../src/db/models/recurringTransactions"

const baseRow = {
    id: 1,
    user_id: "user-1",
    is_expense: true,
    purpose: "expense" as const,
    amount: 100,
    notes: null,
    payment_type_tag_id: 5,
    category_tag_id: 6,
    user_category_id: null,
    day_of_month: 1,
    balance_asset_key: null as string | null,
    balance_detail_type: null as "liquidity" | "investment" | null,
    balance_detail_id: null as number | null,
}

describe("recurringTransactions.runDueTemplate", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.insert.mockResolvedValue({error: null})
        mocks.update.mockReturnValue({eq: mocks.eq})
        mocks.eq.mockResolvedValue({error: null})
    })

    it("copies the balance source onto the generated transaction row", async () => {
        const row = {...baseRow, balance_asset_key: "bank", balance_detail_type: "liquidity" as const, balance_detail_id: 301}
        mocks.getAccountsByUserId.mockResolvedValue([
            {id: 301, assetKey: "bank", label: "Conto", currentValue: 500, currency: "EUR", notes: "", linkedBankKey: null, unitValue: null, fallbackAccountId: null},
        ])

        await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({
            balance_asset_key: "bank", balance_detail_type: "liquidity", balance_detail_id: 301,
        }))
    })

    it("decreases a liquidity sub-account's current_value for an expense template", async () => {
        const row = {...baseRow, is_expense: true, amount: 100, balance_asset_key: "bank", balance_detail_type: "liquidity" as const, balance_detail_id: 301}
        mocks.getAccountsByUserId.mockResolvedValue([
            {id: 301, assetKey: "bank", label: "Conto", currentValue: 500, currency: "EUR", notes: "note", linkedBankKey: "revolut", unitValue: null, fallbackAccountId: null},
        ])

        const result = await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(result).toBe(true)
        expect(mocks.updateAccount).toHaveBeenCalledWith("user-1", 301, expect.objectContaining({
            currentValue: 400, label: "Conto", currency: "EUR", notes: "note", linkedBankKey: "revolut",
        }))
    })

    it("increases a liquidity sub-account's current_value for an income template", async () => {
        const row = {...baseRow, is_expense: false, purpose: "income" as const, amount: 2850, balance_asset_key: "bank", balance_detail_type: "liquidity" as const, balance_detail_id: 301}
        mocks.getAccountsByUserId.mockResolvedValue([
            {id: 301, assetKey: "bank", label: "Conto", currentValue: 1000, currency: "EUR", notes: "", linkedBankKey: null, unitValue: null, fallbackAccountId: null},
        ])

        await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(mocks.updateAccount).toHaveBeenCalledWith("user-1", 301, expect.objectContaining({currentValue: 3850}))
    })

    it("applies the delta to an investment holding's raw stored current_value, not a live-price overlay", async () => {
        const row = {...baseRow, is_expense: true, amount: 50, balance_asset_key: "etf", balance_detail_type: "investment" as const, balance_detail_id: 77}
        mocks.getHoldingsByUserId.mockResolvedValue([
            {id: 77, assetKey: "etf", positionType: "long", quantity: 10, averagePrice: 90, currentValue: 950, investedAmount: 900, currency: "EUR", notes: "", importSource: null, instrument: {id: 999}},
        ])

        await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(mocks.getHoldingsByUserId).toHaveBeenCalledWith("user-1", false)
        expect(mocks.updateHolding).toHaveBeenCalledWith("user-1", 77, expect.objectContaining({instrumentId: 999, currentValue: 900}))
    })

    it("appends a new balances snapshot for a macro-only source, mapping camelCase asset keys to their db column and carrying the rest forward", async () => {
        const row = {...baseRow, is_expense: true, amount: 20, balance_asset_key: "digitalServices", balance_detail_type: null, balance_detail_id: null}
        mocks.getMostRecentByUserId.mockResolvedValue({
            bank: 500, cash: 50, digitalServices: 96, stocks: 0, etf: 0, bitcoin: 0, crypto: 0, bonds: 0, funds: 0, commodities: 0, emergencyFund: 1000,
        })

        await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(mocks.insertNew).toHaveBeenCalledWith(
            "user-1", expect.any(Date), 500, 50, 76, 0, 0, 0, 0, 0, 0, 0, 1000,
        )
    })

    it("does not attempt any balance lookup when the template has no balance source", async () => {
        const row = {...baseRow}

        await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(mocks.getAccountsByUserId).not.toHaveBeenCalled()
        expect(mocks.getHoldingsByUserId).not.toHaveBeenCalled()
        expect(mocks.getMostRecentByUserId).not.toHaveBeenCalled()
    })

    it("still returns true (the transaction itself already succeeded) even if applying the balance delta fails", async () => {
        const row = {...baseRow, balance_asset_key: "bank", balance_detail_type: "liquidity" as const, balance_detail_id: 301}
        mocks.getAccountsByUserId.mockRejectedValue(new Error("boom"))

        const result = await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(result).toBe(true)
    })

    it("advances next_run_date by one month on the configured day", async () => {
        const row = {...baseRow, day_of_month: 15}

        await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({next_run_date: "2026-09-15"}))
    })

    it("returns false and never applies a delta when the transaction insert itself fails", async () => {
        mocks.insert.mockResolvedValue({error: {message: "db error"}})
        const row = {...baseRow, balance_asset_key: "bank", balance_detail_type: "liquidity" as const, balance_detail_id: 301}

        const result = await runDueTemplate(row, new Date("2026-08-18T06:00:00.000Z"))

        expect(result).toBe(false)
        expect(mocks.getAccountsByUserId).not.toHaveBeenCalled()
    })
})

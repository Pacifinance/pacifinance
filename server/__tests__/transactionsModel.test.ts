import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    insert: vi.fn(),
    select: vi.fn(),
    rpc: vi.fn(),
    getReference: vi.fn(),
}))

vi.mock("../src/db/supabase", () => ({
    default: {from: vi.fn(() => ({insert: mocks.insert})), rpc: mocks.rpc}
}))
vi.mock("../src/db/crypto", () => ({
    encryptField: (value: string) => value ? `encrypted:${value}` : null,
    decryptField: (value: string) => value?.replace("encrypted:", "") ?? "",
}))
vi.mock("../src/db/models/tags", () => ({
    default: {
        TagType: {expense: {value: 0}, income: {value: 1}, payment: {value: 2}},
        getReferenceByIndexAndType: mocks.getReference,
    }
}))

import transactionsModel, { buildRecentMonthReferences } from "../src/db/models/transactions"

describe("transaction monthly buckets", () => {
    it("does not duplicate or skip short months when today is month-end", () => {
        const refs = buildRecentMonthReferences(new Date("2026-07-31T12:00:00.000Z"), 6)
        const keys = refs.map((date) => date.toISOString().slice(0, 7))

        expect(keys).toEqual(["2026-07", "2026-06", "2026-05", "2026-04", "2026-03", "2026-02"])
        expect(new Set(keys).size).toBe(keys.length)
    })
})

describe("transaction batch insert", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.insert.mockReturnValue({select: mocks.select})
        mocks.getReference.mockImplementation(async (index: number, type: number) => ({id: type * 1000 + index}))
        mocks.select.mockResolvedValue({data: [
            {id: 1, occurred_at: "2026-08-01", amount: 10, is_expense: true, notes: "encrypted:Lunch", payment_type: null, category_tag: null, user_category: null},
            {id: 2, occurred_at: "2026-08-02", amount: 20, is_expense: false, notes: "encrypted:Refund", payment_type: null, category_tag: null, user_category: null},
        ], error: null})
    })

    it("resolves distinct tags once and performs one database insert", async () => {
        const result = await transactionsModel.insertBatch("user-1", [
            {date: new Date("2026-08-01"), amount: 10, isExpense: true, purpose: "expense", notes: "Lunch", paymentType: 1, categoryTag: 4, userCategoryId: null, balanceSource: null, balanceSplit: null},
            {date: new Date("2026-08-02"), amount: 20, isExpense: false, purpose: "refund", notes: "Refund", paymentType: 0, categoryTag: 0, userCategoryId: null, balanceSource: null, balanceSplit: null},
        ])

        expect(result).toHaveLength(2)
        expect(mocks.getReference).toHaveBeenCalledTimes(4)
        expect(mocks.insert).toHaveBeenCalledOnce()
        expect(mocks.insert).toHaveBeenCalledWith([
            expect.objectContaining({user_id: "user-1", amount: 10, purpose: "expense", notes: "encrypted:Lunch", payment_type_tag_id: 2001, category_tag_id: 4}),
            expect.objectContaining({user_id: "user-1", amount: 20, purpose: "refund", notes: "encrypted:Refund", payment_type_tag_id: 2000, category_tag_id: 1000}),
        ])
    })

    it("aborts before writing if a tag reference cannot be resolved", async () => {
        mocks.getReference.mockResolvedValueOnce(null)
        const result = await transactionsModel.insertBatch("user-1", [
            {date: new Date("2026-08-01"), amount: 10, isExpense: true, purpose: "expense", notes: "", paymentType: 1, categoryTag: 4, userCategoryId: null, balanceSource: null, balanceSplit: null},
        ])
        expect(result).toBeNull()
        expect(mocks.insert).not.toHaveBeenCalled()
    })
})

describe("purpose-aware monthly totals", () => {
    it("maps spending, investment, and transfer aggregates independently", async () => {
        mocks.rpc.mockResolvedValue({data: [{
            month_start: "2026-08-01",
            total_outflows: 500,
            total_incomes: 1000,
            total_expenses: 180,
            total_investments: 270,
            total_transfers: 50,
        }], error: null})

        await expect(transactionsModel.getMonthlyTotalsByUserId("user-1", 12)).resolves.toEqual([{
            monthStart: "2026-08-01",
            totalOutflows: 500,
            totalIncomes: 1000,
            totalExpenses: 180,
            totalInvestments: 270,
            totalTransfers: 50,
        }])
    })
})

describe("transaction atomic update", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.getReference.mockImplementation(async (index: number, type: number) => ({id: type * 1000 + index}))
    })

    it("does not call the RPC when a tag cannot be resolved", async () => {
        mocks.getReference.mockResolvedValueOnce(null)
        const result = await transactionsModel.updateExisting("user-1", {
            id: 42, date: new Date("2026-08-01"), amount: 12, isExpense: true, purpose: "expense", notes: "Lunch",
            paymentType: 1, categoryTag: 4, userCategoryId: null, balanceSource: null, balanceSplit: null,
            sharedMode: "remove", sharedTotal: null, sharedOwnShare: null,
        })

        expect(result).toBeNull()
        expect(mocks.rpc).not.toHaveBeenCalled()
    })

    it("updates the transaction and shared split with one RPC", async () => {
        mocks.rpc.mockResolvedValue({data: 42, error: null})
        const result = await transactionsModel.updateExisting("user-1", {
            id: 42, date: new Date("2026-08-01"), amount: 6, isExpense: true, purpose: "expense", notes: "Lunch",
            paymentType: 1, categoryTag: 4, userCategoryId: 9,
            balanceSource: {asset_key: "bank", detail_type: null, detail_id: null}, balanceSplit: null,
            sharedMode: "set", sharedTotal: 24, sharedOwnShare: 6,
        })

        expect(result).toEqual({id: 42})
        expect(mocks.rpc).toHaveBeenCalledOnce()
        expect(mocks.rpc).toHaveBeenCalledWith("update_transaction_with_shared", expect.objectContaining({
            p_user_id: "user-1", p_transaction_id: 42, p_notes: "encrypted:Lunch", p_purpose: "expense",
            p_shared_mode: "set", p_shared_total: 24, p_shared_own_share: 6,
        }))
    })

    it("passes the second balance source through to the RPC when a split is given", async () => {
        mocks.rpc.mockResolvedValue({data: 42, error: null})
        await transactionsModel.updateExisting("user-1", {
            id: 42, date: new Date("2026-08-01"), amount: 11.5, isExpense: true, purpose: "expense", notes: "Pranzo",
            paymentType: 1, categoryTag: 4, userCategoryId: null,
            balanceSource: {asset_key: "digitalServices", detail_type: "liquidity", detail_id: 5},
            balanceSplit: {asset_key: "bank", detail_type: null, detail_id: null, amount: 3.5},
            sharedMode: "unchanged", sharedTotal: null, sharedOwnShare: null,
        })

        expect(mocks.rpc).toHaveBeenCalledWith("update_transaction_with_shared", expect.objectContaining({
            p_balance_asset_key: "digitalServices", p_balance_detail_type: "liquidity", p_balance_detail_id: 5,
            p_balance_asset_key_2: "bank", p_balance_detail_type_2: null, p_balance_detail_id_2: null, p_balance_amount_2: 3.5,
        }))
    })

    it("drops the split when there is no primary balance source", async () => {
        mocks.rpc.mockResolvedValue({data: 42, error: null})
        await transactionsModel.updateExisting("user-1", {
            id: 42, date: new Date("2026-08-01"), amount: 11.5, isExpense: true, purpose: "expense", notes: "Pranzo",
            paymentType: 1, categoryTag: 4, userCategoryId: null,
            balanceSource: null,
            balanceSplit: {asset_key: "bank", detail_type: null, detail_id: null, amount: 3.5},
            sharedMode: "unchanged", sharedTotal: null, sharedOwnShare: null,
        })

        expect(mocks.rpc).toHaveBeenCalledWith("update_transaction_with_shared", expect.objectContaining({
            p_balance_asset_key_2: null, p_balance_detail_type_2: null, p_balance_detail_id_2: null, p_balance_amount_2: null,
        }))
    })
})

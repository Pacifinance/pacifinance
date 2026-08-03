import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    insert: vi.fn(),
    select: vi.fn(),
    getReference: vi.fn(),
}))

vi.mock("../src/db/supabase", () => ({
    default: {from: vi.fn(() => ({insert: mocks.insert}))}
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

import expensesModel, { buildRecentMonthReferences } from "../src/db/models/expenses"

describe("expenses monthly buckets", () => {
    it("does not duplicate or skip short months when today is month-end", () => {
        const refs = buildRecentMonthReferences(new Date("2026-07-31T12:00:00.000Z"), 6)
        const keys = refs.map((date) => date.toISOString().slice(0, 7))

        expect(keys).toEqual(["2026-07", "2026-06", "2026-05", "2026-04", "2026-03", "2026-02"])
        expect(new Set(keys).size).toBe(keys.length)
    })
})

describe("expenses batch insert", () => {
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
        const result = await expensesModel.insertBatch("user-1", [
            {date: new Date("2026-08-01"), amount: 10, isExpense: true, notes: "Lunch", paymentType: 1, categoryTag: 4, userCategoryId: null, balanceSource: null},
            {date: new Date("2026-08-02"), amount: 20, isExpense: false, notes: "Refund", paymentType: 0, categoryTag: 0, userCategoryId: null, balanceSource: null},
        ])

        expect(result).toHaveLength(2)
        expect(mocks.getReference).toHaveBeenCalledTimes(4)
        expect(mocks.insert).toHaveBeenCalledOnce()
        expect(mocks.insert).toHaveBeenCalledWith([
            expect.objectContaining({user_id: "user-1", amount: 10, notes: "encrypted:Lunch", payment_type_tag_id: 2001, category_tag_id: 4}),
            expect.objectContaining({user_id: "user-1", amount: 20, notes: "encrypted:Refund", payment_type_tag_id: 2000, category_tag_id: 1000}),
        ])
    })

    it("aborts before writing if a tag reference cannot be resolved", async () => {
        mocks.getReference.mockResolvedValueOnce(null)
        const result = await expensesModel.insertBatch("user-1", [
            {date: new Date("2026-08-01"), amount: 10, isExpense: true, notes: "", paymentType: 1, categoryTag: 4, userCategoryId: null, balanceSource: null},
        ])
        expect(result).toBeNull()
        expect(mocks.insert).not.toHaveBeenCalled()
    })
})

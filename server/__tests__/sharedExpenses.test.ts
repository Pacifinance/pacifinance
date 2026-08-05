import { describe, expect, it } from "vitest"

import app from "../src/index"
import { authCookie, request } from "./helpers/http"
import { mockDb } from "./setup"

describe("shared-expenses routes", () => {
    it("requires an access-token cookie", async () => {
        const response = await request(app, "/api/shared-expenses/get", {method: "POST"})
        expect(response.status).toBe(401)
        expect(mockDb.sharedExpenses.getReceivablesByUserId).not.toHaveBeenCalled()
    })

    it("lists the user's receivables", async () => {
        mockDb.sharedExpenses.getReceivablesByUserId.mockResolvedValue([
            {id: 1, date: "2026-03-10", notes: "Uber vacation", totalAmount: 40, ownShare: 10, receivableAmount: 30, settledAmount: 0, status: "pending"}
        ])

        const response = await request(app, "/api/shared-expenses/get", {
            method: "POST",
            headers: {cookie: authCookie}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([
            {id: 1, date: "2026-03-10", notes: "Uber vacation", totalAmount: 40, ownShare: 10, receivableAmount: 30, settledAmount: 0, status: "pending"}
        ])
        expect(mockDb.sharedExpenses.getReceivablesByUserId).toHaveBeenCalledWith("user-uuid")
    })

    it("creates a receivable from a valid payload", async () => {
        mockDb.sharedExpenses.insertReceivable.mockResolvedValue({
            id: 2, date: "2026-03-10", notes: "Uber vacation", totalAmount: 40, ownShare: 10, receivableAmount: 30, settledAmount: 0, status: "pending"
        })

        const response = await request(app, "/api/shared-expenses/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {date: "2026-03-10", notes: "Uber vacation", total_amount: 40, own_share: 10}
        })

        expect(response.status).toBe(200)
        expect(response.json).toMatchObject({receivableAmount: 30})
        expect(mockDb.sharedExpenses.insertReceivable).toHaveBeenCalledWith("user-uuid", {
            occurredAt: expect.any(Date), notes: "Uber vacation", totalAmount: 40, ownShare: 10
        })
    })

    it("rejects a receivable where own_share is not smaller than total_amount", async () => {
        const response = await request(app, "/api/shared-expenses/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {date: "2026-03-10", total_amount: 40, own_share: 40}
        })

        expect(response.status).toBe(400)
        expect(mockDb.sharedExpenses.insertReceivable).not.toHaveBeenCalled()
    })

    it("rejects a receivable with a future date", async () => {
        const response = await request(app, "/api/shared-expenses/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {date: "2999-01-01", total_amount: 40, own_share: 10}
        })

        expect(response.status).toBe(400)
        expect(mockDb.sharedExpenses.insertReceivable).not.toHaveBeenCalled()
    })

    it("settles part of a receivable", async () => {
        mockDb.sharedExpenses.settleReceivable.mockResolvedValue({
            id: 2, date: "2026-03-10", notes: "", totalAmount: 40, ownShare: 10, receivableAmount: 30, settledAmount: 15, status: "partial"
        })

        const response = await request(app, "/api/shared-expenses/settle", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 2, amount: 15}
        })

        expect(response.status).toBe(200)
        expect(response.json).toMatchObject({settledAmount: 15, status: "partial"})
        expect(mockDb.sharedExpenses.settleReceivable).toHaveBeenCalledWith("user-uuid", 2, 15)
    })

    it("rejects a settle request with a non-positive amount", async () => {
        const response = await request(app, "/api/shared-expenses/settle", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 2, amount: 0}
        })

        expect(response.status).toBe(400)
        expect(mockDb.sharedExpenses.settleReceivable).not.toHaveBeenCalled()
    })

    it("links an existing outflow using either its stored cash amount or an explicit total", async () => {
        const response = await request(app, "/api/shared-expenses/link-expense", {
            method: "POST", headers: {cookie: authCookie},
            body: {expense_id: 12, own_share: 10, total_amount: 40}
        })
        expect(response.status).toBe(200)
        expect(mockDb.sharedExpenses.linkExistingExpense).toHaveBeenCalledWith("user-uuid", 12, 10, 40)
    })

    it("links an existing income to a receivable", async () => {
        const response = await request(app, "/api/shared-expenses/link-reimbursement", {
            method: "POST", headers: {cookie: authCookie}, body: {expense_id: 22, receivable_id: 4}
        })
        expect(response.status).toBe(200)
        expect(mockDb.sharedExpenses.linkExistingReimbursement).toHaveBeenCalledWith("user-uuid", 22, 4)
    })

    it("deletes a receivable", async () => {
        const response = await request(app, "/api/shared-expenses/delete", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 2}
        })

        expect(response.status).toBe(200)
        expect(mockDb.sharedExpenses.deleteReceivable).toHaveBeenCalledWith("user-uuid", 2)
    })

    it("returns 500 when deletion doesn't affect exactly one row", async () => {
        mockDb.sharedExpenses.deleteReceivable.mockResolvedValue({deletedCount: 0})

        const response = await request(app, "/api/shared-expenses/delete", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 999}
        })

        expect(response.status).toBe(500)
    })
})

import { describe, expect, it, vi } from "vitest"

import app from "../src/index"
import { authCookie, request } from "./helpers/http"
import { mockDb } from "./setup"

vi.mock("../src/libs/webPush", () => ({default: {sendPush: vi.fn()}}))

import webPush from "../src/libs/webPush"

describe("POST /api/notifications/test", () => {
    it("requires an access-token cookie", async () => {
        const response = await request(app, "/api/notifications/test", {method: "POST"})

        expect(response.status).toBe(401)
        expect(mockDb.notifications.getSubscriptionsForUsers).not.toHaveBeenCalled()
    })

    it("returns 404 when the user has no push subscription", async () => {
        mockDb.notifications.getSubscriptionsForUsers.mockResolvedValue(new Map())

        const response = await request(app, "/api/notifications/test", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {language: "en"}
        })

        expect(response.status).toBe(404)
        expect(webPush.sendPush).not.toHaveBeenCalled()
    })

    it("sends a localized test push to every subscription of the current user", async () => {
        mockDb.notifications.getSubscriptionsForUsers.mockResolvedValue(new Map([
            ["user-uuid", [
                {id: 1, endpoint: "https://push.example/a", p256dh: "key-a", auth: "auth-a", userAgent: null},
                {id: 2, endpoint: "https://push.example/b", p256dh: "key-b", auth: "auth-b", userAgent: null}
            ]]
        ]))
        vi.mocked(webPush.sendPush).mockResolvedValue(true)

        const response = await request(app, "/api/notifications/test", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {language: "it"}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({sent: 2})
        expect(mockDb.notifications.getSubscriptionsForUsers).toHaveBeenCalledWith(["user-uuid"])
        expect(webPush.sendPush).toHaveBeenCalledTimes(2)
        expect(webPush.sendPush).toHaveBeenCalledWith(
            {userId: "user-uuid", endpoint: "https://push.example/a", p256dh: "key-a", auth: "auth-a"},
            {title: "Notifica di prova", body: "Se vedi questo messaggio, le notifiche push funzionano.", url: "/settings", tag: "test"}
        )
    })

    it("counts only successful deliveries when some subscriptions are stale", async () => {
        mockDb.notifications.getSubscriptionsForUsers.mockResolvedValue(new Map([
            ["user-uuid", [
                {id: 1, endpoint: "https://push.example/a", p256dh: "key-a", auth: "auth-a", userAgent: null},
                {id: 2, endpoint: "https://push.example/b", p256dh: "key-b", auth: "auth-b", userAgent: null}
            ]]
        ]))
        vi.mocked(webPush.sendPush).mockResolvedValueOnce(true).mockResolvedValueOnce(false)

        const response = await request(app, "/api/notifications/test", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {language: "en"}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({sent: 1})
    })
})

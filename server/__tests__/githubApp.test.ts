import crypto from "crypto"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import githubApp from "../src/libs/githubApp"
import { mockRedis } from "./setup"

function decodeJwtPart(part: string): Record<string, unknown> {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"))
}

describe("githubApp.getInstallationToken", () => {
    const { privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    } as crypto.RSAKeyPairOptions<"pem", "pem">)

    beforeEach(() => {
        delete process.env.GITHUB_APP_ID
        delete process.env.GITHUB_APP_PRIVATE_KEY
        delete process.env.GITHUB_APP_INSTALLATION_ID
    })

    afterEach(() => {
        delete process.env.GITHUB_APP_ID
        delete process.env.GITHUB_APP_PRIVATE_KEY
        delete process.env.GITHUB_APP_INSTALLATION_ID
    })

    it("returns null when the app isn't configured at all", async () => {
        const token = await githubApp.getInstallationToken()

        expect(token).toBeNull()
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it("returns the Redis-cached token without signing a JWT or calling GitHub", async () => {
        mockRedis.get.mockResolvedValue("already-cached-token")

        const token = await githubApp.getInstallationToken()

        expect(token).toBe("already-cached-token")
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it("signs a JWT, exchanges it for an installation token, and caches the result", async () => {
        process.env.GITHUB_APP_ID = "123456"
        process.env.GITHUB_APP_PRIVATE_KEY = privateKey
        process.env.GITHUB_APP_INSTALLATION_ID = "987654"
        mockRedis.get.mockResolvedValue(null)

        const fetchMock = global.fetch as unknown as ReturnType<typeof import("vitest").vi.fn>
        // @ts-expect-error - test stub, real Response shape not needed
        fetchMock.mockResolvedValueOnce({
            status: 201,
            json: async () => ({ token: "fresh-installation-token", expires_at: new Date(Date.now() + 3600_000).toISOString() })
        })

        const token = await githubApp.getInstallationToken()

        expect(token).toBe("fresh-installation-token")
        expect(fetchMock).toHaveBeenCalledTimes(1)

        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe("https://api.github.com/app/installations/987654/access_tokens")

        const jwt = init.headers.authorization.replace("Bearer ", "")
        const [encodedHeader, encodedPayload, encodedSignature] = jwt.split(".")
        expect(decodeJwtPart(encodedHeader)).toEqual({ alg: "RS256", typ: "JWT" })
        const payload = decodeJwtPart(encodedPayload)
        expect(payload.iss).toBe("123456")
        expect(typeof payload.iat).toBe("number")
        expect(typeof payload.exp).toBe("number")
        expect(encodedSignature.length).toBeGreaterThan(0)

        expect(mockRedis.set).toHaveBeenCalledWith(
            "githubAppInstallationToken",
            "fresh-installation-token",
            { ex: 50 * 60 }
        )
    })

    it("returns null without throwing when GitHub rejects the JWT exchange", async () => {
        process.env.GITHUB_APP_ID = "123456"
        process.env.GITHUB_APP_PRIVATE_KEY = privateKey
        process.env.GITHUB_APP_INSTALLATION_ID = "987654"
        mockRedis.get.mockResolvedValue(null)

        const fetchMock = global.fetch as unknown as ReturnType<typeof import("vitest").vi.fn>
        // @ts-expect-error - test stub, real Response shape not needed
        fetchMock.mockResolvedValueOnce({ status: 401 })

        const token = await githubApp.getInstallationToken()

        expect(token).toBeNull()
        expect(mockRedis.set).not.toHaveBeenCalled()
    })

    it("returns null without throwing when the private key is malformed", async () => {
        process.env.GITHUB_APP_ID = "123456"
        process.env.GITHUB_APP_PRIVATE_KEY = "not-a-real-pem-key"
        process.env.GITHUB_APP_INSTALLATION_ID = "987654"
        mockRedis.get.mockResolvedValue(null)

        const token = await githubApp.getInstallationToken()

        expect(token).toBeNull()
        expect(global.fetch).not.toHaveBeenCalled()
    })
})

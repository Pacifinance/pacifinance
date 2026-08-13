import { describe, expect, it, vi } from "vitest"

import { USER_DATA_DOMAINS, EXCLUDED_MODELS } from "../src/libs/userDataDomains"

/**
 * Guards the exact gap this suite exists to prevent: a new user-data domain
 * (a new db/db.ts model, e.g. a future "budgets" or "assets" feature) that
 * never gets wired into the GDPR data-export endpoint, because nothing forces
 * anyone to remember it. Every db/db.ts model must appear either in
 * USER_DATA_DOMAINS (exported) or EXCLUDED_MODELS (explicitly not user data,
 * with a stated reason) - if it's in neither, this test fails.
 *
 * Deliberately imports the REAL db/db.ts via importActual rather than the
 * mocked one server/__tests__/setup.ts installs for every other test: the
 * mock's key list is hand-maintained too, so checking against it would only
 * ever catch a drift between the registry and the mock, never a drift
 * between the registry and the actual set of models the app ships.
 */
describe("user data domain registry", () => {
    async function realDbModelKeys(): Promise<string[]> {
        const actual = await vi.importActual<{default: Record<string, unknown>}>("../src/db/db")
        return Object.keys(actual.default)
    }

    it("accounts for every model registered in db/db.ts", async () => {
        const dbModelKeys = await realDbModelKeys()
        const registeredModels = new Set(USER_DATA_DOMAINS.map((domain) => domain.model))
        const excludedModels = new Set(EXCLUDED_MODELS.map((entry) => entry.model))

        const unaccountedFor = dbModelKeys.filter((key) => !registeredModels.has(key) && !excludedModels.has(key))
        expect(unaccountedFor).toEqual([])
    })

    it("only registers models that actually exist on db/db.ts", async () => {
        const dbModelKeys = new Set(await realDbModelKeys())
        for (const domain of USER_DATA_DOMAINS) {
            expect(dbModelKeys.has(domain.model), `USER_DATA_DOMAINS entry "${domain.key}" references unknown model "${domain.model}"`).toBe(true)
        }
        for (const entry of EXCLUDED_MODELS) {
            expect(dbModelKeys.has(entry.model), `EXCLUDED_MODELS entry references unknown model "${entry.model}"`).toBe(true)
        }
    })

    it("has a non-empty, distinct key for every domain", () => {
        const keys = USER_DATA_DOMAINS.map((domain) => domain.key)
        expect(keys.every((key) => key.length > 0)).toBe(true)
        expect(new Set(keys).size).toBe(keys.length)
    })

    it("gives every excluded model a non-empty justification", () => {
        for (const entry of EXCLUDED_MODELS) {
            expect(entry.reason.length).toBeGreaterThan(0)
        }
    })
})

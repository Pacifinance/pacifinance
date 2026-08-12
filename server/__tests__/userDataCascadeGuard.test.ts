import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"

/**
 * Account deletion (server/src/db/models/users.ts deleteUserById) is a single
 * Supabase Auth delete that relies entirely on every user-owned table's FK to
 * auth.users(id) being ON DELETE CASCADE - there is no per-table cleanup code
 * to forget to write, but there IS a schema convention to forget to follow.
 * This scans every SQL file for `<column> uuid ... references auth.users(id)`
 * declarations (the only style this schema uses for such FKs - see
 * supabase/schema.sql and supabase/migrations/*.sql) and fails if one is
 * missing "on delete cascade", unless it's in ALLOWED_NON_CASCADE_REFERENCES
 * with a stated reason (e.g. a reviewer/moderator reference, not an owner
 * reference - see instrument_historical_prices.verified_by below, the one
 * real instance found and fixed by a later migration rather than by editing
 * the historical CREATE TABLE statement).
 */

const supabaseDir = fileURLToPath(new URL("../../supabase", import.meta.url))

const ALLOWED_NON_CASCADE_REFERENCES: {file: string; column: string; reason: string}[] = [
    {
        file: "add-community-historical-prices.sql",
        column: "verified_by",
        reason: "Records which admin reviewed a submission, not who owns it (submitted_by is CASCADE and is the real owner FK). Corrected to ON DELETE SET NULL by a later ALTER in fix-community-price-verified-by-cascade.sql; this original CREATE TABLE statement is left as historical record rather than edited after the fact.",
    },
]

const USER_REFERENCE_PATTERN = /(\w+)\s+uuid\b(?:(?!references|,|;|\n).)*references\s+auth\.users\(id\)([^,;\n]*)/gi

function findSqlFiles(): string[] {
    const migrationsDir = path.join(supabaseDir, "migrations")
    const migrationFiles = readdirSync(migrationsDir)
        .filter((name) => name.endsWith(".sql"))
        .map((name) => path.join(migrationsDir, name))
    return [path.join(supabaseDir, "schema.sql"), ...migrationFiles]
}

interface UserReference {
    file: string
    column: string
    hasCascade: boolean
}

function findUserReferences(): UserReference[] {
    const references: UserReference[] = []
    for (const filePath of findSqlFiles()) {
        const content = readFileSync(filePath, "utf-8")
        const fileName = path.basename(filePath)
        for (const match of content.matchAll(USER_REFERENCE_PATTERN)) {
            const [, column, tail] = match
            references.push({file: fileName, column, hasCascade: /on delete cascade/i.test(tail)})
        }
    }
    return references
}

describe("user-data FK cascade guard", () => {
    it("finds at least one auth.users(id) reference (sanity check that the scanner works)", () => {
        expect(findUserReferences().length).toBeGreaterThan(0)
    })

    it("every auth.users(id) reference is ON DELETE CASCADE, or explicitly allowlisted with a reason", () => {
        const violations = findUserReferences().filter((ref) => {
            if (ref.hasCascade) return false
            return !ALLOWED_NON_CASCADE_REFERENCES.some((allowed) => allowed.file === ref.file && allowed.column === ref.column)
        })
        expect(violations).toEqual([])
    })

    it("keeps the allowlist free of stale entries (column now correctly cascades, or file no longer exists)", () => {
        const references = findUserReferences()
        for (const allowed of ALLOWED_NON_CASCADE_REFERENCES) {
            const match = references.find((ref) => ref.file === allowed.file && ref.column === allowed.column)
            expect(match, `allowlisted ${allowed.file}:${allowed.column} no longer matches any reference - remove the stale entry`).toBeDefined()
            expect(match?.hasCascade, `${allowed.file}:${allowed.column} is now ON DELETE CASCADE - remove it from the allowlist`).toBe(false)
        }
    })
})

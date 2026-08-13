import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"

/**
 * Account deletion (server/src/db/models/users.ts deleteUserById) is a single
 * Supabase Auth delete that relies entirely on every user-owned table's FK to
 * auth.users(id) being ON DELETE CASCADE - there is no per-table cleanup code
 * to forget to write, but there IS a schema convention to forget to follow.
 * This scans every SQL file for references to auth.users(id) in either style
 * this schema uses:
 *   - inline column definition: `<column> uuid ... references auth.users(id)`
 *     (hand-written migrations that CREATE a new table)
 *   - a separate constraint: `FOREIGN KEY (<column>) REFERENCES auth.users(id)`,
 *     quoted or not (hand-written ALTER-TABLE migrations, and the whole of
 *     supabase/schema.sql, which is a `supabase db dump` and always uses this
 *     style even for a table's very first CREATE)
 * and fails if one is missing "on delete cascade", unless it's in
 * ALLOWED_NON_CASCADE_REFERENCES with a stated reason (e.g. a
 * reviewer/moderator reference, not an owner reference - see
 * instrument_historical_prices.verified_by below, the one real instance
 * found and fixed by a later migration rather than by editing the
 * historical CREATE TABLE statement).
 */

const supabaseDir = fileURLToPath(new URL("../../supabase", import.meta.url))

const ALLOWED_NON_CASCADE_REFERENCES: {file: string; column: string; reason: string}[] = [
    {
        file: "add-community-historical-prices.sql",
        column: "verified_by",
        reason: "Records which admin reviewed a submission, not who owns it (submitted_by is CASCADE and is the real owner FK). Corrected to ON DELETE SET NULL by a later ALTER in fix-community-price-verified-by-cascade.sql; this original CREATE TABLE statement is left as historical record rather than edited after the fact.",
    },
    {
        file: "fix-community-price-verified-by-cascade.sql",
        column: "verified_by",
        reason: "The ALTER that applies the SET NULL correction referenced above - same reasoning, not a bug.",
    },
    {
        file: "fix-community-price-submitted-by-cascade.sql",
        column: "submitted_by",
        reason: "submitted_by is the real owner FK and normally CASCADE, but this ALTER intentionally weakens it to SET NULL so that deleting a contributor's account doesn't take down community prices other users' portfolios already rely on (see the migration's own comment). The application already treats submitted_by as nullable for provider-sourced rows.",
    },
    {
        file: "schema.sql",
        column: "verified_by",
        reason: "Same as the add-community-historical-prices.sql/fix-community-price-verified-by-cascade.sql entries above - schema.sql is a full dump of the current database, so it shows the corrected ON DELETE SET NULL directly on the CREATE-adjacent constraint rather than as a separate historical ALTER.",
    },
    {
        file: "schema.sql",
        column: "submitted_by",
        reason: "Same as the fix-community-price-submitted-by-cascade.sql entry above - schema.sql reflects the already-corrected live database state.",
    },
]

const INLINE_REFERENCE_PATTERN = /(\w+)\s+uuid\b(?:(?!references|,|;|\n).)*references\s+auth\.users\(id\)([^,;\n]*)/gi

// Matches a separate `FOREIGN KEY (col) REFERENCES auth.users(id)` constraint,
// with or without double-quoted identifiers and an `auth.`/`"auth".` schema
// prefix - the form every ALTER-TABLE migration and the whole of the
// dump-generated schema.sql use (pg_dump never emits the inline column style).
const CONSTRAINT_REFERENCE_PATTERN = /FOREIGN KEY\s*\(\s*"?(\w+)"?\s*\)\s*REFERENCES\s+"?auth"?\."?users"?\(\s*"?id"?\s*\)([^,;\n]*)/gi

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
        for (const pattern of [INLINE_REFERENCE_PATTERN, CONSTRAINT_REFERENCE_PATTERN]) {
            for (const match of content.matchAll(pattern)) {
                const [, column, tail] = match
                references.push({file: fileName, column, hasCascade: /on delete cascade/i.test(tail)})
            }
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

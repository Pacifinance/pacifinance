import supabase from "../db/supabase"
import users from "../db/models/users"
import tagsModel from "../db/models/tags"

/**
 * Single source of truth for "similar users" cohort selection, replacing the
 * old exact-match-on-3-fields rule (job type, job country, work time) that
 * was duplicated between this codebase and two Postgres RPCs. See
 * server/src/services/similarUsers.test.ts and the design note in
 * supabase/schema.sql next to get_balance_ranking_pool.
 */

export type ComparisonMetric = "balance" | "incomes" | "outflows" | "general"

type CategoricalField =
    "jobCountry" | "job" | "jobType" | "workTime" | "remoteType" |
    "livingSituation" | "housingType" | "children" | "country"
type OrdinalField = "age" | "yearsOfExperience"
type Field = CategoricalField | OrdinalField

export const CATEGORICAL_FIELDS: CategoricalField[] = [
    "jobCountry", "job", "jobType", "workTime", "remoteType",
    "livingSituation", "housingType", "children", "country"
]
export const ORDINAL_FIELDS: OrdinalField[] = ["age", "yearsOfExperience"]

// `satisfies` both keeps the literal column-name types AND fails to compile
// if a Field is missing/misspelled below.
const FIELD_COLUMN = {
    jobCountry: "job_country_tag_id",
    job: "job_tag_id",
    jobType: "job_type_tag_id",
    workTime: "work_time_tag_id",
    remoteType: "remote_type_tag_id",
    livingSituation: "living_situation_tag_id",
    housingType: "housing_type_tag_id",
    children: "children_tag_id",
    country: "country_tag_id",
    age: "age_tag_id",
    yearsOfExperience: "years_of_experience_tag_id",
} as const satisfies Record<Field, string>

export const PROFILE_COLUMNS = `id, account_type, ${Object.values(FIELD_COLUMN).join(", ")}`

type ColumnName = typeof FIELD_COLUMN[Field]

export type ProfileTagIds = { id: string, account_type: number } & {
    [column in ColumnName]?: number | null
}

/**
 * Relative field weights per comparison metric (normalized at scoring time,
 * so only the ratios between fields matter). jobCountry/age dominate net
 * worth (cost of living, life-stage accumulation); job/jobType/workTime
 * dominate income; housingType/children/livingSituation dominate outflows.
 * "general" (used for savings rate, which mixes income and outflow behavior)
 * is the midpoint of the incomes and outflows tables.
 */
const INCOMES_WEIGHTS: Record<Field, number> = {
    jobCountry: 20, age: 8, yearsOfExperience: 14, job: 18, jobType: 16,
    workTime: 16, housingType: 2, livingSituation: 2, children: 2, country: 1, remoteType: 1
}
const OUTFLOWS_WEIGHTS: Record<Field, number> = {
    jobCountry: 22, age: 10, yearsOfExperience: 3, job: 4, jobType: 3,
    workTime: 3, housingType: 20, livingSituation: 14, children: 16, country: 4, remoteType: 1
}

const WEIGHTS: Record<ComparisonMetric, Record<Field, number>> = {
    balance: {
        jobCountry: 18, age: 18, yearsOfExperience: 14, job: 12, jobType: 12,
        workTime: 10, housingType: 8, livingSituation: 4, children: 2, country: 1, remoteType: 1
    },
    incomes: INCOMES_WEIGHTS,
    outflows: OUTFLOWS_WEIGHTS,
    general: Object.fromEntries(
        [...CATEGORICAL_FIELDS, ...ORDINAL_FIELDS].map((field) =>
            [field, (INCOMES_WEIGHTS[field] + OUTFLOWS_WEIGHTS[field]) / 2]
        )
    ) as Record<Field, number>
}

/**
 * Ideal/target cohort size once the platform has enough users to support it.
 * Below this, selectCohort() falls back to the best-available matches rather
 * than reporting "no data" - see selectCohort for the small-population case.
 */
export const MIN_COHORT = 20
/** Perf/stability cap: no statistical benefit to a larger cohort. */
export const MAX_COHORT = 300
/** Target cohort size as a fraction of the eligible population. */
const TARGET_FRACTION = 0.15
const SIMILARITY_FLOOR_START = 0.5
const SIMILARITY_FLOOR_STEP = 0.1
const SIMILARITY_FLOOR_MIN = 0.2

export type OrdinalTagMeta = {
    indexById: Map<number, number>,
    spanByField: Record<OrdinalField, number>
}

/**
 * Computes a [0,1] similarity score between a reference profile and a
 * candidate profile for a given comparison metric.
 * - Categorical fields score 1 (exact tag match) or 0.
 * - Ordinal fields (age, yearsOfExperience) score by normalized distance
 *   between their tags' client_index, so adjacent brackets get partial credit.
 * - Fields the reference user hasn't filled in are excluded entirely (not
 *   counted as a mismatch); fields the candidate hasn't filled in score 0.
 */
export function similarityScore(
    reference: ProfileTagIds,
    candidate: ProfileTagIds,
    metric: ComparisonMetric,
    tagMeta: OrdinalTagMeta
): number {
    const weights = WEIGHTS[metric]
    let weightedSum = 0
    let weightTotal = 0

    for (const field of CATEGORICAL_FIELDS) {
        const column = FIELD_COLUMN[field]
        const refValue = reference[column]
        if (refValue === null || refValue === undefined) continue
        const weight = weights[field]
        weightTotal += weight
        if (candidate[column] === refValue) weightedSum += weight
    }

    for (const field of ORDINAL_FIELDS) {
        const column = FIELD_COLUMN[field]
        const refTagId = reference[column]
        if (refTagId === null || refTagId === undefined) continue
        const refIndex = tagMeta.indexById.get(refTagId)
        if (refIndex === undefined) continue
        const weight = weights[field]
        weightTotal += weight

        const candTagId = candidate[column]
        const candIndex = candTagId !== null && candTagId !== undefined ? tagMeta.indexById.get(candTagId) : undefined
        if (candIndex === undefined) continue // candidate hasn't answered this field -> scores 0

        const span = tagMeta.spanByField[field]
        const fieldScore = span > 0 ? Math.max(0, 1 - Math.abs(refIndex - candIndex) / span) : (candIndex === refIndex ? 1 : 0)
        weightedSum += weight * fieldScore
    }

    return weightTotal === 0 ? 0 : weightedSum / weightTotal
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

export type SimilarUsersResult = {
    userIds: string[],
    insufficientData: boolean,
    populationSize: number,
    /** Mean similarity of the selected cohort, in the [0,1] range. */
    averageSimilarity: number | null
}

/**
 * Given every eligible candidate already scored against the reference user,
 * picks the cohort: a target size scaled to the population (capped), among
 * candidates clearing a similarity floor that relaxes if the population is
 * too heterogeneous to hit the anonymity minimum otherwise.
 */
export function selectCohort(scoredCandidates: Array<{ id: string, score: number }>, populationSize: number): SimilarUsersResult {
    // Only a truly empty population means there is no one to compare against at
    // all. Below MIN_COHORT, the platform is still small (few active users) -
    // rather than blocking the feature outright, fall back to the best-available
    // matches: an approximate comparison beats none. MIN_COHORT/the similarity
    // floor still shape target size and quality once the population is large
    // enough to support them.
    if (populationSize === 0) return {
        userIds: [], insufficientData: true, populationSize: 0, averageSimilarity: null
    }

    const sorted = [...scoredCandidates].sort((a, b) => b.score - a.score)
    const targetSize = Math.min(populationSize, clamp(Math.round(populationSize * TARGET_FRACTION), MIN_COHORT, MAX_COHORT))
    const idealSize = Math.min(MIN_COHORT, populationSize)

    let cohort: Array<{ id: string, score: number }> = []
    for (let floor = SIMILARITY_FLOOR_START; floor >= SIMILARITY_FLOOR_MIN - 1e-9; floor -= SIMILARITY_FLOOR_STEP) {
        cohort = sorted.filter((c) => c.score >= floor).slice(0, targetSize)
        if (cohort.length >= idealSize) break
    }

    // Even the lowest floor found nobody (small, very heterogeneous population):
    // use the best-available candidates regardless of score instead of nothing.
    if (cohort.length === 0) cohort = sorted.slice(0, targetSize)

    const averageSimilarity = cohort.length > 0
        ? cohort.reduce((sum, candidate) => sum + candidate.score, 0) / cohort.length
        : null

    return {
        userIds: cohort.map((c) => c.id),
        insufficientData: false,
        populationSize,
        averageSimilarity
    }
}

function spanOf(values: number[]) {
    if (values.length === 0) return 0
    return Math.max(...values) - Math.min(...values)
}

async function buildOrdinalTagMeta(): Promise<OrdinalTagMeta> {
    const { data, error } = await supabase.from("tags")
        .select("id, client_index, type")
        .in("type", [tagsModel.TagType.age.value, tagsModel.TagType.yearsOfExperience.value])
    if (error) console.error("similarUsers.buildOrdinalTagMeta: failed to read tags", error)

    const indexById = new Map<number, number>()
    const valuesByType: { [type: number]: number[] } = {}
    for (const row of (data ?? []) as Array<{ id: number, client_index: number, type: number }>) {
        indexById.set(row.id, row.client_index)
        ;(valuesByType[row.type] ??= []).push(row.client_index)
    }

    return {
        indexById,
        spanByField: {
            age: spanOf(valuesByType[tagsModel.TagType.age.value] ?? []),
            yearsOfExperience: spanOf(valuesByType[tagsModel.TagType.yearsOfExperience.value] ?? [])
        }
    }
}

export type ProfilesSnapshot = { profiles: ProfileTagIds[], tagMeta: OrdinalTagMeta }

/**
 * Fetches the full profiles table + ordinal tag metadata once. Callers that
 * need to resolve cohorts for many (user, metric) pairs in the same run (e.g.
 * the monthly averages/rankings cron, which needs 7 cohorts per user) should
 * fetch this once and reuse it via selectSimilarUserIds, instead of calling
 * getSimilarUserIds per pair - each call otherwise re-fetches the entire
 * profiles table from scratch.
 */
async function fetchProfilesSnapshot(): Promise<ProfilesSnapshot> {
    const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS)
    if (error) console.error("similarUsers.fetchProfilesSnapshot: failed to read profiles", error)
    const profiles = (data ?? []) as unknown as ProfileTagIds[]
    const tagMeta = await buildOrdinalTagMeta()
    return { profiles, tagMeta }
}

/**
 * Resolves the "similar users" cohort for a reference user and a given
 * comparison metric, given an already-fetched profiles snapshot. Pure/in-memory:
 * no DB access. Returns insufficientData=true (renders as the existing
 * "Prossimamente" state on the frontend) when there aren't enough eligible
 * users, or the population is too heterogeneous to reach the anonymity floor.
 * @param snapshot Result of fetchProfilesSnapshot(), reusable across many calls
 * @param referenceUserId uuid of the user requesting the comparison
 * @param metric Which comparison this cohort is for (weights differ per metric)
 * @param opts.ignoreTestUsers Exclude test/demo accounts from the pool (default true)
 */
function selectSimilarUserIds(
    snapshot: ProfilesSnapshot,
    referenceUserId: string,
    metric: ComparisonMetric,
    opts: { ignoreTestUsers?: boolean } = {}
): SimilarUsersResult {
    const ignoreTestUsers = opts.ignoreTestUsers ?? true
    const { profiles, tagMeta } = snapshot

    const reference = profiles.find((p) => p.id === referenceUserId)
    if (!reference) return {
        userIds: [], insufficientData: true, populationSize: 0, averageSimilarity: null
    }

    let eligible = profiles.filter((p) => p.id !== referenceUserId)
    if (ignoreTestUsers) eligible = eligible.filter((p) => p.account_type < users.UserType.test.value)

    if (eligible.length < MIN_COHORT) return {
        userIds: [], insufficientData: true, populationSize: eligible.length, averageSimilarity: null
    }

    const scored = eligible.map((p) => ({ id: p.id, score: similarityScore(reference, p, metric, tagMeta) }))

    return selectCohort(scored, eligible.length)
}

/**
 * Convenience one-shot wrapper around fetchProfilesSnapshot + selectSimilarUserIds
 * for callers resolving a single cohort (e.g. one-off scripts, tests). Callers
 * resolving many cohorts in the same run should use those two functions directly
 * to share one profiles fetch instead of paying for one per cohort.
 */
async function getSimilarUserIds(
    referenceUserId: string,
    metric: ComparisonMetric,
    opts: { ignoreTestUsers?: boolean } = {}
): Promise<SimilarUsersResult> {
    const snapshot = await fetchProfilesSnapshot()
    return selectSimilarUserIds(snapshot, referenceUserId, metric, opts)
}

export default {
    getSimilarUserIds, fetchProfilesSnapshot, selectSimilarUserIds, similarityScore, selectCohort
}

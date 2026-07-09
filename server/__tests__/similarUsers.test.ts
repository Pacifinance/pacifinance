import { describe, expect, it } from "vitest"

import {
    similarityScore, selectCohort, MIN_COHORT, MAX_COHORT,
    type ProfileTagIds, type OrdinalTagMeta
} from "../src/services/similarUsers"

// age tags: client_index 0..4 (5 brackets), yearsOfExperience: 0..3 (4 brackets)
const tagMeta: OrdinalTagMeta = {
    indexById: new Map([
        [100, 0], [101, 1], [102, 2], [103, 3], [104, 4], // age tags
        [200, 0], [201, 1], [202, 2], [203, 3],           // yearsOfExperience tags
    ]),
    spanByField: { age: 4, yearsOfExperience: 3 }
}

function profile(overrides: Partial<ProfileTagIds> = {}): ProfileTagIds {
    return {
        id: "u", account_type: 0,
        job_country_tag_id: 1, job_tag_id: 1, job_type_tag_id: 1, work_time_tag_id: 1,
        remote_type_tag_id: 1, living_situation_tag_id: 1, housing_type_tag_id: 1,
        children_tag_id: 1, country_tag_id: 1, age_tag_id: 102, years_of_experience_tag_id: 201,
        ...overrides
    }
}

describe("similarityScore", () => {
    it("scores an identical profile as perfectly similar", () => {
        const reference = profile()
        const candidate = profile()
        expect(similarityScore(reference, candidate, "balance", tagMeta)).toBe(1)
    })

    it("scores a fully mismatched categorical-only profile as 0", () => {
        const reference = profile({ years_of_experience_tag_id: undefined, age_tag_id: undefined })
        const candidate = profile({
            job_country_tag_id: 2, job_tag_id: 2, job_type_tag_id: 2, work_time_tag_id: 2,
            remote_type_tag_id: 2, living_situation_tag_id: 2, housing_type_tag_id: 2,
            children_tag_id: 2, country_tag_id: 2
        })
        expect(similarityScore(reference, candidate, "balance", tagMeta)).toBe(0)
    })

    it("gives partial credit to adjacent ordinal brackets instead of treating them as a mismatch", () => {
        const reference = profile({ age_tag_id: 102 }) // index 2
        const adjacent = profile({ age_tag_id: 103 })  // index 3, distance 1/4
        const far = profile({ age_tag_id: 100 })       // index 0, distance 2/4

        const scoreAdjacent = similarityScore(reference, adjacent, "balance", tagMeta)
        const scoreFar = similarityScore(reference, far, "balance", tagMeta)

        expect(scoreAdjacent).toBeGreaterThan(scoreFar)
        expect(scoreAdjacent).toBeLessThan(1)
        expect(scoreFar).toBeGreaterThan(0)
    })

    it("excludes fields the reference user left unanswered, rather than penalizing every candidate", () => {
        const reference = profile({ housing_type_tag_id: null, children_tag_id: null })
        const candidateA = profile({ housing_type_tag_id: 5, children_tag_id: 5 })
        const candidateB = profile({ housing_type_tag_id: 6, children_tag_id: 6 })
        // Both candidates disagree with each other on the unanswered fields, but since the
        // reference never answered them, both should score identically (perfect match on the rest).
        expect(similarityScore(reference, candidateA, "outflows", tagMeta)).toBe(1)
        expect(similarityScore(reference, candidateB, "outflows", tagMeta)).toBe(1)
    })

    it("penalizes a candidate that left an answered reference field blank", () => {
        const reference = profile({ housing_type_tag_id: 5 })
        const complete = profile({ housing_type_tag_id: 5 })
        const incomplete = profile({ housing_type_tag_id: null })
        const scoreComplete = similarityScore(reference, complete, "outflows", tagMeta)
        const scoreIncomplete = similarityScore(reference, incomplete, "outflows", tagMeta)
        expect(scoreComplete).toBeGreaterThan(scoreIncomplete)
    })

    it("weighs housing/children/livingSituation more for outflows than for incomes", () => {
        const reference = profile()
        // Candidate matches only on housingType/children/livingSituation, mismatches everything else
        const candidate = profile({
            job_country_tag_id: 2, job_tag_id: 2, job_type_tag_id: 2, work_time_tag_id: 2,
            remote_type_tag_id: 2, country_tag_id: 2, age_tag_id: 100, years_of_experience_tag_id: 200
        })
        const outflowsScore = similarityScore(reference, candidate, "outflows", tagMeta)
        const incomesScore = similarityScore(reference, candidate, "incomes", tagMeta)
        expect(outflowsScore).toBeGreaterThan(incomesScore)
    })

    it("returns 0 when the reference profile has no field answered at all", () => {
        const reference = profile({
            job_country_tag_id: null, job_tag_id: null, job_type_tag_id: null, work_time_tag_id: null,
            remote_type_tag_id: null, living_situation_tag_id: null, housing_type_tag_id: null,
            children_tag_id: null, country_tag_id: null, age_tag_id: null, years_of_experience_tag_id: null
        })
        expect(similarityScore(reference, profile(), "general", tagMeta)).toBe(0)
    })
})

describe("selectCohort", () => {
    it("returns insufficientData when the eligible population is below the anonymity floor", () => {
        const candidates = Array.from({ length: MIN_COHORT - 1 }, (_, i) => ({ id: `u${i}`, score: 1 }))
        const result = selectCohort(candidates, candidates.length)
        expect(result.insufficientData).toBe(true)
        expect(result.userIds).toEqual([])
    })

    it("caps the cohort at MAX_COHORT even with a huge, uniformly similar population", () => {
        const populationSize = 5000
        const candidates = Array.from({ length: populationSize }, (_, i) => ({ id: `u${i}`, score: 1 }))
        const result = selectCohort(candidates, populationSize)
        expect(result.insufficientData).toBe(false)
        expect(result.userIds.length).toBe(MAX_COHORT)
    })

    it("scales cohort size with population when below the max cap", () => {
        const populationSize = 200 // 15% -> 30
        const candidates = Array.from({ length: populationSize }, (_, i) => ({ id: `u${i}`, score: 1 }))
        const result = selectCohort(candidates, populationSize)
        expect(result.userIds.length).toBe(30)
    })

    it("relaxes the similarity floor to still reach the anonymity minimum in a heterogeneous population", () => {
        const populationSize = 50
        // Only a handful score above 0.5; most are middling (0.3) — a strict 0.5 floor alone
        // would fall short of MIN_COHORT, so the floor must relax down toward 0.2.
        const candidates = [
            ...Array.from({ length: 5 }, (_, i) => ({ id: `high${i}`, score: 0.9 })),
            ...Array.from({ length: populationSize - 5 }, (_, i) => ({ id: `mid${i}`, score: 0.3 }))
        ]
        const result = selectCohort(candidates, populationSize)
        expect(result.insufficientData).toBe(false)
        expect(result.userIds.length).toBeGreaterThanOrEqual(MIN_COHORT)
    })

    it("returns insufficientData when even the relaxed floor can't reach the anonymity minimum", () => {
        const populationSize = 30
        const candidates = [
            ...Array.from({ length: 5 }, (_, i) => ({ id: `ok${i}`, score: 0.25 })),
            ...Array.from({ length: populationSize - 5 }, (_, i) => ({ id: `low${i}`, score: 0.05 }))
        ]
        const result = selectCohort(candidates, populationSize)
        expect(result.insufficientData).toBe(true)
        expect(result.userIds).toEqual([])
    })
})

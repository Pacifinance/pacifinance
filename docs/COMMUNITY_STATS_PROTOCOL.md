# Community Stats Protocol (draft v1)

This document defines the boundary between a self-hosted PaciFinance instance
and the optional hosted community-statistics service. It is a protocol draft,
not an enabled network endpoint.

## Non-negotiable rules

- Participation is opt-in at both instance and account level.
- Transactions, notes, merchant names, identifiers and raw balance snapshots
  never leave the self-hosted instance.
- A contribution is monthly, rounded and bucketed before it is serialized.
- The service rejects groups smaller than the published privacy threshold.
- Revocation must remove the latest contribution and issue a signed receipt.

## Contribution envelope

Each instance sends one signed envelope per completed month:

```json
{
  "protocolVersion": "1",
  "algorithmVersion": "similarity-v1",
  "period": "2026-06",
  "installationPseudonym": "rotating-monthly-id",
  "profileBuckets": {
    "career": "bucket-id",
    "location": "bucket-id",
    "lifeStage": "bucket-id",
    "household": "bucket-id"
  },
  "metrics": {
    "netWorth": 25000,
    "monthlyIncome": 3000,
    "monthlyOutflows": 1800,
    "savingRate": 40,
    "emergencyRunwayMonths": 6,
    "fixedCostRatio": 28,
    "assetAllocation": { "liquid": 40, "equity": 50, "crypto": 10 }
  },
  "quality": { "monthsOfHistory": 14, "completeness": "complete" },
  "signature": "instance-signature"
}
```

Amounts are rounded to a documented granularity before submission. Category
metrics use official parent-category IDs only. The service stores a rotating
pseudonym, never the local account ID.

## Response snapshot

The server returns only group aggregates: contributor count, median, quartiles,
reliability, methodology and a signature over the full response. Clients must
show its period and algorithm version. A self-hosted instance verifies the
signature before presenting the result.

## Retention and revocation

Raw envelopes have short retention (target: 90 days). Published aggregate
snapshots are versioned and retained only while they satisfy their privacy
threshold. A revocation request carries the rotating pseudonym and signed
receipt; it deletes matching retained envelopes and returns a signed deletion
receipt. Historical aggregates are not rewritten below their published privacy
threshold; this policy must be explicit in the hosted privacy notice.

## Abuse and bias controls

- Minimum contributor threshold and query-budget limits prevent differencing.
- Rotating pseudonyms, signed installations and rate limits raise Sybil cost.
- Contributions receive a quality score from history length and completeness,
  not from financial level.
- Rare profile combinations are coarsened or withheld.
- Releases include cohort-size, missingness and representation audits.

## Out of scope for v1

No employer ranking, individual matching, causal job-change advice, or public
microdata export. Scenario tools remain observational and must display their
assumptions and uncertainty.

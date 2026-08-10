# Pacifinance Documentation

This folder contains product, architecture, migration, SEO, and open-source operations notes for Pacifinance.

## Start Here

- [Architecture Guide](ARCHITECTURE.md) explains the frontend/backend structure and local conventions.
- [Product Vision & Long-Term Roadmap](PRODUCT_VISION.md) — where the product is headed beyond a finance tracker (simulations, generic assets, a context engine, optional AI), organized Now/Next/Later/Research for contributors and supporters.
- [Open Source Product Charter](OPEN_SOURCE_PRODUCT_CHARTER.md) — license, public terminology, and the project's sustainability model.
- [Privacy And Anonymity](PRIVACY_ANONYMITY.md) defines the privacy model for an open-source, comparison-focused finance product.
- [Community Benchmark Strategy](COMMUNITY_BENCHMARK_STRATEGY.md) explains how anonymous comparisons should stay useful and safe.
- [Community Stats Protocol](COMMUNITY_STATS_PROTOCOL.md) describes the draft boundary for optional hosted community statistics.
- [Future Feature Designs](FUTURE_DESIGNS.md) — technical proposals for features that aren't built yet, for anyone who wants to pick one up.

## Product And Privacy

Pacifinance is meant to make personal finance clearer without exposing personal financial lives. Documentation and implementation should follow the same principle:

- use aggregate, anonymous examples;
- avoid raw user rows, exact rare cohorts, or identifiable profile combinations;
- document consent, retention, deletion, and cohort thresholds when changing comparison features;
- keep self-hosted operation useful even without any community network.

## Engineering References

- [Currency Flow](CURRENCY_FLOW.md)
- [i18n Migration Guide](MIGRATION_GUIDE.md) — migrating components from the old `languages.json` system to the current one
- [Threat Model](THREAT_MODEL.md)
- [Supabase RLS Audit](SUPABASE_RLS_AUDIT.md)
- [Backup & Recovery](BACKUP_RECOVERY.md)
- [Transaction Terminology](TRANSACTION_TERMINOLOGY.md)
- [Investment Import Research](INVESTMENT_IMPORT_RESEARCH.md)

## SEO And Public Pages

- [SEO](SEO.md) — what's implemented and how to add SEO to a new page
- [SEO Keywords Map](SEO_KEYWORDS_MAP.md) — target keywords per page and language

Before publishing new docs, check that examples are synthetic and that the brand is written as `Pacifinance`.

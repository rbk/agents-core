# Context: Data

- Never mutate raw data. Always work on copies or derived datasets.
- Document the provenance of every dataset: where it came from, when, and how it was processed.
- Validate data schemas at ingestion. Fail loudly on unexpected structure.
- Make pipelines idempotent. Re-running should produce the same result.
- Separate concerns: ingestion, transformation, and serving are distinct stages.
- Be explicit about nulls, missing values, and outliers — don't silently drop them.

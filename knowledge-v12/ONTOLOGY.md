# MiraVerse v1.2 — Knowledge Ontology & Reversible Merge Policy (`packages/knowledge-v12/ONTOLOGY.md`)

- **Owner:** `CL01` (Wave W0)
- **Canonical ID Pattern:** `<COUNTRY>-KB-<CATEGORY>-<SLUG>` (e.g. `LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS`)
- **Non-Destructive Guarantee:** All existing `packages/content/packs/{LB,IQ,EG,FR,KR}.json`, `content/quests/{LB,IQ,EG,FR,KR}.json`, `content/dialogue/{LB,IQ,EG,FR,KR}.json`, and `packages/content/stories/*.json` remain 100% intact.
- **Epistemic Guardrails:**
  1. `confidence: "high"` is forbidden when `claim_status === "source_asserted_unverified"`.
  2. `claim_status: "externally_corrobated"` requires an explicit external reference (`verified: true` + citation/URL).
  3. `claim_status: "human_reviewed"` requires recorded reviewer ID and timestamp.
  4. `rights.text` defaults to `"paraphrase_only"` with zero verbatim long passages copied from the research essay.

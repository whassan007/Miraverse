# Gameplay, Quest, NPC & Save Persistence Regression Report

- **Chapter 1 Quests & Stations (`LB` / `byblos`):** All 5 Lebanon challenge stations (`build`, `cook`, `gather`, `trade`, `word`) and Teta Nahla (`Mentor_LB`) remain at their exact registered offsets in `ByblosWorld` and pass all 16 tests in `tests/roblox/mount-lebanon-world.test.ts`.
- **Country Mentors (`LB`, `EG`, `IQ`, `KR`, `FR`):** All 5 primary country mentors (`Mentor_LB`, `Mentor_EG`, `Mentor_IQ`, `Mentor_KR`, `Mentor_FR`) and `BuildOrigin_<CC>` markers are preserved.
- **Save Schema Migration (`ProgressService.luau`):** Legacy saves (`version < 2`) migrate non-destructively to `version = 2` with `visitedLocations` and `lastLocationByCountry` populated from completed countries.
- **Gate Compliance (`tests/integration/gates.test.ts`):** All 12 release gates (`G1`–`G12`), including `G4` (`SessionManager.luau` service-string isolation) and `G5` (`rojo build` to `miraverse.rbxlx`), pass.

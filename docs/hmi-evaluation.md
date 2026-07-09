# HMI Simulator Deep Evaluation

## Scope Evaluated

- Next.js App Router implementation under `src/app`.
- Hybrid screen strategy: redraw for `Main Screen`, screenshot-backed for secondary pages.
- Dummy operation-mode simulation readiness for future offline sender integration.

## Current Readiness Snapshot

- **Visual parity (Main Screen):** medium. Key zones are represented and dynamic tags are visible, but geometric fidelity is still POC-level.
- **Simulation realism:** medium-high for demo. Mode transitions are coherent and values trend logically.
- **Scalability for multi-screen:** medium. Route and config pattern is good; tag schema still needs formalization.
- **Offline integration readiness:** medium. Data model is tag-based, but adapter contract is not yet separated from UI state.

## Progress Since Last Iteration

- Added **typed tag registry** (`src/lib/hmi/tag-registry.ts`) for unit/precision metadata and formatting.
- Added **main-screen layout map** (`src/lib/hmi/layouts/main-screen-layout.ts`) so overlay coordinates are config-driven.
- Expanded navigation dataset to cover **all 30 screens** (`main` + `GT2-002`..`GT2-030`) with legacy URL alias support.

## Strengths

- **Correct architectural direction:** one shell, many screens, shared simulation state.
- **Hybrid strategy is efficient:** redraw effort focused on one high-value screen while preserving velocity with screenshots.
- **Deterministic pseudo-random generator:** reproducible simulation sessions help testing/demo consistency.
- **Operational controls implemented:** setpoint and reset flow are already connected to simulation logic.

## Gaps and Risks

1. **Main Screen parity gap**
   - Current redraw is a structured approximation, not yet close to original HMI fidelity.
   - Tag placement is manually tuned and may drift by viewport ratio.

2. **Data contract gap**
   - Tags are currently implicit string keys in the simulator.
   - No typed registry describing unit, precision, normal range, alarm thresholds, and source quality.

3. **Adapter gap for offline sender**
   - Dummy generation is tightly coupled with client UI lifecycle.
   - No explicit adapter interface (`DummyAdapter`, `OfflineAdapter`) yet.

4. **Behavioral realism gap**
   - Sequence logic works, but no interlocks/permissives dependency tree yet.
   - Alarm lifecycle (`normal -> active -> acknowledged -> reset`) is not modeled.

5. **UI consistency gap across screens**
   - Secondary pages are screenshot-only and do not yet include consistent dynamic overlays.
   - Navigation taxonomy is still partial (5 screens mapped from available 30 assets).

## Priority Recommendations

### P0 (next immediate iteration)

- Introduce a typed `tag-registry.ts`:
  - `id`, `unit`, `decimals`, `min`, `max`, `quality`, `alarmHi`, `alarmHiHi`, `alarmLo`, `alarmLoLo`.
- Extract simulation engine from React component into dedicated service API.
- Add coordinate map format for redraw overlays (`xPct`, `yPct`, `styleType`) and keep all positions in config.

### P1 (stabilization)

- Add full alarm model and acknowledgement/reset transitions.
- Add permissive/interlock simulation for start sequence credibility.
- Map remaining screens into navigation and mark per-screen status (`screenshot-only`, `dynamic-overlay`, `redraw`).

### P2 (integration-ready)

- Implement `OfflineAdapter` contract (pull/push abstraction):
  - initial option: WebSocket JSON payload keyed by `tagId`.
- Add quality/status fields per tag (`GOOD`, `STALE`, `BAD`) with UI coloring.
- Add basic event log timeline to audit transitions and operator actions.

## Suggested Target Architecture (next step)

- `src/lib/hmi/tag-registry.ts`
- `src/lib/hmi/engine/simulator.ts`
- `src/lib/hmi/engine/adapters/dummy-adapter.ts`
- `src/lib/hmi/engine/adapters/offline-adapter.ts`
- `src/lib/hmi/layouts/main-screen-layout.ts` (all coordinate mappings)
- `src/components/hmi/widgets/*` (value box, lamp, status row, alarm chip)

## Definition of Done for "Main Screen Redraw v1"

- Header, right panel, center schematic, and bottom control visually recognizable vs reference.
- Minimum 20 mapped dynamic tags with stable positions across target resolution.
- MW setpoint control visibly influences turbine behavior in `LOADED` mode.
- Alarm + acknowledge path demonstrable in UI.
- Lint clean and no runtime console errors.

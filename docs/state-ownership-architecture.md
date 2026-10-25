# Sea Warfare - State Ownership Architecture

## Project Context

Stack: React, TypeScript, Zustand, Next.js

Layers: domain → application → presentation

Priorities: declarative rendering, domain purity, low coupling, derivation-first architecture, lightweight orchestration.

---

## Architectural Goal

Define explicit ownership boundaries, state lifecycles, and derivation responsibilities. This is a prescriptive specification, not a how-to essay.

---

## Semantic Ownership and Consumption

- Domain: owns authoritative gameplay truth and domain rules.
- Feature Modules: derive the semantics they own and expose public contracts.
- Game Flow: derives global semantics and consumes public contracts from feature modules.
- Presentation: renders declarative projections from Game Flow and feature-module contracts.

Semantic ownership defines responsibility, not an exclusive consumption path.

```txt
Domain State → Feature Semantics → Feature Contracts
Domain State + Feature Contracts → Global Game Flow Semantics

Contract consumption:

Feature Contracts ──→ Feature-specific UI
Feature Contracts ──→ Game Flow
Game Flow Contracts ─→ Global UI
```

Presentation may consume feature-module contracts directly or consume global semantics through Game Flow, depending on the responsibility of each UI component.

---

## State Categories

Keep state aligned to its semantic role. Prefer concise rules over prose.

- Authoritative: persistent canonical gameplay truth. Minimal and never duplicates derivable semantics. Examples: `GameState`, `GameStatus` during `BATTLE`, `Ships`.
- Interaction: ephemeral flow-scoped data for input coordination. Examples: `selectedShipType`, `targetCell`.
- Derived Semantics: recomputed semantic models exposed by the application layer. Some become part of module contracts while others remain internal. Examples:
`Preview`, `PlacementState`, `PlacementCapabilites`, `PlacementInstruction`.

State ownership is determined by semantic responsibility and lifecycle, not by the state-management mechanism or file location. Interaction state may live in a feature-scoped Zustand store without becoming authoritative gameplay state or global application state. Values computed from existing state remain derived and should not be duplicated as independent sources of truth.

---

## Derivation Principles

Rules (normative):
- Authoritative state is the single source of truth.
- Derivations are pure, synchronous, deterministic, and side-effect free.
- Do not persist derivable semantics; recompute them instead.
- Derived state must be disposable and inexpensive to reset.

Each module derives the semantics it owns.

Some derivations become part of the module's public contract, while others remain internal to the module.

Game Flow derives only the global semantics it owns and aggregates the contracts exposed by feature modules.

---

## Contract Ownership

Each application module derives the semantic contracts it owns.

Those contracts define the architectural boundary of the module rather than its internal implementation.

Depending on their responsibility:

- some contracts are consumed by Game Flow;
- others remain available to feature-specific UI components.

Game Flow never recreates feature semantics. It consumes only the public contracts exposed by feature modules.

Public contracts define what a module makes available to consumers; they do not require all consumers to access those semantics through Game Flow. Feature-specific UI may consume a feature module's public contract directly, while Game Flow consumes the same contract when deriving global gameplay semantics. Internal derivations remain private unless explicitly included in the module's public contract.

## Persistence Boundaries

- Persist only authoritative gameplay truth that must survive beyond interactions.
- Do not persist interaction or derived semantics.
- Resets should clear interaction and derived state cheaply and deterministically.

Feature-scoped interaction state follows the lifecycle of its owning flow. For example, Placement interaction state (`selectedShipType`, `orientation`, and `targetCell`) is held in the Placement Interaction Store, separate from the authoritative Gameplay Store. It is not persisted as authoritative gameplay data. The store exposes an explicit reset operation that restores its initial state; flow transitions and resets must invoke the appropriate lifecycle cleanup when required.

Examples of persistent state: `GameState`, `Ships`, optional `GameStatus` during `BATTLE`.
Examples of non-persistent state: `Preview`, `BoardState`, `OccupiedCells`, `selectedShipType`.


## Zustand Ownership Boundaries

Zustand is infrastructure, not architecture. Stores host coordination, not semantic authority.

Guidelines:
- Place state in stores only when its lifecycle and coordination scope require it.
- Keep stores minimal; avoid persisting derived semantics.
- Scoped interaction state may live in Zustand, but must remain flow-scoped.

Example types (illustrative):

```ts
type GameplayState = {
  game: GameState;
  playerPlacements: ShipPlacement[];
  enemyPlacements: ShipPlacement[];
};

type GameplayActions = {
  setGame: (game: GameState) => void;
  setPlayerPlacements: (placements: ShipPlacement[]) => void;
  setEnemyPlacements: (placements: ShipPlacement[]) => void;
  resetGameplay: () => void;
  initializeGame: () => void;
  confirmFleet: () => void;
};
```

Current implementation: `ShipPlacement[]` models deployment data, not an in-combat fleet with damage/sunk semantics. The combat phase may introduce a runtime fleet model.

Gameplay Store ownership: include state that requires cross-consumer coordination, survives renders, or is semantically authoritative (e.g., `GameState`, `Ships`).

What should not persist in the Gameplay Store: `Preview`, `BoardState`, `AvailableShips`, `OccupiedCells`, `BoardDisabled`.

```txt
store coordination
    ↓
semantic ownership
    ↓
disposable derivation
    ↓
presentation
```

## Anti-Patterns

Avoid:

- Persisting derived semantics.
- Creating multiple sources of truth.
- Placing gameplay logic in presentation.
- Promoting interaction state to authoritative state.
- Treating store location as semantic authority.
- Turning application hooks into orchestration engines.

```txt
authoritative ownership
    ↓
disposable derivation
    ↓
clear responsibility
    ↓
presentation
```
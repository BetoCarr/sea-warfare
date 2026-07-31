# Sea Warfare - State Ownership Architecture

## Project Context

Stack: React, TypeScript, Zustand, Next.js

Layers: domain → application → presentation

Priorities: declarative rendering, domain purity, low coupling, derivation-first architecture, lightweight orchestration.

---

## Architectural Goal

Define explicit ownership boundaries, state lifecycles, and derivation responsibilities. This is a prescriptive specification, not a how-to essay.

---

## Ownership Hierarchy

- Domain: authoritative gameplay truth.
- Feature Modules: derive the semantics they own and expose public contracts.
- Game Flow: derives global semantics and consumes feature-module contracts.
- Presentation: renders declarative projections only.

Authority must not be derived; semantics must be.

```txt
Domain
    ↓
Feature Modules
    ↓
Game Flow
    ↓
Presentation
```

---

## State Categories

Keep state aligned to its semantic role. Prefer concise rules over prose.

- Authoritative: persistent canonical gameplay truth. Minimal and never duplicates derivable semantics. Examples: `GameState`, `GameStatus` during `BATTLE`, `Ships`.
- Interaction: ephemeral flow-scoped data for input coordination. Examples: `selectedShipType`, `targetCell`.
- Derived Semantics: recomputed semantic models exposed by the application layer. Some become part of module contracts while others remain internal. Examples:
`Preview`, `PlacementState`, `PlacementCapabilites`, `PlacementInstruction`.

```txt
authoritative state
    ↓
semantic derivation
    ↓
capabilities + presentation
```

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

## Persistence Boundaries

- Persist only authoritative gameplay truth that must survive beyond interactions.
- Do not persist interaction or derived semantics.
- Resets should clear interaction and derived state cheaply and deterministically.

Examples of persistent state: `GameState`, `Ships`, optional `GameStatus` during `BATTLE`.
Examples of non-persistent state: `Preview`, `BoardState`, `OccupiedCells`, `selectedShipType`.

```txt
authoritative persistence
    ↓
ephemeral interaction
    ↓
disposable derivation
    ↓
presentation lifecycle
```

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
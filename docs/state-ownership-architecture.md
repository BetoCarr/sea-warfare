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
- Game Flow: derives global semantics and composes the public feature-contract values needed by the shared gameplay interface.
- Presentation: renders Game Flow's composed interface and may consume feature contracts directly for feature-specific UI.

Semantic ownership defines responsibility, not an exclusive consumption path.

```txt
Domain State → Feature Semantics → Feature Contracts
Domain State + Feature Contracts → Global Game Flow Semantics and Interface

Contract consumption:

Feature Contracts ─────→ Feature-specific UI
Feature Contracts ─────→ Game Flow composition
Game Flow Contract ────→ Shared gameplay UI
```

---

## State Categories

Keep state aligned to its semantic role. Prefer concise rules over prose.

- **Authoritative:** Persistent canonical gameplay truth. Minimal and never duplicates derivable semantics. Examples: `GameState`, `GameStatus`, `Ships`.
- **Interaction:** Ephemeral flow-scoped data for input coordination. Examples: `selectedShipType`, `targetCell`.
- **Derived Semantics:** Recomputed semantic models exposed by the application layer. Some are included in public module contracts, while others remain internal. Examples: `Preview`, `PlacementCapabilities`, `PlacementInstruction`.

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

---

## Contract Ownership

Each application module derives and owns the semantic contracts that define its public interface.

Public contracts define what a module makes available to consumers, independently of its internal implementation.

- A module exposes only the semantics explicitly included in its public contract.
- Internal derivations remain private unless explicitly exposed.
- Consumers use public contracts rather than recreating semantics owned by another module.
- Public contracts may be consumed directly by feature-specific UI or by other application modules composing broader semantics.

---

## Persistence Boundaries

- Persist only authoritative gameplay truth that must survive beyond interactions.
- Do not persist interaction or derived semantics.
- Resets must clear applicable interaction state deterministically; derived semantics should be recomputed from the resulting state.

Feature-scoped interaction state follows the lifecycle of its owning flow. For example, Placement interaction state (`selectedShipType`, `orientation`, and `targetCell`) is held in the Placement Interaction Store, separate from the authoritative Gameplay Store. It is not persisted as authoritative gameplay data. The store exposes an explicit reset operation that restores its initial state; flow transitions and resets must invoke the appropriate lifecycle cleanup when required.

Examples of persistent state: `GameState`, `Ships`, optional `GameStatus` during `BATTLE`.

Examples of non-persistent state: `Preview`, `BoardState`, `OccupiedCells`, `selectedShipType`.


## Zustand Ownership Boundaries

Zustand is infrastructure, not architecture. Stores host coordination, not semantic authority.

Guidelines:
- Place state in stores only when its lifecycle and coordination scope require it.
- Keep stores minimal; avoid persisting derived semantics.
- Scoped interaction state may live in Zustand, but must remain flow-scoped.

A Zustand store does not imply global application state. The Placement Interaction Store coordinates transient state within the Placement flow; its scope is defined by the responsibility and lifecycle of that interaction state, not by the state-management mechanism.

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

---

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
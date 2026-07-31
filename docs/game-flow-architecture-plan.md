# Sea Warfare — Game Flow Architecture Plan

## Project Context

Stack: React, TypeScript, Zustand, Next.js

Layers: domain → application → presentation

Priorities: declarative rendering, domain purity, low coupling, derivation-first architecture, lightweight orchestration.

---

## Game Flow — Canonical Architecture

The Game Flow module provides the unified declarative interface consumed by the Presentation layer.

Its responsibility is intentionally narrow. It does not own gameplay rules or feature-specific semantics. Instead, it derives the semantics it owns from the authoritative gameplay state and consumes the public contracts exposed by feature modules, exposing a single presentation-oriented API for the Presentation layer.

This follows a simple architectural rule:

> **Game Flow derives what it owns and consumes what it does not own.**

Ownership remains explicit:

- **Domain** owns gameplay truth and rules.
- **Feature modules** derive their own feature-specific semantics and expose public contracts.
- **Game Flow** derives global gameplay semantics, consumes feature-module contracts, and exposes a unified API.
- **Presentation** renders the resulting projections.

The canonical flow is:

```txt
Gameplay Store
(authoritative state)
        │
        │
        ├──────────────┐
        │              │
        ▼              ▼
 Game Flow       Feature Modules
 derives         derive
 owned           owned
 semantics       semantics
        ▲              │
        │              │
        └──── consumes ┘
               contracts
                    │
                    ▼
             Presentation
```

Design principles:

- capabilities are declarative
- presentation contracts are lightweight
- components remain presentation-only
- gameplay semantics stay outside the UI layer

---

## State Boundaries

The Gameplay Store owns the authoritative gameplay state. Feature modules own their feature-specific derivations and public contracts. Game Flow derives the semantics it owns and consumes the public contracts it does not own, exposing a unified interface for the Presentation layer.

**Authoritative state**

Examples:

- `GameState`
- `Ships`

**Derived semantics**

Examples:

- Game Flow presentation
- aggregated capabilities
- aggregated instructions
- aggregated feedback

For the complete ownership model, derivation philosophy, and persistence boundaries, see the **State Ownership Architecture** document.

---

## Capability Model

The capability model defines the declarative permission surface exposed by Game Flow to the Presentation layer.

Its purpose is to expose a single, unified interface describing what the UI is allowed to do at any given moment, regardless of which module owns the underlying capability.

Some capabilities are derived directly from the global gameplay lifecycle, while others are consumed from feature modules such as Placement. Presentation remains completely unaware of where each capability originates and interacts exclusively with the aggregated `flow.capabilities` contract.

This approach provides:

- a single capability surface for the UI
- explicit ownership of feature-specific capabilities
- low coupling between Presentation and feature modules
- independent evolution of each feature module

`GameStatus` currently complements `GamePhase` during the `BATTLE` phase, allowing battle-specific permissions to be expressed without increasing the complexity of the global lifecycle. Its long-term ownership may eventually move into the Battle module.

### Public Contract

```ts
type GameFlowCapabilities = {
    // Gameplay lifecycle
    canInitializeGame: boolean;
    canRestartGame: boolean;

    // Placement
    canPlaceShip: boolean;
    canConfirmFleet: boolean;
    canInteractWithPlacementBoard: boolean;

    // Battle
    canAttack: boolean;
    canInteractWithEnemyBoard: boolean;
};
```

Only the aggregated capability contract is exposed to Presentation.

Feature modules remain responsible for deriving their own capability contracts, while Game Flow is responsible for exposing the unified interface consumed by the UI.

---

## Instruction Model

The instruction model defines the contextual guidance presented to the player at any given moment.

Instructions follow the same architectural pattern as capabilities. Each feature module owns and derives its own instruction from its own public contract.

For example:

- Placement owns `PlacementInstruction`.
- Battle may eventually own `BattleInstruction`.

Game Flow does not derive those instructions. Instead, it consumes the public instruction contracts exposed by feature modules and exposes a single unified instruction interface for the Presentation layer.

Presentation consumes `flow.instruction` without needing to know which feature module produced the current instruction.

This preserves explicit ownership while allowing the UI to remain completely unaware of feature-specific implementation details.

---

## Feedback Model

Feedback represents temporary information produced as the result of a user interaction or gameplay event.

Unlike instructions, feedback does not describe the current state of the game. Instead, it communicates something that has just occurred and is intended to disappear after a short period of time.

Examples include:

- Invalid placement
- Fleet completed
- Attack missed
- Ship sunk

Following the ownership model established throughout this document, each feature module owns and derives its own feedback contract. Game Flow consumes those contracts and exposes a single unified feedback interface to the Presentation layer.

Presentation consumes `flow.feedback` without needing to know which feature module produced the current feedback.

---

## Presentation Model

The presentation model defines the presentation context exposed by Game Flow to the Presentation layer.

Unlike capabilities and instructions, the presentation contract is owned entirely by Game Flow and derived directly from the authoritative gameplay lifecycle.

Its purpose is to provide lightweight contextual information describing the current state of the game rather than the actions available to the player.

### Public Contract

```ts
export type GamePresentation = {
    phaseLabel: string;
    description: string | null;
};
```

Presentation consumes this contract through `flow.presentation`.

---

## Capability Derivation

`deriveCapabilities()` constructs the capability contract exposed by Game Flow.

Following the ownership model, it derives the capabilities owned by Game Flow from the authoritative gameplay state and composes them with the capability contracts exposed by feature modules.

The result is a single declarative capability surface consumed by the Presentation layer.

### Derivation Strategy

The implementation should:

- derive only the capabilities owned by Game Flow
- consume capability contracts exposed by feature modules
- compose those capabilities into a single public contract
- remain pure, synchronous, and side-effect free
- never execute gameplay logic or mutate authoritative state

---

## Instruction Aggregation

`aggregateInstruction()` constructs the instruction contract exposed by Game Flow.

Following the ownership model, Game Flow does not derive instructions itself. Instead, it consumes the instruction contracts exposed by feature modules and resolves the instruction that corresponds to the current gameplay context.

The result is a single declarative instruction consumed by the Presentation layer.

### Aggregation Strategy

The implementation should:

- consume instruction contracts exposed by feature modules
- select the instruction that matches the active gameplay context
- expose a single unified instruction contract
- remain pure, synchronous, and side-effect free
- never derive feature-specific instructions or mutate authoritative state

---

## Feedback Aggregation

`aggregateFeedback()` constructs the feedback contract exposed by Game Flow.

Following the ownership model, Game Flow does not derive feedback itself. Instead, it consumes the feedback contracts exposed by feature modules and resolves the feedback that should be presented to the player.

The result is a single transient feedback contract consumed by the Presentation layer.

### Aggregation Strategy

The implementation should:

- consume feedback contracts exposed by feature modules
- resolve the feedback corresponding to the current interaction or gameplay event
- expose a single unified feedback contract
- remain pure, synchronous, and side-effect free
- never derive feature-specific feedback or mutate authoritative state

---

## Presentation Derivation

`derivePresentation()` constructs the presentation contract owned by Game Flow.

Following the ownership model, presentation is derived directly from the authoritative gameplay lifecycle because it represents global presentation context rather than feature-specific semantics.

The result is a lightweight presentation contract consumed by the Presentation layer.

### Derivation Strategy

The implementation should:

- derive global gameplay context from the authoritative gameplay state
- expose lightweight presentation information such as the current phase and its description
- remain pure, synchronous, and side-effect free
- never derive feature-specific semantics or mutate authoritative state

---

## Application Layer (`useGameFlowController`)

`useGameFlowController()` is the application-layer composition point of the Game Flow module.

It bridges the authoritative gameplay state with the public contracts exposed by feature modules, assembling them into a single declarative interface consumed by the Presentation layer.

Rather than implementing feature logic itself, the controller composes the outputs of the Game Flow derivation functions into a unified API for the UI.

### Composition Strategy

The implementation should:

- read authoritative gameplay state from the Gameplay Store
- consume public contracts exposed by feature modules
- compose capabilities, instructions, feedback and presentation into a single interface
- expose a stable, presentation-oriented API
- remain lightweight and free of business logic

Example:

"The following example is intentionally conceptual."

```ts
export function useGameFlowController() {
    const game = useGameplayStore(state => state.game);
    const placement = usePlacementContract();

    return {
        capabilities: deriveCapabilities(game, placement.capabilities),
        instruction: aggregateInstruction(placement.instruction),
        feedback: aggregateFeedback(placement.feedback),
        presentation: derivePresentation(game),
    };
}
```

---

## Domain vs Application vs Presentation

### Domain Layer

The Domain layer owns the authoritative game state and the rules that govern it.

It is responsible for validating gameplay, executing mutations, and preserving the integrity of the game. Every state transition originates here.

Examples include:

- `initializeGame()`
- `confirmFleet()`
- `startBattle()`
- `endGame()`

The Domain never derives UI semantics or presentation information. It only exposes authoritative state.

### Feature Modules

Feature modules own the semantics of their own feature.

Each module derives the contracts that belong exclusively to that feature, exposing them through a small public contract.

For example, the Placement module owns concepts such as:

- PlacementCapabilities
- PlacementInstruction
- PlacementFeedback
- PlacementAvailability
- PlacementPreview

These contracts represent the public interface of the feature and are consumed by Game Flow rather than directly by the Presentation layer.

### Game Flow Layer

Game Flow acts as the orchestration boundary between gameplay and presentation.

It derives the semantics that belong to the global game lifecycle and aggregates the public contracts exposed by feature modules into a single declarative interface for the UI.

Following the ownership principle established throughout this document:

Game Flow derives what it owns and consumes what it does not own.

This keeps feature ownership explicit while allowing the presentation layer to depend on a single application-facing API.

### Presentation Layer

The Presentation layer is responsible only for rendering and forwarding user intent.

It consumes the unified declarative interface exposed by Game Flow without interpreting authoritative gameplay state or feature-module internals.

Typical usage:
```tsx
const flow = useGameFlowController();

return (
    <>
        <InformationPanel
            presentation={flow.presentation}
            instruction={flow.instruction}
        />

        <Board
            interactive={flow.capabilities.canAttack}
        />
    </>
);
```

Presentation should render exclusively from the declarative interface exposed by Game Flow.

It must never:

- inspect GamePhase or GameStatus
- derive gameplay semantics
- derive UI capabilities
- depend on feature-module internals
- mutate authoritative gameplay state

---

## Architectural Principles

The following principles should guide future changes to the Game Flow module:

- Game Flow derives what it owns and consumes what it does not own.
- Feature modules own their own semantics and public contracts.
- Presentation consumes only the unified Game Flow interface.
- Domain remains the single source of gameplay truth.
- Public contracts are the only communication boundary between feature modules and Game Flow.

---
# Sea Warfare — Game Flow Architecture Plan

## Project Context

Stack: React, TypeScript, Zustand, Next.js

Layers: domain → application → presentation

Priorities: declarative rendering, domain purity, low coupling, derivation-first architecture, lightweight orchestration.

---

## Game Flow — Canonical Architecture

The Game Flow module exposes a unified declarative interface for global gameplay semantics consumed by the Presentation layer.

Its responsibility is intentionally narrow. It does not own gameplay rules or feature-specific semantics. Instead, it derives the global semantics it owns from the authoritative gameplay state and consumes the public contracts exposed by feature modules. Presentation may consume Game Flow's interface or feature-module contracts directly, depending on the responsibility of each UI component.

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

Game Flow consumes authoritative gameplay state and the public contract values it needs. It derives global semantics and composes the shared interface, while feature modules remain responsible for their own derivations.

`GameFlowController` exposes global capabilities, global presentation context, and the instruction, feedback, and statistics content selected for the active phase. Placement continues to own and derive Placement capabilities, instructions, feedback messages, and structured statistics. Game Flow formats Placement statistics for Presentation and owns the duration of displayed feedback.

For authoritative state ownership, derivation principles, interaction state, and persistence boundaries, see **State Ownership Architecture**. Keep those broader boundaries documented there rather than duplicating them here.

---

## Capability Model

The capability model defines the declarative permission surface exposed by Game Flow to the Presentation layer.

Its purpose is to expose a single, unified interface describing what the UI is allowed to do at any given moment, regardless of which module owns the underlying capability.

Some capabilities are derived directly from the global gameplay lifecycle, while others are consumed from feature modules such as Placement and exposed through `flow.capabilities`. Feature-specific contracts remain owned by their modules and may also be consumed directly by the UI when appropriate.

This approach provides:

- a single capability surface for the UI
- explicit ownership of feature-specific capabilities
- low coupling between Presentation and feature modules
- independent evolution of each feature module

`GameStatus` currently complements `GamePhase` during the `BATTLE` phase, allowing battle-specific permissions to be expressed without increasing the complexity of the global lifecycle. Its long-term ownership may eventually move into the Battle module.

### Public Contract

```ts
export type GameInteractionCapabilities = {
    // Gameplay lifecycle
    canInitializeGame: boolean;
    canRestartGame: boolean;

    // Placement
    canPlaceFleet: boolean;
    canConfirmFleet: boolean;

    // Battle
    canAttack: boolean;
};
```

Only the aggregated capability contract is exposed to Presentation.

Feature modules remain responsible for deriving their own capability contracts, while Game Flow is responsible for exposing the unified interface consumed by the UI.

---

## Instruction Model

The instruction model defines the contextual guidance presented to the player at any given moment.

Each feature module owns and derives its own instruction from its public contract. Game Flow also preserves global instructions for phases without feature-specific presentation, such as setup and the player's battle turn. It selects which instruction to expose using the gameplay phase, not a capability used as a phase proxy.

For example:

- Placement owns `PlacementInstruction`.
- Battle may eventually own `BattleInstruction`.

Game Flow does not derive Placement instructions. It consumes Placement's instruction and exposes it during `PLACEMENT`; otherwise it exposes the appropriate global instruction.

Presentation consumes the composed value through `flow.instruction` without choosing its source.

This preserves explicit ownership while keeping the shared interface selection out of Presentation.

---

## Feedback Ownership

Features derive their own feedback messages. Placement exposes each message as a feedback event with an identity, allowing Game Flow to detect a repeated event even when its text is unchanged. Game Flow owns the presentation lifecycle: it shows the selected event for four seconds, restarts that duration for each new event, and clears it on phase changes or unmount. Expired or inactive events are not exposed again. Placement does not own a display timer. Presentation renders `flow.feedback`.

---

## Presentation Model

The presentation model defines the global presentation context exposed by Game Flow to the Presentation layer.

This context is owned entirely by Game Flow and derived directly from the authoritative gameplay lifecycle. It provides lightweight global information describing the current state of the game.

The selected instruction and feedback are separate top-level `GameFlowController` values, not fields of `GamePresentation`.

### Public Contract

```ts
export type GamePresentation = {
    phaseLabel: string;
    description: string | null;
};
```

Presentation consumes this global context through `flow.presentation`. The controller also exposes `capabilities`, `instruction`, `feedback`, and `stats`. Game Flow selects the instruction and statistics from global values or Placement's public contract according to the current phase; feedback is the active message managed by the Game Flow lifecycle.

```ts
export type GameFlowContent = {
    instruction: string | null;
    feedback: string | null;
    stats: string | null;
};

export type GameFlowController = {
    capabilities: GameInteractionCapabilities;
    presentation: GamePresentation;
} & GameFlowContent;
```

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

## Instruction and Feedback Composition

`deriveGlobalInstruction()` derives instructions owned by Game Flow, while `composeGameFlowContent()` selects the instruction, active feedback message, and statistics content exposed by Game Flow.

During `PLACEMENT`, composition uses the instruction and structured statistics already supplied by Placement, and the feedback event currently active in Game Flow. It formats the remaining ship count for `InformationPanel`. In other phases, it uses the global instruction and exposes neither Placement feedback nor Placement statistics.

### Composition Strategy

The implementation should:

- derive only global instructions owned by Game Flow
- consume Placement instruction and statistics from its public contract and the current feedback message from the Game Flow lifecycle hook
- select the values based on the explicit gameplay phase
- format Placement statistics for Presentation
- expose instruction, feedback, and statistics content to Presentation
- remain pure, synchronous, and side-effect free
- never derive feature-specific instructions, feedback, or statistics, or mutate authoritative state

Feedback timer effects live in the Game Flow controller hook, not in this pure composition function.

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

`useGameFlowController()` is the application-layer composition point of the Game Flow module. Its input is the subset of Placement's public contract that it uses: `capabilities`, `instruction`, `feedback`, and `stats`. The feedback value is an event containing an ID and message. It does not import Placement hooks or UI components.

It bridges the authoritative gameplay state with the public contracts exposed by feature modules, assembling them into a single declarative interface consumed by the Presentation layer.

Rather than implementing feature logic itself, the controller composes the outputs of the Game Flow derivation functions into a unified API for the UI.

### Composition Strategy

The implementation should:

- read authoritative gameplay state from the Gameplay Store
- consume the relevant public values supplied by feature modules
- manage the display lifetime of feedback events and compose global capabilities, presentation context, instruction, feedback, and formatted statistics into a single interface
- expose a stable, presentation-oriented API
- remain lightweight and free of business logic

```ts
type UseGameFlowControllerProps = {
    placement: Pick<PlacementContract, 'capabilities' | 'instruction' | 'feedback' | 'stats'>;
};

export function useGameFlowController({ placement }: UseGameFlowControllerProps) {
    const game = useGameplayStore(state => state.game);
    const feedback = useGameFlowFeedback(game.phase, placement.feedback);

    return {
        capabilities: deriveCapabilities(game, placement.capabilities),
        presentation: derivePresentation(game),
        ...composeGameFlowContent({
            game,
            globalInstruction: deriveGlobalInstruction(game),
            placement,
            feedback,
        }),
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

These contracts represent the public interface of the feature. Game Flow consumes Placement capabilities, instruction, feedback events, and statistics for the shared gameplay interface; Placement-specific UI may also consume contract values such as `remainingShipTypes` directly.

### Game Flow Layer

Game Flow acts as the orchestration boundary between gameplay and presentation.

It derives the semantics that belong to the global game lifecycle and composes the public contract values exposed by feature modules into a single declarative interface for the UI.

Following the ownership principle established throughout this document:

Game Flow derives what it owns and consumes what it does not own.

This keeps feature ownership explicit while allowing the shared presentation to depend on a single application-facing API.

### Presentation Layer

The Presentation layer is responsible only for rendering and forwarding user intent.

It consumes the unified declarative interface exposed by Game Flow for shared gameplay content without interpreting authoritative gameplay state, choosing between global and feature instructions, or selecting feedback sources. Feature-specific UI may still consume its feature contract directly when it owns that local presentation.

Typical usage:
```tsx
const placement = usePlacementController();
const flow = useGameFlowController({
    placement: {
        capabilities: placement.contract.capabilities,
        instruction: placement.contract.instruction,
        feedback: placement.contract.feedback,
        stats: placement.contract.stats,
    },
});

return (
    <>
        <InformationPanel
            phaseLabel={flow.presentation.phaseLabel}
            description={flow.presentation.description}
            instruction={flow.instruction}
            stats={flow.stats}
        />
        {flow.feedback && <FeedbackMessage message={flow.feedback} />}

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
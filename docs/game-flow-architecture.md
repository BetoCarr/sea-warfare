# Sea Warfare — Game Flow Architecture

## Project Context

Stack: React, TypeScript, Zustand, Next.js.

Layers: domain → application → presentation.

Game Flow establishes the application-level boundary between authoritative gameplay state, feature modules, and shared presentation. It favors declarative rendering, domain purity, low-coupling contracts, and lightweight orchestration.

---

## Game Flow — Canonical Architecture

Game Flow exposes a unified declarative interface for global gameplay semantics consumed by shared gameplay UI. It does not own gameplay rules or feature-specific semantics.

Game Flow derives the semantics it owns from the authoritative gameplay state and consumes public feature contracts. Presentation renders the resulting declarations rather than reproducing gameplay semantics.

> **Game Flow derives what it owns and consumes what it does not own.**

Ownership is explicit:

- **Domain** owns authoritative gameplay truth and rules.
- **Feature modules** own and derive their feature-specific semantics and expose public contracts.
- **Game Flow** derives global semantics, consumes public feature contracts, and composes the unified interface for shared gameplay UI.
- **Presentation** renders the public contracts appropriate to each component's responsibility.

Game Flow is not the owner of every semantic associated with a gameplay phase. In particular, Battle owns its combat-specific semantics, just as Placement owns its placement-specific semantics. Game Flow may currently derive some Battle-related values, but this reflects the current implementation rather than the intended ownership boundary.

Shared gameplay UI consumes the unified Game Flow interface. Feature-specific UI may consume other values from its feature's public contract when appropriate, without bypassing Game Flow for the unified interaction capabilities.

```txt
Gameplay Store
(authoritative state)
       |
       v
    Game Flow <------- Public contracts ------- Feature modules
(global semantics     (capability, instruction,  (feature-specific
 + composition)        feedback, etc.)             semantics)
       |
       v
Shared gameplay UI

Feature modules ------ Public contracts ------> Feature-specific UI
```

Game Flow and feature contracts communicate only through public values. Feature-specific UI may consume a feature contract directly; shared gameplay UI consumes the unified Game Flow interface.

---

## State Boundaries

The Gameplay Store supplies `game` and authoritative gameplay values to Game Flow. Feature modules derive their own semantic values and expose them through public contracts.

Game Flow's current controller exposes:

- the aggregated interaction capabilities;
- global presentation context;
- the selected instruction;
- a visible feedback string, where applicable; and
- phase-specific formatted content such as Placement statistics.

Placement owns its capabilities, instruction, feedback events, and statistics derivation. Game Flow consumes those public values and composes them only for the active phase.

For authoritative state, interaction state, persistence, and general derivation rules, see the State Ownership Architecture document. This document does not duplicate those broader boundaries.

---

## Capability Model

Game Flow exposes one declarative capability contract to shared gameplay UI:

```ts
export type GameInteractionCapabilities = {
    canInitializeGame: boolean;
    canRestartGame: boolean;
    canPlaceFleet: boolean;
    canConfirmFleet: boolean;
    canAttack: boolean;
};
```
The current implementation of `deriveCapabilities(game, placementCapabilities)` derives some capabilities directly from gameplay state, including Battle-related capabilities, and incorporates Placement's public confirmation capability.

This is an implementation-stage arrangement, not the intended ownership model. Battle will derive its own combat capabilities and expose them through its public contract. Game Flow will consume those capabilities and aggregate them with global lifecycle and other feature capabilities into `GameInteractionCapabilities`.

Shared gameplay UI consumes `flow.capabilities` as its unified source of interaction capabilities. UI components must not independently combine feature capability contracts or recreate capability rules. Feature-specific UI may consume other public contract values when appropriate, but capability decisions exposed through the shared interface remain centralized in Game Flow.

---

## Instruction Model

An instruction is contextual guidance selected for the active gameplay phase. Each module owns the instructions derived from its semantics.

- `deriveGlobalInstruction()` currently derives setup and player-turn battle instructions from gameplay state.
- Placement derives its placement-specific instruction and exposes it through `PlacementContract.instruction`.
- `composeGameFlowContent()` selects the instruction appropriate to the active phase. It does not use capabilities as a proxy for phase.

The current implementation derives the player-turn battle instruction within Game Flow. In the intended architecture, Battle will own and derive its combat-specific instructions through its public contract. Game Flow will compose the appropriate instruction without taking ownership of Battle's semantics.

Consumers render `flow.instruction`; they do not select an instruction source or independently derive the active instruction.

---

## Feedback Ownership

Feedback has two distinct representations:

- **Placement feedback event:** the feature contract value, with `id`, `source`, and `message` fields.
- **Visible feedback message:** the string exposed by Game Flow after lifecycle management.

```ts
export type GameFlowFeedbackEvent = {
    id: number;
    source: 'gameplay' | 'placement';
    message: string;
};
```

Currently, Placement increments an event ID after a `place-ship` interaction result produces a feedback message and sets `source: 'placement'`. 
The current Game Flow lifecycle hook displays a selected event until it is cleared or its current timeout expires. A repeated message can therefore be treated as a new event because identity comes from `source` plus `id`, not message text alone. This duration is an implementation detail, not a broader architectural requirement.

---

## Presentation Model

The Presentation model is the lightweight global context owned by Game Flow:

```ts
export type GamePresentation = {
    phaseLabel: string;
    description: string | null;
};
```

`derivePresentation(game)` maps the authoritative gameplay phase/status to global `phaseLabel` and `description` values. It does not derive feature-specific presentation.

The current phase presentation is:

- Setup: `BOOT` with an awaiting-initialization description.
- Placement: `DEPLOY` with a fleet-deployment description.
- Player battle turn: `COMBAT` with a tactical-initiative description.
- AI battle turn: `COMBAT` with an enemy-turn description.
- Game over: `END` with a mission-concluded description.
- Other/fallback states: an empty label and no description.

Instruction and feedback remain separate `GameFlowController` values, not fields of `GamePresentation`.

---

## Derivation and Composition

### Capability derivation

`deriveCapabilities(game, placementCapabilities)` is currently pure. It derives global lifecycle capabilities, includes the Battle-related capabilities currently implemented in Game Flow, and incorporates Placement's public confirmation capability. This function does not mutate authoritative state or execute gameplay logic.

When Battle is implemented, it will own the derivation of its combat capabilities and expose them through its public contract. Game Flow will consume and aggregate those values rather than own the combat-specific derivation.

### Instruction derivation

`deriveGlobalInstruction(game)` is pure. It currently returns `Initialize the game.` during setup and `Choose an enemy target.` during the player's battle turn; otherwise, it returns `null`. The setup instruction belongs to Game Flow. The player-turn instruction is currently implemented here, but combat-specific instructions will belong to Battle when that module is introduced.

### Content composition

`composeGameFlowContent({ game, globalInstruction, placement })` is pure. Its `placement` parameter accepts only `instruction`, `feedback`, and `stats` from `PlacementContract`.

During Placement, it returns:

- `placement.instruction`;
- the Placement feedback event selected by its public contract;
- formatted statistics such as `Remaining ships: N`.

Outside Placement, it returns the derived global instruction and `null` feedback and statistics. The function does not manage timers, state, or display lifecycle.

```ts
export type GameFlowContent = {
    instruction: string | null;
    feedback: GameFlowFeedbackEvent | null;
    stats: string | null;
};
```

The event here is the composition input. The controller replaces it with the visible `string | null` returned by the feedback hook in its public output.

Composition selects and exposes semantics owned by the relevant modules; it does not transfer ownership of those semantics to Game Flow. The current implementation still derives some Battle-related values within Game Flow, but this is expected to change when Battle's public contract is introduced.

### Feedback lifecycle

`useGameFlowFeedback(feedbackEvent)` is effectful. It tracks event identity by `${source}:${id}`, maps the event to its message, and exposes the currently visible message. It owns no feedback derivation and does not belong in the pure composition function.

### Presentation derivation

`derivePresentation(game)` is pure and derives `GamePresentation` directly from the gameplay phase/status.

These functions have separate purposes and lifecycles: derivation and composition are synchronous and side-effect free; feedback lifecycle management is effectful and hook-owned.

---

## Application Layer (`useGameFlowController`)

`useGameFlowController()` is the lightweight application-layer composition point for Game Flow. It reads authoritative gameplay state, consumes a selected subset of Placement's public contract, runs pure derivation/composition functions, and applies feedback lifecycle management.

Its Placement input is typed as:

```ts
type UseGameFlowControllerProps = {
    placement: Pick<
        PlacementContract,
        'capabilities' | 'instruction' | 'feedback' | 'stats'
    >;
};
```

```ts
export function useGameFlowController({
    placement,
}: UseGameFlowControllerProps): GameFlowController {
    const game = useGameplayStore(state => state.game);

    const capabilities = deriveCapabilities(
        game,
        placement.capabilities,
    );
    const presentation = derivePresentation(game);

    const content = composeGameFlowContent({
        game,
        globalInstruction: deriveGlobalInstruction(game),
        placement,
    });

    const feedback = useGameFlowFeedback(content.feedback);

    return {
        capabilities,
        presentation,
        ...content,
        feedback,
    };
}
```

The spread of `content` supplies instruction and stats, then the final `feedback` property replaces the composition event with the visible string owned by the feedback hook.

`GameFlowController` is therefore:

```ts
export type GameFlowController = {
    capabilities: GameInteractionCapabilities;
    presentation: GamePresentation;
    instruction: string | null;
    feedback: string | null;
    stats: string | null;
};
```

The controller currently consumes Placement's public contract. As additional feature modules are introduced, Game Flow will consume the public contract values needed for its unified interface. This integration must preserve feature ownership: Game Flow composes feature semantics but does not become their source of derivation.

---

## Architectural Responsibilities and Boundaries

### Domain

The Domain owns authoritative gameplay state and rules. It validates gameplay and executes state transitions. It does not derive UI semantics or presentation data.

### Feature modules

Each feature module owns its feature-specific semantics, derives the values within its responsibility, and exposes them through a public contract.

Placement owns its placement interaction state, preview, capabilities, instruction, statistics derivation, and feedback derivation.

Battle will own its combat-specific semantics, including combat capabilities and instructions, and expose the values required by consumers through its public contract.

Feature-specific UI may consume appropriate public contract values directly. Shared interaction capabilities remain exposed through the unified Game Flow interface.

### Game Flow

Game Flow derives global gameplay semantics and composes the public contract values needed by shared gameplay UI. It is an orchestration and composition boundary, not a second gameplay-rule layer or the owner of feature-specific semantics.

The current implementation still derives some Battle-related capabilities and instructions within Game Flow. These responsibilities are transitional and should move to Battle as that module is implemented.

### Presentation

Shared gameplay UI consumes the unified Game Flow controller interface. For example, InformationPanel receives presentation, instruction, and stats, while FeedbackMessage receives the visible flow.feedback string.

Feature-specific UI may consume other appropriate values from its feature's public contract. Consumers must not access feature internals, recreate semantics owned by another module, or independently combine capability contracts.

Presentation must not inspect gameplay phase or status to derive capabilities, select instruction sources, derive feedback, or mutate authoritative state.

---

## Architectural Principles

- Game Flow derives what it owns and consumes what it does not own.
- Feature modules own and derive their feature-specific semantics and public contracts.
- Battle and Placement remain independent owners of their respective feature semantics.
- Shared gameplay UI consumes the unified Game Flow interface.
- Feature-specific UI may consume appropriate feature public contract values directly.
- Modules exchange semantic values through public contracts rather than depending on one another's internals.
- Consumers do not recreate semantics owned by another module.
- Derivation functions are pure; lifecycle effects belong in hooks.
- Domain state is the authoritative source of gameplay truth. General state ownership, persistence, and derivation rules follow State Ownership Architecture.
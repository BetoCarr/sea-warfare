# Sea Warfare — Placement Architecture Plan

## Project Context

Stack: React, TypeScript, Zustand, Next.js

Layers: domain → application → presentation

Priorities: declarative rendering, domain purity, low coupling, derivation-first architecture, and lightweight orchestration.

---

## Current Canonical Architecture

The canonical flow is:
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

Design principles:

- capabilities are declarative
- presentation contracts are lightweight
- components remain presentation-only
- gameplay semantics stay outside the UI layer

---

## Placement — Canonical Architecture

Placement is the application module responsible for coordinating the fleet placement workflow. It connects temporary interaction state, placement-specific derivations, and domain operations to support ship placement while keeping gameplay rules and authoritative state ownership within the domain.

The module derives the semantics required to represent and guide the placement process. It also coordinates the interactions that may lead to authoritative fleet mutations, without transferring ownership of those mutations or their underlying rules from the domain.

Placement exposes a public application interface that allows different consumers to access the values and operations appropriate to their responsibilities. Global gameplay coordination and feature-specific UI can therefore consume Placement without requiring all interactions to pass through Game Flow.

### Ownership Boundaries

- **Domain** owns authoritative gameplay rules, fleet state, and the rules governing fleet mutations.
- **Placement** coordinates the placement workflow, derives placement-specific semantics, and exposes the module's application interface.
- **Game Flow** consumes the Placement values required to derive global gameplay semantics and compose the interface for shared gameplay UI.
- **Presentation** renders the values appropriate to each component's responsibility and invokes the operations exposed by the application interface.

### Consumer Responsibilities

Placement has two distinct consumption paths:

- **Global gameplay coordination:** `GameScreen` extracts the relevant semantic values from `placement.contract` and passes them to `useGameFlowController()`. Game Flow uses these values to compose the unified interface consumed by shared gameplay UI.
- **Feature-specific UI:** `GameScreen` passes the `PlacementController` to `GameStage`, which uses its relevant properties to configure the board and placement controls.

These paths allow Game Flow to coordinate shared gameplay semantics without becoming a mandatory intermediary for every Placement consumer.

```txt
                    Placement Module
                           │
                           ▼
                  PlacementController
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      placement.contract        Other controller values
              │                         │
              ▼                         ▼
         GameScreen                 GameScreen
              │                         │
              ▼                         ▼
    useGameFlowController()          GameStage
              │                         │
              ▼                         ├── Board
          Game Flow                    ├── PlacementBar
              │                         └── Other placement UI
              ▼
      Shared gameplay UI
```

The diagram represents the two consumption paths exposed by Placement. It does not represent a sequential execution pipeline.

### Design Principles

- Interaction state is ephemeral and flow-scoped.
- Placement semantics are derived rather than independently reconstructed by consumers.
- Preview is semantic, disposable, and never authoritative.
- Board composition remains presentation-only.
- `PlacementController` coordinates the placement workflow and exposes the values and operations required by its consumers.
- Domain operations own and enforce authoritative fleet mutations.
- Game Flow consumes the contract values required for shared gameplay semantics.
- Feature-specific UI consumes the relevant `PlacementController` values directly.
- Fleet confirmation remains an explicit flow transition rather than an implicit consequence of completing individual placement operations.

---

## PlacementController

`usePlacementController()` is the application-level coordination point of the Placement module. It connects the module's interaction, derivation, mutation, and contract mechanisms and exposes their relevant results through the `PlacementController` interface.

The controller provides consumers with the player's current placements, placement interaction state and operations, the derived preview, and the public placement contract. Consumers use the properties appropriate to their responsibilities without coordinating the module's internal mechanisms independently.

### Internal Coordination

The controller coordinates the following responsibilities:

- **Interactions:** manages temporary placement interaction state and exposes the operations used by placement UI.
- **Derivations:** computes placement-specific values from interaction state and authoritative placements.
- **Mutations:** coordinates calls to the operations that attempt to update the authoritative fleet.
- **Contract construction:** builds the semantic values exposed through `PlacementContract`, which Game Flow consumes for global gameplay composition..
- **Feedback coordination:** converts placement mutation results into feedback events that can be consumed by Game Flow.

When a board interaction requests a ship placement, the controller coordinates the placement operation and processes its result. It derives feedback from the mutation result and clears the selected ship after a successful placement.

The controller coordinates these responsibilities without becoming the owner of authoritative fleet rules or state.

### Public Interface

`PlacementController` groups the values and operations required by its consumers:

- `playerPlacements`
- `interaction`
- `preview`
- `contract`

The `contract` property exposes the `PlacementContract`, which is documented separately in the Placement Public Contract section.

---

## Placement Public Contract

`PlacementContract` defines the semantic values exposed by Placement for application-level composition. It groups the capabilities, instruction, feedback, and statistics associated with the current placement state.

The contract is exposed through the `contract` property of `PlacementController`.

```ts
export type PlacementContract = {
    capabilities: PlacementCapabilities;
    instruction: PlacementInstruction;
    feedback: GameFlowFeedbackEvent | null;
    stats: PlacementStats;
};
```

### Contract Values

- **`capabilities`** describes the placement actions currently available to the application.
- **`instruction`** provides the placement-specific instruction associated with the current state.
- **`feedback`** exposes an optional feedback event resulting from a placement operation.
- **`stats`** provides placement statistics, including the remaining ship types.

### Contract Consumption

`GameScreen` extracts the contract values required by `useGameFlowController()` and passes them as its Placement input.

Game Flow consumes these values to derive global capabilities and compose the content exposed through its unified interface.

Feature-specific components may also access individual contract values through `PlacementController`. For example, `GameStage` reads `placement.contract.stats.remainingShipTypes` to provide `PlacementBar` with the ship types that remain to be placed.

### Contract Boundary

`PlacementContract` groups semantic values intended for application-level consumption. It does not include every value exposed by `PlacementController`.

Interaction state and operations, player placements, and the placement preview remain separate properties of the controller because they serve different consumer needs.

The contract therefore provides a focused semantic interface without replacing the broader `PlacementController` interface.

---

## Shared Derivation Philosophy

Placement follows a derivation-first architecture.

The module derives semantic projections from temporary interaction state and authoritative domain data. These derivations describe the current placement context without becoming authoritative gameplay state.

Placement derivations include statistics, capabilities, instructions, and preview data. The resulting values are exposed through `PlacementController`, with the semantic values required for application-level composition grouped in `PlacementContract`.

Regardless of their consumers, placement derivations share the following characteristics:

- They are pure and synchronous.
- They are derived from current inputs rather than maintained as independent authoritative state.
- They represent placement semantics rather than presentation details.
- They never mutate authoritative gameplay state.

Application-level coordination and domain mutations remain separate responsibilities. The application layer coordinates placement operations, while domain operations determine the validity and outcome of authoritative fleet changes.

---

## Preview as Interaction-Derived Semantics

`PlacementPreview` is the semantic projection of a potential ship placement based on the current interaction context.

It answers the question:

```text
What would happen if the player placed the selected ship at the target cell with the current orientation?
```

The preview is derived from the selected ship, target cell, orientation, and existing fleet placements. If the selected ship or target cell is unavailable, the derivation returns `null`.

Otherwise, the derivation computes the ship's target cells and validates the proposed placement against the remaining fleet.

### Repositioning Validation

When deriving a preview, Placement excludes any existing placement whose `ship.type` matches the selected ship's type.

This is essential when repositioning a ship that is already on the board. Its current placement must not conflict with the proposed placement of that same ship.

The preview therefore validates the proposed position against the other ships rather than against the selected ship's previous position.

The resulting `PlacementPreview` contains the target cells and a validity result. When validation fails, it also exposes the corresponding validation error.

Preview data is derived and disposable. It is not persisted as authoritative state and does not modify the fleet.

Preview derivation remains independent of presentation details such as rendering colors, CSS classes, animation state, and opacity.
 Preview contract:

```ts
type PlacementPreview = {
    cells: Position[];
    isValid: boolean;
    validationError?: PlacementValidationError;
};
```

---

## Placement Interaction Lifecycle

Placement begins with temporary interaction state:

```txt
selected ship
+
orientation
+
targetCell
```

These inputs are used to derive a semantic preview.

```txt
Interaction State + Authoritative Placements
                    |
                    v
         derivePlacementPreview()
                    |
                    v
             PlacementPreview
```

---

## Current Placement Scope

The current placement workflow supports:

- selecting a ship from the fleet
- selecting a ship already placed on the board
- rotating the selected ship
- repositioning the selected ship
- updating the placement of an already placed ship

The current workflow intentionally does not support:

- drag-and-drop editing
- placement editing sessions
- placement cancellation
- multi-placement selection
- `selectedPlacementId`
- `editingPlacementId`

These concepts should only be introduced if a future UX requires them.

---

## Relationship With Placement Mutations

The application layer coordinates placement operations through `usePlacementMutations()`. This hook invokes domain operations and applies successful results to the gameplay store.

The domain provides the following placement operations:
- `upsertShipPlacement()`
- `removeShipPlacement()`
- `resetPlacements()`

These operations work with the fleet configuration and use `ShipType` as the identity of a placement.

`upsertShipPlacement()` determines whether the requested operation creates a new placement or repositions an existing ship. It excludes the existing placement for the same ship type from validation, validates the proposed position against the remaining placements, and returns either a failure result or the updated placement collection.

The application layer updates the authoritative store only when the domain operation succeeds.

Placement and repositioning are therefore handled through the same domain mutation rather than through separate mutation categories.

The placement workflow is available during `GameState.PLACEMENT`. Once the game transitions to `GameState.BATTLE`, fleet editing must no longer be available through the gameplay flow.

---

## Confirmation and Validation

Per-ship confirmation does not exist. Fleet confirmation remains the only explicit confirmation step in the placement workflow.

The expected flow is:

```text
Place Ships
     |
     v
Confirm Fleet
     |
     v
Battle Phase
```

Individual placement operations do not require a separate confirmation phase.

A valid preview does not authorize or commit a fleet mutation. Preview derivation provides an early validation result for the current interaction context, while `upsertShipPlacement()` independently validates the proposed placement before producing an updated fleet configuration.

The application layer applies the returned configuration to the gameplay store only when the domain operation succeeds.

Fleet confirmation remains a separate operation that transitions the game out of the placement phase.

---

## State Boundaries

The gameplay store owns authoritative gameplay state, including values such as `GameState` and `Ships`.

Interaction state is temporary and discardable, including values such as `targetCell`, `selectedShipType`, and `orientation`.

---

## Platform Direction

Placement uses a shared interaction model across desktop and touch devices. Platform-specific behavior is handled at the event integration boundary rather than through separate placement workflows.

When `supportsHover` is enabled, `Board` receives the callbacks for updating the target cell on hover and handling pointer exit. When hover is not supported, those callbacks are omitted.

Cell interaction remains connected to `placement.interaction.onBoardInteraction` in both cases.

The resulting placement semantics, preview derivation, and domain mutations are shared across platforms.

Conceptually, the interaction differs as follows:

**Desktop**

```text
Hover
  |
  v
setTargetCell()
  |
  v
derivePlacementPreview()
  |
  v
Click
  |
  v
PlacementController
  |
  v
placeShip()
```

**Touch devices**

```text
Tap a Cell
     |
     v
Set Target Cell
     |
     v
derivePlacementPreview()
     |
     v
Tap the Same Cell
     |
     v
PlacementController
     |
     v
placeShip()
```

The diagrams describe the intended interaction flow. The exact sequence depends on the behavior implemented by the board event handlers and placement interaction logic.

---

## Placement Module Structure

The directory tree is a suggested reflection of semantic ownership boundaries. The architecture should prioritize responsibilities over physical file organization.

```text
application/
└── placement/
    ├── derive/
    │   ├── derivePlacementCapabilities.ts
    │   ├── derivePlacementFeedback.ts
    │   ├── derivePlacementInstruction.ts
    │   ├── derivePlacementPreview.ts
    │   └── derivePlacementStats.ts
    │
    ├── hooks/
    │   ├── usePlacementContract.ts
    │   ├── usePlacementController.ts
    │   ├── usePlacementDerivations.ts
    │   ├── usePlacementInteractions.ts
    │   └── usePlacementMutations.ts
    │
    └── interactions/
        ├── placement-interaction.actions.ts
        ├── placement-interaction.initial.ts
        ├── placement-interaction.store.ts
        └── placement-interaction.types.ts
```

### derive/

This directory contains Placement's derivation logic.

Derivation functions are pure, synchronous, and deterministic. They compute placement-owned semantic values from their explicit inputs, which may include authoritative gameplay data, temporary interaction state, or the results of application-level operations.

These values describe the current placement context without becoming independent sources of authoritative gameplay state.

Depending on their responsibility, the resulting values may be consumed by Game Flow, Placement-specific UI, or other Placement derivations. Not every derived value belongs to `PlacementContract`; the placement preview, for example, is exposed separately through `PlacementController`.

#### derivePlacementCapabilities.ts

`derivePlacementCapabilities()` derives the placement actions currently available from the relevant placement statistics and interaction state.

Its result is exposed through `PlacementController.contract.capabilities`.

```ts
type PlacementCapabilities = {
    canConfirmFleet: boolean;
};
```

Currently, this model exposes a single capability: whether the player can confirm the fleet.

#### derivePlacementFeedback.ts

`derivePlacementFeedback()` derives a transient feedback message from a placement mutation result.

The Placement controller exposes the resulting message as a `GameFlowFeedbackEvent` with a unique event ID. This allows Game Flow to distinguish successive feedback events even when their messages are identical.

Unlike instructions, feedback communicates the outcome of an operation rather than what the player should do next.

The resulting event is exposed through `PlacementController.contract.feedback`.

Placement provides the event; Game Flow is responsible for its presentation lifecycle, including visibility and cleanup.

#### derivePlacementInstruction.ts

`derivePlacementInstruction()` derives contextual guidance from the current placement interaction state and the relevant placement capabilities.

It communicates what the player should do next during the placement workflow.

Examples may include:

- Select a ship.
- Rotate the selected ship.
- Confirm your fleet.

The resulting instruction is exposed through `PlacementController.contract.instruction`.

#### derivePlacementPreview.ts

`derivePlacementPreview()` derives the semantic preview for the current interaction context using the selected ship, target cell, orientation, and existing authoritative placements.

```ts
type DerivePlacementPreviewParams = {
    selectedShip: BaseShip | null;
    targetCell: Position | null;
    orientation: Orientation;
    existingPlacements: ShipPlacement[];
    boardSize?: number;
};

function derivePlacementPreview(
    params: DerivePlacementPreviewParams,
): PlacementPreview | null;
```

The function returns `null` when no ship is selected or no target cell is available. Otherwise, it calculates the proposed ship cells and validates the proposed placement against the existing fleet.

When validating a repositioning operation, the existing placement for the selected ship type is excluded from the validation input.

The preview is derived, disposable semantic data. It does not mutate authoritative gameplay state and must not contain presentation-specific details such as colors, CSS classes, opacity, or animation state.

The preview is exposed separately through `PlacementController.preview`, rather than through `PlacementContract`.

#### derivePlacementStats.ts

`derivePlacementStats()` derives Placement-specific statistics from the current placements and the required fleet configuration.

```ts
type PlacementStats = {
    remainingShips: number;
    remainingShipTypes: ShipType[];
};
```

These statistics can serve different consumers:

- Game Flow consumes `remainingShips` to compose statistics for the shared gameplay interface.
- Placement-specific UI can consume `remainingShipTypes` and other relevant details directly through `PlacementController.contract.stats`.

The statistics remain owned by Placement. Game Flow may use them to derive or compose shared presentation values, but it does not replace Placement as their source.

### Hooks/

Application hooks coordinate Placement's internal responsibilities and expose their results through application-level interfaces.

`usePlacementController()` is the module's main coordination point. It connects interaction state, placement derivations, mutation operations, and contract construction, exposing the resulting values and operations through `PlacementController`.

The Placement controller also provides the semantic values consumed by `useGameFlowController()`. Game Flow integrates the capabilities, instruction, feedback, and statistics required to compose the shared gameplay interface.

Presentation components consume these controller interfaces rather than depending directly on Placement's internal hooks. Placement-specific UI can access the relevant values and operations through `PlacementController`, while shared gameplay UI receives the composed values exposed by Game Flow.

The hooks therefore coordinate existing responsibilities without becoming an additional gameplay authority or duplicating the rules owned by the domain layer.

#### Hook Responsibilities

Each hook has a defined responsibility within Placement's application layer. Together, they coordinate the placement workflow while preserving the separation between interaction state, semantic derivation, domain operations, and public interfaces.

**`usePlacementController()`**

Coordinates Placement's internal responsibilities and serves as the module's main application-level integration point. It connects interaction handling, derivations, mutations, contract construction, and feedback coordination.

It returns a `PlacementController` object that exposes the current placements, interaction interface, preview, and public contract.

```ts
interface PlacementController {
    playerPlacements: ShipPlacement[];
    interaction: PlacementInteractionsContract;
    preview: PlacementPreview | null;
    contract: PlacementContract;
}
```

**`usePlacementContract()`**

Calculates and assembles the public Placement contract from the derived semantic models and the current feedback event. It groups the capabilities, instruction, feedback, and statistics that Placement makes available to its consumers.

```ts
type PlacementContract = {
    capabilities: PlacementCapabilities;
    instruction: PlacementInstruction;
    feedback: GameFlowFeedbackEvent | null;
    stats: PlacementStats;
};
```

**`usePlacementDerivations()`**

Coordinates the calculation of Placement's semantic models from the current interaction state and authoritative placement data. It returns the derived statistics, capabilities, preview, and instruction without mutating gameplay state.

```ts
type PlacementDerivations = {
    stats: PlacementStats;
    capabilities: PlacementCapabilities;
    preview: PlacementPreview | null;
    instruction: PlacementInstruction;
};
```

**`usePlacementInteractions()`**

Adapts temporary interaction state into the values and operations required by the placement workflow. Its interface supports ship selection, orientation changes, target-cell management, and board interactions.

Representative interface members include:

```ts
selectedShipType
selectedShip
orientation
targetCell

selectShip()
rotate()
setTargetCell()
onBoardInteraction()
onBoardLeave()
```

These values and operations represent the current interaction context; they do not directly establish authoritative fleet placements.

**`usePlacementMutations()`**

Coordinates domain operations that attempt to change authoritative gameplay state and applies successful results to the gameplay store. The domain remains responsible for validating placement changes and determining their outcomes.

Its current public operations are:

```ts
placeShip(placement: ShipPlacement)
confirmFleet()
```

`placeShip()` delegates placement validation and fleet updates to the domain operation before applying a successful result to the store. `confirmFleet()` coordinates the domain-level fleet confirmation and updates the game state.

The exact hook structure may evolve over time, but each hook should retain a clear responsibility and preserve the separation between application coordination, semantic derivation, and domain authority.

#### Composition Strategy

Placement hooks compose the module's responsibilities into a coordinated application workflow.

Each hook builds on the appropriate outputs of existing hooks and derivations rather than recreating their logic. The resulting composition follows a clear separation of responsibilities:

- **Coordination:** `usePlacementController()` connects interaction handling, derivations, mutations, contract construction, and feedback coordination.
- **Derivation:** Placement semantic models are calculated from their inputs rather than maintained as independent authoritative state.
- **Contract construction:** `usePlacementContract()` assembles the semantic values exposed through `PlacementController.contract`.
- **Domain operations:** Placement mutations are coordinated at the application layer, while the domain remains responsible for validating and determining the outcome of authoritative fleet changes.
- **Consumption:** Game Flow consumes the Placement contract values required for shared gameplay semantics, while Placement-specific UI can access the controller values relevant to its own responsibilities.

This composition should remain explicit and focused. Application hooks must not duplicate domain rules, introduce competing sources of authoritative gameplay state, or accumulate responsibilities that belong to other parts of the architecture.

---

### interactions/

This directory owns the temporary interaction state and actions required by the Placement workflow.

It manages the interaction context used by Placement derivations and application-level coordination. It does not own authoritative gameplay state, derived placement semantics, presentation state, or domain validation rules.

The interaction state represents the player's current placement context:

```ts
export type PlacementInteractionState = {
    selectedShipType: ShipType | null;
    orientation: Orientation;
    targetCell: Position | null;
};
```

The interaction store exposes lightweight state mutations:

```ts
type PlacementInteractionActions = {
    setSelectedShipType: (shipType: ShipType | null) => void;
    setOrientation: (orientation: Orientation) => void;
    setTargetCell: (position: Position | null) => void;
    resetPlacementInteraction: () => void;
};
```

These actions update only temporary interaction state. They do not create, remove, reposition, or validate authoritative ship placements.

#### BoardCellInteraction

The interaction layer defines a unified input contract between the Board presentation component and the Placement workflow:

```ts
export type BoardCellInteraction = {
    position: Position;
    shipType?: ShipType;
};
```

- `position` identifies the board cell involved in the interaction.
- `shipType` is provided when the interacted cell contains a ship, enabling Placement to interpret ship reselection and repositioning interactions.

The `shipType` value originates from the Board View Model rather than directly from the domain. Board forwards the information it already receives without interpreting its gameplay meaning.

#### Board Interaction Responsibility Contract

Board is a presentation-only component responsible for rendering board cells and forwarding user interactions through the defined interaction contract.

It must not implement placement-specific gameplay semantics, including ship selection, repositioning decisions, placement validation, or replacement logic.

The responsibilities are divided as follows:

- Board renders cells and forwards interaction data.
- `usePlacementInteractions()` interprets board interactions and manages temporary interaction state.
- `usePlacementController()` coordinates placement operations when an interaction requests a placement.
- Domain operations validate proposed placements and determine the outcome of authoritative fleet changes.

#### Interaction Flow

Board forwards user interactions through a unified callback:

```ts
onBoardInteraction(interaction: BoardCellInteraction)
```

The interaction workflow has two related paths.

**Interaction state and preview derivation**

```text
UI event
    |
    v
Board emits BoardCellInteraction
    |
    v
usePlacementInteractions()
    |
    v
Interprets interaction
    |
    v
Updates temporary interaction state
    |
    v
usePlacementDerivations()
    |
    v
PlacementPreview
```

The interaction handler may update the selected ship or target cell, depending on the current interaction context. The resulting state changes provide the inputs used to derive the placement preview.

**Placement mutation**

```text
Board interaction
    |
    v
usePlacementInteractions()
    |
    v
Returns placement interaction result
    |
    v
usePlacementController()
    |
    v
usePlacementMutations()
    |
    v
Domain placement operation
    |
    v
Successful result updates authoritative placements
```

When the player interacts with the current target cell while a ship is selected, the interaction handler returns a placement result. The Placement controller coordinates the corresponding mutation rather than delegating that responsibility to the interaction hook.

This separation keeps Board presentation-only, interaction state temporary, preview data derived, and authoritative fleet changes under domain control.

The unified interaction contract also provides a consistent integration point for different input methods without requiring separate placement workflows.

---

### Device Capabilities

Certain interaction patterns depend on device input capabilities rather than viewport dimensions. Placement distinguishes between environments that support hover interactions and those that do not.

Hover support is determined through browser capabilities rather than responsive breakpoints:

```ts
const supportsHover =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
```

The query evaluates two characteristics of the primary input mechanism:

- `(hover: hover)` indicates that the primary input mechanism can hover over elements without activating them.
- `(pointer: fine)` indicates that the primary input mechanism provides precise pointing.

The resulting `supportsHover` value determines whether Board receives hover-related callbacks:

```tsx
<Board
    boardVM={boardVM}
    interactive={capabilities.canPlaceFleet}
    onCellHover={
        supportsHover
            ? placement.interaction.setTargetCell
            : undefined
    }
    onCellLeave={
        supportsHover
            ? placement.interaction.onBoardLeave
            : undefined
    }
    onCellPress={placement.interaction.onBoardInteraction}
/>
```

**Hover-capable devices**

When hover support is available, Board receives `onCellHover` and `onCellLeave`.

Moving the pointer over a cell updates the current target cell through `setTargetCell()`. Placement derivations use this interaction state to calculate the corresponding preview before the player activates the cell.

When the player clicks the current target cell, `onBoardInteraction()` processes the interaction and can request a placement operation.

**Devices without hover support**

When hover support is unavailable, the hover-related callbacks are omitted. The placement workflow relies on cell activation through `onCellPress`.

The first tap establishes the target cell and allows the preview to be derived. When a ship is already selected, tapping the same target cell again produces a placement interaction result.

The Placement controller then coordinates the corresponding mutation.

**Shared placement workflow**

Device capabilities change how the target cell is established, but they do not introduce separate placement workflows.

Both interaction patterns share:

- The same temporary interaction state.
- The same placement derivations and preview validation.
- The same board interaction handler.
- The same application-level mutation coordination.
- The same domain placement rules.

This keeps input-specific behavior at the presentation integration boundary while preserving consistent placement semantics across different input environments.

Device capabilities are independent of responsive layout breakpoints. Screen dimensions determine presentation composition, while input capabilities determine which interaction callbacks are provided to Board.

---

## Domain Rules vs Application Derivation

Domain rules answer:

- Can a ship be placed here?
- Which cells does this placement occupy?
- Do placements overlap?

Application derivation answers:

- What preview should the player see for the current interaction context?
- Which placement capabilities are currently available?
- What instructions, feedback, and module-specific statistics should be exposed?

Domain rules remain pure, deterministic, and authoritative.

Application derivation uses the relevant authoritative gameplay data, temporary interaction state, and domain rules to calculate placement-specific semantic models.

These models are consumed by Game Flow or Placement-specific presentation components. They describe the current placement context without becoming independent sources of gameplay authority.

---

## Emerging Placement Domain Architecture

The Placement domain isolates the authoritative concepts required to validate and mutate fleet placement.

Placement-specific concerns are separated from ship semantics, keeping gameplay authority explicit and responsibilities narrowly focused.

```txt
domain/
└── placement/
    ├── rules/
    ├── models/
    └── mutations/
```

This section documents the architectural direction rather than fully defining the placement domain yet.

Placement depends on a separate `ship/` domain for foundational ship semantics. `ShipPlacement` is the placement model that references `BaseShip` and represents an authoritative spatial placement of a ship on the board.

During GameState.PLACEMENT, playerPlacements represents the authoritative current placement configuration. The fleet becomes confirmed when the game transitions out of the placement phase into battle.

Responsibilities:

- `rules/` contains pure placement-rule logic such as `canPlaceShip()`, `shipsOverlap()`, and `getShipCoordinates()`.
- `mutations/` contains authoritative placement mutations such as `upsertShipPlacement()`, `removeShipPlacement()`, and `resetPlacements()`.
- `models/` contains placement-specific domain models such as `ShipPlacement`.

This remains aligned with the placement philosophy:

```txt
Interaction State
       |
       v
Pure Derivation
       |
       v
Placement Semantics
       |
       v
Presentation
```

```txt

Placement Interaction
       |
       v
Application Coordination
       |
       v
Domain Validation
       |
       v
Authoritative Mutation
```

---

## Placement Architecture Anti-Patterns

Architectural degradation happens through responsibility leakage and misplaced ownership.

### Key Anti-Patterns to Avoid

- **Board owning gameplay** — Board is presentation-only. It must not calculate placement legality, resolve domain rules, or coordinate authoritative mutations.
- **Monolithic application hooks** — Avoid hooks that implement interaction handling, derivation logic, domain rules, and mutation workflows internally instead of composing specialized responsibilities.
- **Impure derivation** — Derivation functions must remain pure, synchronous, and deterministic. They must not mutate authoritative gameplay state or introduce side effects.
- **Gameplay logic in UI** — Placement rules belong to the domain, while placement capabilities and contextual semantics belong to application derivations. Components should consume these values rather than recreate their logic.
- **Responsibility leakage** — Keep interaction state ephemeral and limited. Do not move preview derivation, placement validation, or authoritative mutation logic into presentation or interaction layers.
- **Alternative gameplay authority** — Application hooks and presentation components must never introduce independent sources of authoritative fleet state or bypass domain operations.

---
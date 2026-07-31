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

## Placement — Canonical Architecture

The Placement module transforms temporary interaction state into authoritative fleet placement through pure derivation and domain mutations.

Its responsibility is intentionally narrow. It does not own gameplay rules or placement authority. Instead, it derives the placement semantics owned by the module. The parts of that contract required by the global application flow are consumed by Game Flow, while module-specific data remains available to feature-specific UI components.

Ownership remains explicit:

- **Domain** owns placement validation and authoritative fleet mutations.
- **Placement** derives placement semantics and exposes its public contract.
- **Game Flow** consumes the contract required by the global application flow.
- **Presentation** renders the resulting projections.

The canonical flow is:

```txt
Interaction State
        │
        ▼
Placement Derivations
 ├─ Preview
 ├─ Availability
 ├─ Capabilities
 ├─ Instruction
 ├─ Feedback
 ├─ Stats
        │
        ├──────────────┐
        │              │
        ▼              ▼
Game Flow      Feature UI Components
(consumes      (PlacementStats,
global         ShipPalette,
contracts)     Controls, ...)
        │
        ▼
Placement Mutations
        │
        ▼
Domain
```

Design principles:

- interaction state is ephemeral and flow-scoped
- placement semantics are always derived
- preview is semantic, disposable, and never authoritative
- board composition remains presentation-only
- placement mutations are the only authority for updating the fleet
- fleet confirmation is the only explicit confirmation flow
- module-specific information remains owned by Placement

Placement follows a derivation-first architecture:

```txt
interaction
    ↓
pure derivation
    ↓
authoritative mutation
```

A valid preview never modifies gameplay state. Only domain placement mutations may commit changes to the authoritative fleet configuration.

---

## Placement Public Contract   

The Placement module exposes a public contract that represents the semantics owned by the feature.

This contract is the only interface that other modules should consume. Internal interaction state and implementation details remain private to Placement.

Following the ownership model:

- Placement derives all placement semantics.
- Game Flow consumes only the subset required by the global application flow.
- Placement-specific UI components may consume additional module data directly when it is   not part of the global flow.

A typical public contract may include:

```ts
type PlacementContract = {
    capabilities: PlacementCapabilities;
    instruction: PlacementInstruction;
    feedback: PlacementFeedback;
    stats: PlacementStats;
};
```

```txt
Placement Module
        │
        ├── consumed by Game Flow
        │      capabilities
        │      instruction
        │      feedback
        │
        └── consumed directly by Placement UI
               stats
               preview
               availability
```

Other placement derivations, such as previews or availability models, remain internal unless another module explicitly requires them.

The public contract defines the architectural boundary of the Placement module rather than its internal implementation.


---

## Shared Derivation Philosophy

Placement follows a derivation-first architecture.

The module derives semantic projections from interaction state and authoritative domain data. These derivations represent the current placement context, but they never become authoritative gameplay state.

Some of these derivations are exposed through the module's public contract and consumed by Game Flow, while others remain available to placement-specific UI components.

Regardless of their consumer, all derivations share the same characteristics:

- they are pure and synchronous
- they are ephemeral
- they are presentation-facing
- they never mutate authoritative gameplay state

Only placement mutations performed by the Domain may commit changes to the player's fleet configuration.

---

## Preview as Interaction-Derived Semantics

PlacementPreview is the semantic projection of a potential ship placement.

Preview answers:

```txt
"What would happen if the player placed the ship here?"
```

It is:

- derived from interaction state such as hover, tap, or other targeting inputs
- recomputed on each change
- semantic placement data derived from the current interaction context
- not persisted as standalone state
- platform-agnostic

Recommended preview contract:

```ts
type PlacementPreview = {
    cells: Position[];
    isValid: boolean;
    validationError?: PlacementValidationError;
};
```

Preview must not contain presentation details such as rendering colors, CSS classes, animation state, or opacity.

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
interaction state
        ↓
derivePlacementPreview()
        ↓
PlacementPreview
        ↓
placeShip()
        ↓
ShipPlacement
```

### Editable Placements

During `GameState.PLACEMENT`, ships already present in the authoritative `playerPlacements` configuration remain editable. A previously placed ship may be selected again and re-enter the normal placement workflow.

The workflow does not distinguish between initial placement and repositioning. Both operations follow the same interaction → derivation → mutation pipeline.

### Preview Validation During Repositioning

When a previously placed ship is selected for repositioning, its current placement must not participate in preview validation. Conceptually, the selected ship is treated as temporarily excluded from occupancy derivation.

```txt
existing placement
    ↓
selectedShipType
    ↓
derive preview
    ↓
validate against remaining placements
```

This prevents a ship from conflicting with its own authoritative placement while being edited.

### Current Placement Scope

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

### Relationship With Placement Mutations


While the game remains in `GameState.PLACEMENT`, the player may freely modify the fleet configuration through:

- `upsertShipPlacement()`
- `removeShipPlacement()`
- `resetPlacements()`

These mutations are ship-centric. `ShipType` is the placement identity. Executing a placement mutation updates the placement for a `ShipType` or creates one if it does not yet exist. Placement and repositioning are intentionally treated as the same mutation category.

Once the game transitions to `GameState.BATTLE`, placements become read-only. Placement derivations never modify the authoritative fleet configuration; they only describe the current placement context.

### Confirmation and Validation

Per-ship confirmation does not exist. Fleet confirmation remains the only explicit placement confirmation step.

Preferred flow:

```txt
place ships
    ↓
confirm fleet
    ↓
battle phase
```

Not:

```txt
confirm ship placement
```

Use declarative capabilities such as `canConfirmFleet` and avoid extra confirmation phases.

A preview-valid result is not sufficient to mutate gameplay state. Only `placeShip()` commits placement as authoritative gameplay state, and placement actions remain the authoritative validation boundary.

### State Boundaries

The gameplay store owns authoritative gameplay state, including values such as `GameState` and `Ships`.

Interaction state is temporary and discardable, including values such as `targetCell`, `selectedShipType`, and `orientation`.

### Platform Direction

Desktop
---------
hover
↓
setTargetCell()
↓
derivePlacementPreview()
↓
click
↓
placeShip()

Mobile
---------
tap
↓
setTargetCell()
↓
derivePlacementPreview()
↓
tap same cell
↓
placeShip()

Platform differences affect interaction events only. Placement semantics, preview derivation, and placement mutations remain shared.

---

## Placement Module Structure

The directory tree is only a suggested reflection of semantic ownership boundaries. The architecture should prioritize responsibilities over physical file organization.

```txt
application/
└── placement/
    ├── derive/
    │   ├── derivePlacementAvailability.ts
    │   ├── derivePlacementCapabilities.ts
    │   ├── derivePlacementInstruction.ts
    │   ├── derivePlacementFeedback.ts
    │   ├── derivePlacementStats.ts
    │   ├── derivePlacementPreview.ts
    │   ├── derivePlacementState.ts
    │   ├── deriveShipOccupancy.ts
    │   └── placementPreview.types.ts
    │
    ├── hooks/
    │   └── usePlacementFlow.ts
    │
    ├── interactions/
    │   ├── placement-interaction.actions.ts
    │   ├── placement-interaction.initial.ts
    │   ├── placement-interaction.store.ts
    │   └── placement-interaction.types.ts
```

### interactions/

This layer owns only ephemeral interaction state required to derive placement semantics.
It must not own authoritative gameplay state, derived placement semantics, visual state, or placement authority.

Example interaction state:

```ts
export type PlacementInteractionState = {
    selectedShipType: ShipType | null;
    orientation: ShipOrientation;
    targetCell: Position | null;
};
```

Example actions:

```ts
type PlacementInteractionActions = {
    setSelectedShipType: (shipType: ShipType | null) => void;
    setOrientation: (orientation: ShipOrientation) => void;
    setTargetCell: (position: Position | null) => void;
    resetPlacementInteraction: () => void;
};
```

The store should expose only lightweight interaction mutations such as `setSelectedShip()`, `setOrientation()`, `setTargetCell()`, and `resetPlacementInteraction()`.

Placement editing is supported during `GameState.PLACEMENT`.

#### BoardCellInteraction

The interaction layer introduces a unified input contract between the board UI and the placement system:

```ts
export type BoardCellInteraction = {
    position: Position;
    shipType?: ShipType;
};
```

`shipType` is present only when interacting with a cell that contains a ship, enabling re-selection and repositioning flows. It comes from the board view model rather than the domain.

##### Board Interaction Responsibility Contract

The board is a presentation-only component. It is responsible exclusively for rendering board cells and forwarding user interactions.

It must not contain gameplay semantics such as ship selection logic, placement editing logic, validation, or replacement logic. All interaction interpretation is delegated to `usePlacementFlow`.

##### Interaction Flow

The board emits a unified interaction contract:

```ts
onBoardInteraction(interaction: BoardCellInteraction)
```

```txt
UI event
  ↓
Board emits interaction
  ↓
usePlacementFlow interprets intent
  ↓
updates interaction state
  ↓
derives preview
  ↓
executes placement mutation if confirmed
```

This keeps the board purely presentational and future-proofs the flow for different input methods such as touch, mouse, or keyboard.

---

### Device Capabilities

Certain interaction patterns depend on device capabilities rather than screen size. The placement workflow differentiates between devices that support hover and those that do not.

Hover support is detected through browser capabilities rather than viewport breakpoints:

```ts
const supportsHover =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
```

---

### derive/

This layer owns the placement derivation intelligence. All derivation functions should remain pure, synchronous, stateless, and deterministic.

All derivation functions remain pure, synchronous, deterministic, and side-effect free. They transform authoritative gameplay state and temporary interaction state into the semantic contracts owned by Placement.

Depending on their responsibility, those models may be consumed by Game Flow, by Placement-specific UI, or by other Placement derivations

#### derivePlacementState.ts

`derivePlacementState()` derives the high-level placement workflow state.

It is a semantic projection of the current placement context rather than authoritative gameplay state.

```ts
    type PlacementState = 
    | 'placing_ships' 
    | 'fleet_ready';
```

This derivation is owned entirely by the Placement module.

#### derivePlacementCapabilities.ts

`derivePlacementCapabilities()` derives the interaction permissions owned by Placement.

These capabilities describe what placement actions are currently available and become part of the Placement public contract.

```ts
type PlacementCapabilities = {
    canPlaceShip: boolean;
    canConfirmFleet: boolean;
    canInteractWithBoard: boolean;
};
```

#### derivePlacementInstruction.ts

`derivePlacementInstruction()` derives the contextual guidance owned by Placement.

It communicates what the player should do next during the placement workflow.

Examples include:

- Select a ship.
- Rotate the selected ship.
- Confirm your fleet.

The resulting instruction becomes part of the Placement public contract.

#### derivePlacementFeedback.ts

`derivePlacementFeedback()` derives transient feedback generated by placement interactions.

Unlike instructions, feedback communicates something that has just occurred rather than what the player should do next.

Examples include:

- Invalid placement.
- Ship repositioned.
- Fleet confirmed.

The resulting feedback becomes part of the Placement public contract.

#### derivePlacementStats.ts

`derivePlacementStats()` derives module-specific placement information intended for Placement-specific UI.

Typical examples include:

```ts
type PlacementStats = {
    remainingShips: number;
    selectedShipType: ShipType | null;
    orientation: ShipOrientation;
};
```

Unlike capabilities, instructions, and feedback, these values are typically consumed directly by Placement UI components rather than by Game Flow.


#### derivePlacementPreview.ts

`derivePlacementPreview()` derives the semantic preview for the current interaction context.

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

The preview remains domain-oriented semantic data only. It should not contain rendering state such as color, CSS classes, opacity, or animation state.

#### derivePlacementAvailability.ts

This function derives availability semantics such as remaining ships and whether the fleet is fully placed. It avoids conditional logic explosion in UI components.

```ts
export type PlacementAvailability = {
    remainingShipTypes: ShipType[];
    allShipsPlaced: boolean;
};

type DerivePlacementAvailabilityParams = {
    fleet: BaseShip[];
    placements: ShipPlacement[];
};
```

The initial implementation uses the static `STANDARD_FLEET`, but future game modes may provide a different fleet definition without changing the derivation logic.

#### deriveShipOccupancy.ts

This derivation expands authoritative `ShipPlacement` data into a cell-level representation:

```ts
type ShipCell = {
    position: Position;
    shipType: ShipType;
};
```

It is used to support board view-model composition, ship visibility, placement visualization, and board interaction context.

---

### Application Hooks/

Application hooks adapt the Placement module for consumption by the Presentation layer.

Rather than exposing a single, monolithic API, each hook adapts a specific responsibility of the module. This keeps ownership explicit, reduces coupling, and allows UI components to depend only on the semantics they require.

Following the architecture established throughout this document:

- interaction hooks adapt temporary interaction state;
- derivation hooks expose semantic models;
- mutation hooks execute authoritative domain actions;
- contract hooks expose the public interface consumed by other application modules.

Application hooks never become an additional gameplay authority. They compose existing module responsibilities without introducing new business logic.

#### Hook Responsibilities

Each hook should have a single, well-defined responsibility.

Typical examples include:

`usePlacementInteraction()`
    adapts interaction state

`usePlacementDerivations()`
    exposes placement semantic models

`usePlacementMutations()`
    adapts authoritative domain mutations

`usePlacementContract()`
    exposes the public Placement contract consumed by Game Flow

The exact hook structure may evolve over time, but responsibilities should remain isolated

#### Composition Strategy

Application hooks should:

- adapt one module responsibility at a time
- compose existing derivations instead of recreating them
- remain lightweight and presentation-oriented
- never duplicate gameplay rules
- never become orchestration engines
- never introduce alternative gameplay authority

#### usePlacementInteraction()

Owns the temporary interaction state required during fleet placement.

It exposes interaction state together with the actions that mutate that state.

Typical examples include:

```ts
selectedShipType
orientation
targetCell

selectShip()
rotate()
setTargetCell()
resetInteraction()
```

#### usePlacementMutations()

Adapts authoritative placement mutations exposed by the domain.

Typical examples include:

```ts
placeShip()
confirmFleet()
removePlacement()
```
### usePlacementContract()

Exposes the public Placement contract consumed by external application modules.

Game Flow should consume this hook rather than individual Placement derivations.

Typical examples include:

```ts
placement.capabilities
placement.instruction
placement.feedback
placement.stats
```

---

## Domain Rules vs Application Derivation

Domain rules answer:

- Can a ship be placed here?
- Which cells does this placement occupy?
- Do placements overlap?

Application derivation answers:

- What preview should the player see?
- What semantic models should the Board ViewModel receive?
- What capabilities, instructions, feedback, or module-specific data should be exposed?

Domain rules remain pure, deterministic, and authoritative.

Application derivation composes authoritative gameplay state, interaction state, and domain rules into the semantic models consumed by Game Flow or by Placement-specific presentation components.

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

During `GameState.PLACEMENT`, `playerPlacements` is the authoritative current fleet configuration; it is not a final fleet until the game transitions to battle.

Responsibilities:

- `rules/` contains pure placement-rule logic such as `canPlaceShip()`, `shipsOverlap()`, and `getShipCoordinates()`.
- `mutations/` contains authoritative placement mutations such as `upsertShipPlacement()`, `removeShipPlacement()`, and `resetPlacements()`.
- `models/` contains placement-specific domain models such as `ShipPlacement`.

This remains aligned with the placement philosophy:

```txt
interaction
    ↓
pure derivation
    ↓
authoritative mutation
```

---

## Placement Architecture Anti-Patterns

Architectural degradation happens through responsibility leakage and misplaced ownership.

### Key Anti-Patterns to Avoid

- **Board owning gameplay** — the board is presentation-only. Never calculate legality, resolve rules, or orchestrate placement.
- **Hooks as orchestration engines** — application hooks adapt existing responsibilities. They should not centralize interaction, derivation, mutations, and feature contracts into a single API.
- **Impure derivation** — derivation functions must remain pure, synchronous, stateless, and deterministic.
- **Gameplay logic in UI** — keep placement rules and availability logic in derivation layers rather than components.
- **Responsibility leakage** — keep interaction state ephemeral and limited. Do not leak preview, validation, or placement authority into UI or interaction layers.
- **Monolithic application hooks** — avoid exposing unrelated responsibilities through a single Placement hook. Hooks should adapt one responsibility at a time

---
# Sea Warfare — UI Architecture

## Project Context

Stack: React, TypeScript, Zustand, Next.js

Architecture layers: Domain → Application → Presentation

Design priorities: Declarative rendering, domain purity, low coupling, derivation-first architecture, and lightweight orchestration.

---

## Design Goals

The Sea Warfare interface is designed to:

- Prioritize gameplay over decoration.
- Minimize cognitive load.
- Expose only contextually relevant information.
- Maintain visual and interaction consistency across gameplay phases.
- Adapt to different screen sizes and input capabilities without changing gameplay semantics.
- Keep presentation components independent of gameplay rules and authoritative state.

---

## Supported Devices and Interaction Capabilities

Sea Warfare is designed to accommodate:

- Desktop computers
- Tablets
- Mobile phones

The interface supports different interaction capabilities, including:

- Pointer input with hover.
- Touch input.
- Keyboard shortcuts where implemented and appropriate.

The UI adapts its layout and interaction affordances to the available capabilities rather than relying exclusively on device categories.

Responsive layout decisions and input capabilities are independent concerns. Neither changes the underlying gameplay rules or semantics.

---

## Screen Inventory

The application is organized around four primary gameplay phases. Each phase determines the content and interactions presented to the player..

| Screen      | Responsibility |
|-------------|----------------|
| Setup       | Allow the player to start a new match. |
| Placement   | Configure and confirm the player's fleet before entering battle. |
| Battle      | Provide the primary gameplay interface during combat. |
| Game Over   | Present the match result and available next actions while preserving the final board state for inspectio. |

Transient feedback messages may be displayed over the active screen. They communicate the result of an interaction or operation but do not represent independent screens or gameplay phases.

---

## Screen Flow

Screen transitions follow the progression of the authoritative GameState, rather than being controlled by imperative UI navigation.

```txt
Setup
↓
Placement
↓
Battle
↓
Game Over
↓
Setup
```

The active gameplay phase determines which screen composition is rendered.

Transient feedback, such as placement-related messages, does not change the active phase or redefine the screen flow.

---

## Layout Regions

The main gameplay interface is organized into three high-level layout regions:

```txt
+----------------------------------------------------+
| Header                                             |
+----------------------------------------------------+
|                                                    |
|                     GameStage                      |
|                                                    |
+----------------------------------------------------+
|                Information Panel                   |
+----------------------------------------------------+
```

Each region has a stable presentation responsibility:

- Header: Displays global application context and primary actions.
- GameStage: Hosts the main gameplay content and interactions for the active phase.
- InformationPanel: Displays contextual gameplay information.

The regions remain conceptually consistent across gameplay phases, while their internal content changes according to the active phase.

### Setup

**Purpose**

Allow the player to start a new match before entering fleet placement.

```txt
+----------------------------------------------------+
| Header                                             |
+----------------------------------------------------+
|                                                    |
|                     GameStage                      |
|                                                    |
|                    Player Board                    |
|                                                    |
+----------------------------------------------------+
|                                                    |
|                InformationPanel                    |
|                                                    |
+----------------------------------------------------+
```

**Composition**

- Header
- GameStage
   - PlayerBoard
- InformationPanel

### Placement

**Purpose**

Allow the player to configure and confirm their fleet before entering the battle phase.

```txt
+----------------------------------------------------+
| Header                                             |
+----------------------------------------------------+
|                   GameStage                        |
|                       |                            |
|    Player Board       |       PlacementBar         |
+----------------------------------------------------+
|                Information Panel                   |
+----------------------------------------------------+
```

**Composition**

- Header
- GameStage
   - Player Board
   - PlacementBar
- InformationPanel

### Battle

**Purpose**

Provide the primary gameplay interface where the player engages in combat against the opponent.

```txt
+----------------------------------------------------+
| Header                                             |
+----------------------------------------------------+
|                   GameStage                        |
|                       |                            |
|    Player Board       |       Enemy Board          |
+----------------------------------------------------+
|                Information Panel                   |
+----------------------------------------------------+
```

**Composition**

- Header
- GameStage
   - Player Board
   - Enemy Board
- InformationPanel

### Game Over

**Purpose**

Present the completed match result and available next actions while preserving the final board state for inspection.

```txt
+--------------------------------------------------+
| Header                                           |
+--------------------------------------------------+
|                          |                       |
|      Player Board        |     Enemy Board       |
|                          |                       |
+--------------------------+-----------------------+
|              Information Panel                   |
+--------------------------------------------------+
```

**Composition**

- Header
- GameStage
   - Player Board
   - Enemy Board
- InformationPanel

---

## UI Composition

The Presentation layer composes the interface by consuming application-level semantics through explicit contracts.

The composition distinguishes between two sources of information:

Game Flow

`useGameFlowController()` exposes global gameplay semantics required by shared UI components. These include capabilities, presentation content, instructions, statistics, and feedback needed by the overall gameplay interface.

Feature Modules

Feature modules expose their own application-level contracts and interaction interfaces. Feature-specific UI may consume these values directly when they are relevant to its responsibility.

For example, Placement exposes a `PlacementController` through `usePlacementController()`. GameScreen uses its contract values as input to `useGameFlowController()`, while GameStage receives the Placement controller to provide placement-specific interactions and information to its components.

Typical composition looks like:

```txt
                         GameScreen
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    useGameFlowController()       usePlacementController()
              │                             │
              ▼                             ▼
         Game Flow                     Placement
              │                             │
              │                    ┌────────┴────────┐
              │                    │                 │
              ▼                    ▼                 ▼
     Global gameplay       Placement contract   Interactions
         semantics          and derived data     and preview
              │                    │                 │
              └──────────┬─────────┘                 │
                         │                           │
                         ▼                           ▼
                     Presentation Components
```

This composition keeps global gameplay coordination separate from feature-specific responsibilities.

Game Flow does not need to mediate every feature-specific value. Presentation components consume the appropriate interface according to their responsibility, without accessing internal feature hooks or owning gameplay logic.

---

## Presentation Regions

Presentation components render application-provided values and expose user interactions through callbacks.

They do not own authoritative gameplay state, enforce domain rules, or independently derive gameplay decisions.

### Header

The Header presents global gameplay context and primary actions.

Its content may change according to the active phase and the capabilities exposed by Game Flow.

### GameStage

GameStage is the primary content and interaction region.

It composes the visual elements required by the active gameplay phase:

- Setup: Player Board.
- Placement: Player Board and PlacementBar.
- Battle: Player Board and Enemy Board.
- Game Over: Player Board and Enemy Board.

It connects presentation interactions to the corresponding application-level operations through callbacks and controller interfaces.

### InformationPanel

InformationPanel presents contextual information for the active gameplay phase.

It consumes application-provided instructions, statistics, and presentation content rather than implementing gameplay decisions itself.

---

### Presentation Principles

The Presentation layer follows these principles:

- Declarative rendering: UI output reflects the application-provided values and current phase.
- Explicit contracts: Components receive the values and operations relevant to their responsibilities.
- Separation of concerns: Visual components do not own gameplay rules, validation, or authoritative state mutations.
- Feature ownership: Feature-specific semantics remain owned by their respective modules.
- Composition over coupling: Shared UI consumes Game Flow semantics, while feature-specific UI can consume feature interfaces directly.
- Responsive presentation: Layout adapts to available space and input capabilities without changing gameplay behavior.

---

## Responsive Strategy

The responsive strategy reorganizes the presentation layout according to available space without changing screen responsibilities, gameplay semantics, or application behavior.

Every gameplay phase preserves the same high-level page structure across supported layouts:

```txt
Header
   ↓
GameStage
   ↓
InformationPanel
```

The content within each region is determined by the active gameplay phase, while its spatial arrangement adapts to the available viewport space.

### Responsive Principles

The following principles apply:

- Screen responsibilities remain consistent across layouts.
- Gameplay semantics and domain rules remain unchanged.
- Layout regions are reorganized rather than replaced.
- Responsive breakpoints control layout composition, not gameplay behavior.
- Input capabilities determine available interaction mechanisms independently of layout.
- Application contracts and feature ownership remain unchanged regardless of screen size.

### Typical Layout Adaptations
```txt
| Element | Wide Layout | Narrow Layout |
|---|---|---|
| GameStage | Uses horizontal or multi-column composition when sufficient space is available. | Uses vertical composition when horizontal space is limited. |
| PlacementBar | Positioned beside the Player Board during fleet placement. | Repositioned below the Player Board while preserving the same functionality. |
| Battle Boards | Player and Enemy Boards are displayed side by side when space allows. | Boards are arranged vertically while remaining simultaneously visible. |
| InformationPanel | Positioned below GameStage. | Remains below GameStage, adapting to the available width. |
```

### Layout and Interaction Independence

Responsive layout decisions and input capabilities are handled independently.

Breakpoints determine how presentation components are arranged, while input capability detection determines which interaction mechanisms are available.

For example, hover interactions may be enabled when the primary input mechanism supports hover and a fine pointer. Otherwise, the same gameplay interaction can be performed through touch-based input.

Neither layout changes nor input adaptations modify the underlying gameplay semantics or domain rules.

The responsive strategy changes presentation composition only. It does not alter application flow, feature ownership, application contracts, or authoritative gameplay state.

---

## View Models

ViewModels provide a presentation-oriented representation of application data, allowing UI components to render gameplay information without directly depending on domain models or authoritative gameplay state.

A ViewModel transforms relevant gameplay data and derived application semantics into a structure optimized for rendering.

We use this pattern to:

- Decouple presentation components from domain models and authoritative gameplay state.
- Centralize presentation-specific transformations.
- Keep UI components declarative and focused on rendering.
- Improve testability by separating presentation data preparation from visual components.

ViewModels are constructed from the data and semantic values relevant to the presentation component they support. Their responsibility is to prepare presentation data, not to own gameplay rules or authoritative state.

Presentation components consume the resulting ViewModel rather than accessing application stores directly.

### Current Implementation

The application currently exposes one public ViewModel:

| ViewModel | Responsibility |
|---|---|
| BoardViewModel | Represents the complete presentation state of a board, including its dimensions and the presentation data of each cell. |

### BoardViewModel

`useBoardViewModel()` constructs the `BoardViewModel` by combining logical cell information, placement preview data, and board-specific presentation context.

For each cell, it:

- Derives logical information from its position and the player's ship placements.
- Determines whether the cell belongs to the current placement preview and whether that preview is valid.
- Derives the cell's visual state using the board variant, logical information, preview state, selected ship context, and ship visibility.
- Produces the final cell presentation data.

The resulting `BoardViewModel` contains the board size and a two-dimensional collection of `BoardCellVM` objects.

This separates board presentation preparation from the visual components, allowing the Board UI to render the supplied cell data without implementing gameplay or presentation derivation logic itself.

---

## UI State Ownership

Presentation state follows the broader ownership rules defined in the State Ownership document.

This section focuses exclusively on presentation-specific state that affects rendering behavior but does not represent gameplay semantics or feature-level interaction state.

### Presentation State

Presentation state represents temporary UI behavior such as:

- Animation state.
- Transient visual interaction.
- Component-specific display state.

Presentation state should:

- Remain local to the component or UI feature that owns it.
- Exist only to support presentation behavior.
- Remain lightweight and disposable.

Components may own local presentation state when it only affects their internal rendering behavior.

Shared presentation state should only be introduced when coordinated behavior cannot be owned by a single presentation component or feature.

---

## Interaction Principles

Presentation components expose user interactions through callbacks without owning gameplay decisions or domain operations.

User interactions follow a consistent architectural flow:

```txt
User Interaction
       ↓
Presentation Component
       ↓
Feature Module / Game Flow
       ↓
Domain Operations
       ↓
Authoritative State
```

The interaction model follows these principles:

- User interactions express intent rather than gameplay decisions.
- The application layer interprets intent and coordinates the interaction flow.
- The domain remains the authority for gameplay validation and mutations.
- Interaction semantics remain consistent across supported input methods.

Different devices may expose different interaction mechanisms while preserving identical gameplay semantics.

---

## Accessibility

Accessibility is considered a core design principle rather than a post-development enhancement.

The interface follows these principles:

- core gameplay interactions should remain accessible through keyboard navigation
- interaction should never depend exclusively on hover
- information should not rely exclusively on color or other visual cues
- accessibility should be incorporated during component design rather than retrofitted later

The current document defines architectural accessibility principles. Component-level implementation details are documented separately as part of the Design System.

---

## Future Extensions

The current UI architecture is intentionally designed to support future growth without requiring fundamental changes to screen responsibilities or interaction semantics.

Expected areas of evolution include:

- Expanded match configuration during Setup.
- Additional game modes and gameplay variants.
- Richer gameplay information.
- New interaction capabilities and input methods.
- Additional responsive compositions for different viewport constraints.

Future extensions should preserve the existing separation between presentation, application orchestration, and domain authority.

---
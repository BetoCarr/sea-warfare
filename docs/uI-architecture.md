# Sea Warfare — UI Architecture

## Project Context

Stack: React, TypeScript, Zustand, Next.js

Layers: domain → application → presentation

Priorities: declarative rendering, domain purity, low coupling, derivation-first architecture, lightweight orchestration.

---

## Design Goals

The Sea Warfare interface is designed to:

- prioritize gameplay over decoration
- minimize cognitive load
- expose only contextually relevant information
- remain consistent across the entire experience
- adapt naturally to different devices without changing gameplay semantics

---

## Supported Devices

Sea Warfare is designed to support:

- desktop computers
- tablets
- mobile phones

Supported interaction capabilities include:

- pointer + hover
- touch
- keyboard shortcuts where appropriate

The UI adapts to interaction capabilities rather than specific device families. Different platforms may expose different interaction methods while preserving identical gameplay semantics.

---

## Screen Inventory

The application is organized into a small set of primary screens. Each screen represents a distinct gameplay phase with its own UI responsibilities.

| Screen      | Responsibility |
|-------------|----------------|
| Setup       | Start a new match. |
| Placement   | Configure and confirm the player's fleet before battle. |
| Battle      | Primary gameplay interface during combat. |
| Game Over   | Display the match result and available next actions. |

Modals, dialogs, and overlays are not considered independent screens. They represent temporary UI states layered on top of the active screen.

---

## Screen Flow

Screen transitions are derived from GameState progression rather than imperative UI navigation.

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

The current application follows a linear gameplay flow. Temporary UI elements such as dialogs, overlays, and modals never interrupt or redefine the active screen.

---

## Layout Regions

Every gameplay screen follows the same high-level layout.

```txt
+----------------------------------------------------+
| Header                                             |
+----------------------------------------------------+
|                                                    |
|                 Gameplay Area                      |
|                                                    |
+----------------------------------------------------+
|                Information Panel                   |
+----------------------------------------------------+
```

TLayout regions describe stable visual responsibilities. The components rendered inside each region may change between gameplay phases, but the regions themselves remain conceptually consistent.


### Setup

**Purpose**

Allow the player to start a new match before entering fleet placement.

```txt
+----------------------------------------------------+
| Header                                             |
+----------------------------------------------------+
|                                                    |
|                  Player Board                      |
|                                                    |
+----------------------------------------------------+
|                Information Panel                   |
+----------------------------------------------------+
```

**Regions**

- Header
- Player Board
- Information Panel

### Placement

**Purpose**

Allow the player to configure the fleet before entering the battle phase.


```txt
+----------------------------------------------------+
| Header                                             |
+----------------------------------------------------+
|                           |                        |
|        Player Board       |     Placement SideBar  |
|                           |                        |
+----------------------------------------------------+
|                Information Panel                   |
+----------------------------------------------------+
```

**Regions**

- Header
- Player Board
- Placement SideBar

### Battle

**Purpose**

Provide the primary gameplay interface where the player plays the match.

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

**Regions**

- Header
- Player Board
- Enemy Board
- Information Panel

### Game Over

**Purpose**

Allow the player to review the completed match and choose the next action while preserving the final board state for inspection.

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

**Regions**

- Header
- Player Board
- Enemy Board
- Information Panel

---

## UI Composition

Presentation consumes the application semantics that correspond to the responsibility of each UI region.

Global gameplay semantics are exposed through Game Flow, while feature-specific semantics remain owned by their corresponding feature modules and may be consumed directly by feature-specific UI.

Typical composition looks like:

```txt
                   Presentation
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
      Game Flow                 Feature Modules
        │                     (Placement, Battle)
        │                                 │
        ▼                                 ▼
 Global gameplay                Feature-specific
    semantics                     semantics
```

This separation preserves explicit ownership while avoiding unnecessary coupling between feature modules and the global application flow.

---

## Presentation Regions

Presentation components consume declarative application contracts rather than authoritative gameplay state. Depending on their responsibility, those contracts may come from Game Flow or directly from feature modules.

The presentation layer is organized around a small set of stable layout regions. Each region owns a specific UI responsibility while remaining independent of gameplay logic.

```txt
| UI Region | Responsibility | Typical Composition |
|-----------|----------------|---------------------|
| Header | Displays global application context and primary actions. | Title, global actions, phase-independent controls. |
| Gameplay Area | Hosts the primary interactive experience of the current gameplay phase. | Player Board, Enemy Board, Placement Sidebar. |
| Information Panel | Displays contextual information for the active gameplay phase. | Phase context, instructions, feature-specific information. |
```

The content rendered inside each region changes according to the active gameplay phase, while the overall page structure remains consistent throughout the application.

---

## Gameplay Area Composition

The Gameplay Area adapts to the active gameplay phase while preserving the same overall page structure.

```txt
| Phase | Gameplay Area Composition |
|-------|---------------------------|
| Setup | Player Board |
| Placement | Player Board + Placement Sidebar |
| Battle | Player Board + Enemy Board |
| Game Over | Player Board + Enemy Board |
```

The Placement Sidebar groups the controls required during fleet placement, such as ship selection and placement controls.

---

## Responsive Strategy

The responsive strategy reorganizes the presentation layout without changing screen responsibilities or gameplay semantics.

Every screen preserves the same architectural structure across supported layouts:

```txt
Header
    ↓
Gameplay Area
    ↓
Information Panel
```

Only the spatial arrangement of each region changes according to the available space.

The following principles apply:

- screen responsibilities never change
- gameplay semantics remain identical across every layout
- layout regions are reorganized rather than replaced
- interaction capabilities adapt independently from layout
- presentation contracts remain unchanged regardless of screen size

Typical layout adaptations include:

```txt
| Region | Wide Layout | Narrow Layout |
|--------|-------------|---------------|
| Gameplay Area | Multi-column composition when space allows. | Vertical composition when horizontal space becomes limited. |
| Placement Sidebar | Displayed beside the Player Board whenever possible. | Moves below the Player Board while preserving the same functionality. |
| Battle Boards | Player and Enemy boards are displayed side by side whenever space allows. | Boards stack vertically while remaining simultaneously visible. |
| Information Panel | Positioned below the Gameplay Area. | Remains below the Gameplay Area. |
```

The responsive strategy never changes feature ownership or application flow. It only reorganizes presentation.

### Layout Evolution

The current layouts illustrate how each gameplay phase adapts to smaller viewports.

```txt
Setup
────────────────────────
Header
Player Board
Information Panel


Placement
────────────────────────
Header
Player Board
Placement Sidebar
Information Panel


Battle
────────────────────────
Header
Player Board
Enemy Board
Information Panel


Game Over
────────────────────────
Header
Player Board
Enemy Board
Information Panel
```

Desktop layouts reorganize the Gameplay Area horizontally, while narrower layouts reorganize the same regions vertically.

The underlying gameplay flow, semantic contracts, and interaction model remain identical across every supported layout.

---

## View Models

Presentation regions render components that consume ViewModels instead of consuming authoritative gameplay state directly.

A ViewModel is a presentation-facing projection that adapts authoritative gameplay state and derived application semantics into a structure optimized for rendering.

ViewModels exist to:

- decouple presentation components from gameplay state
- centralize presentation semantics
- keep components declarative
- improve testability and reuse

ViewModels compose semantic models exposed by the Application layer. They may consume Game Flow contracts as well as feature-specific contracts depending on the responsibility of the component they support

Presentation components consume ViewModels and should not access application stores directly.

The current public ViewModels are:

| ViewModel | Responsibility |
|-----------|----------------|
| BoardViewModel | Represent the complete visual state of a board for rendering. |

---

## UI State Ownership

Presentation state follows the broader ownership rules defined in the State Ownership document.

This section focuses exclusively on presentation-specific state that affects rendering behavior but does not represent gameplay semantics.

### Presentation State

Presentation state represents temporary UI behavior such as:

- modal visibility
- animation state
- transient visual interaction

Presentation state should:

- remain local to the component or UI feature that owns it
- exist only to support the presentation layer
- remain lightweight and disposable

Components may own local presentation state when the state only affects their internal rendering behavior.

Shared presentation state should only be introduced when coordinated behavior cannot be owned by a single presentation component or feature

---

## Interaction Principles

Presentation components emit user interactions without interpreting gameplay intent.

User interactions follow a consistent architectural flow:

```txt
User Interaction
        ↓
Presentation Component
        ↓
Feature Module / Game Flow
        ↓
Domain
        ↓
Authoritative State
```

The interaction model follows these principles:

- user interactions express intent rather than gameplay decisions
- the application layer interprets intent and coordinates the interaction flow
- the domain remains the only authority for gameplay validation and mutations
- interaction semantics remain consistent across all supported platforms

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

- expanded match configuration during Setup
- additional game modes and gameplay variants
- richer gameplay information
- new interaction capabilities and input methods
- additional responsive layouts for emerging device categories

Future extensions should preserve the existing separation between presentation, application orchestration, and domain authority.

---
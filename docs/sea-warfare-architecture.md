# Initial Architecture Document — Sea Warfare (Next.js)

## Table of Contents
1. [Project Vision and Objectives](#1-project-vision-and-objectives)
2. [Scope by Stages](#2-scope-by-stages-priority--deliverables)
3. [Technical Vision](#3-technical-vision)
4. [Data Models](#4-data-models-prisma-example)
5. [API](#5-api-next-api-routes)
6. [Realtime — Socket Events](#6-realtime--socket-events)
7. [Game Logic and AI](#7-game-logic-and-ai)
8. [Testing & Deployment](#8-testing--deployment)
9. [Glossary](#9-glossary)
10. [Contributor Roles](#10-contributor-roles)

**Version:** 0.1  
**Purpose:** This document defines the vision, technical architecture, components, data models, API routes, and development stages to build an advanced version of the Battleship-inspired game "Sea Warfare" using Next.js as a fullstack framework.  It serves as a central reference for guiding the collaborative development process between the development team, GitHub Copilot, and project stakeholders.

---

## 1. Project Vision and Objectives

**Vision:** Create an interactive and extensible web application of the classic Battleship-style game with dynamic boards and ships, AI mode, and real-time multiplayer, including game persistence, authentication, and a modern, accessible UI.

**Main objectives:**
- Build a fully playable MVP (player vs AI) entirely in the browser.
- Support configurable boards and ships (custom sizes and ship types).
- Add persistence (save games, leaderboards) and authentication.
- Implement real-time multiplayer with state synchronization.
- Maintain a modular architecture with automated testing and continuous deployment.

**MVP success criteria:**
- Playable game: place ships, shoot, detect sunk ships/game end.
- Clear UI: interactive board, turn indicator, visual feedback.
- Basic AI for challenging games.

---

## 2. Scope by Stages (Priority & Deliverables)

**Stage 1 — Local MVP (High priority)**  
Goal: Have a playable game in the browser against a basic AI.  
Deliverables: Next.js app, 10x10 board, shooting logic, basic UI.  
Acceptance: Player vs AI works without errors.  
Tasks: Project setup, components, game logic module, unit tests.

**Stage 2 — Configurations and UX (Medium-High priority)**  
Goal: Configurable boards and better UX.  
Deliverables: Board size selector, manual placement, animations.  
Tasks: Drag & drop, animations.

**Stage 3 — Persistence and Authentication (Medium priority)**  
Goal: Save/load games, user login.  
Deliverables: Auth, DB models, API routes.  
Tasks: DB setup, schemas, API.

**Stage 4 — Real-time Multiplayer (Medium-Low priority)**  
Goal: PvP matches synced in real-time.  
Deliverables: Lobby, rooms, real-time sync.  
Tasks: Realtime stack, events.

**Stage 5 — Polish and Scale (Low priority)**  
Goal: Performance, analytics, i18n.  
Deliverables: Optimization, monitoring, translations.

---

## 3. Technical Vision

**Stack:** Next.js, TypeScript, Tailwind CSS, Zustand, Socket.io, Supabase, NextAuth.js, Vitest/Jest, Playwright, Vercel.  
**Architecture:** Client <-> Next API Routes <-> DB (Postgres).

## 3.1. Architecture Diagram

```mermaid
flowchart LR
    Client -- HTTP/WebSocket --> Next.js API
    Next.js API -- Prisma --> PostgresDB
    Next.js API -- Auth --> Supabase
    Next.js API -- Realtime --> Socket.io
```

---

## 4. Data Models (Prisma Example)

### User
```json
{
  "id": "uuid-123",
  "username": "player1",
  "email": "player1@email.com",
  "password": "hashed_pw",
  "createdAt": "2025-08-14T12:00:00Z"
}
```

### Game
```json
{
  "id": "game-456",
  "player1Id": "uuid-123",
  "player2Id": "uuid-789",
  "status": "active",
  "boardState": { /* board layout and ship positions */ },
  "winnerId": null,
  "createdAt": "2025-08-14T12:05:00Z"
}
```

### Move
```json
{
  "id": "move-001",
  "gameId": "game-456",
  "playerId": "uuid-123",
  "coordinate": "B5",
  "result": "hit",
  "createdAt": "2025-08-14T12:06:00Z"
}
```

---

## 5. API (Next API Routes)

| Endpoint                | Method | Description                | Auth Required | Example Request/Response |
|-------------------------|--------|----------------------------|---------------|-------------------------|
| /api/games              | GET    | List games                 | Yes           | `GET /api/games` → `[Game]` |
| /api/games              | POST   | Create new game            | Yes           | `POST /api/games {player1Id, player2Id}` → `Game` |
| /api/games/:id          | GET    | Get game by ID             | Yes           | `GET /api/games/game-456` → `Game` |
| /api/games/:id/move     | POST   | Submit a move              | Yes           | `POST /api/games/game-456/move {coordinate}` → `Move` |
| /api/users/:id/games    | GET    | List user's games          | Yes           | `GET /api/users/uuid-123/games` → `[Game]` |
| /api/auth/*             | -      | Auth routes (login, signup)| No            | `POST /api/auth/login {email, password}` → `User` |

---

## 6. Realtime — Socket Events

**Client → Server:**
- create_room `{username}`
- join_room `{roomId, username}`
- start_game `{roomId}`
- make_move `{roomId, coordinate}`
- place_ships `{roomId, ships}`

**Server → Client:**
- room_created `{roomId}`
- player_joined `{roomId, username}`
- game_started `{roomId}`
- move_result `{roomId, coordinate, result}`
- opponent_disconnected `{roomId}`
- game_over `{roomId, winnerId}`

---

## 7. Game Logic and AI

- Board
- Ships
- AI Level 1: Random
- AI Level 2: Hunt & Target

---

## 8. Testing & Deployment

- **Unit Testing:** Vitest/Jest for logic and API. Target: 80%+ coverage.
- **E2E Testing:** Playwright for UI and flows.
- **CI/CD:** Vercel for automated deployment.
- **Secrets:** Use environment variables for DB, API keys, and auth secrets.

---

## 9. Glossary

- **Move:** An action where a player targets a cell.
- **Room:** A multiplayer session.
- **Sink:** All cells of a ship have been hit.

---

## 10. Contributor Roles

- **Frontend:** UI/UX, board rendering, animations.
- **Backend:** API, DB models, socket events.
- **Testing:** Unit/E2E tests, CI setup.
- **DevOps:** Deployment, monitoring, secrets.

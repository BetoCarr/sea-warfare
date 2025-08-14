# Initial Architecture Document — Sea Warfare (Next.js)

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

---

## 4. Data Models (Prisma Example)

- **User**
- **Game**
- **Move**

---

## 5. API (Next API Routes)
/api/games
/api/games/:id
/api/games/:id/move
/api/users/:id/games
/api/auth/*


---

## 6. Realtime — Socket Events

**Client → Server:**
- create_room
- join_room
- start_game
- make_move
- place_ships

**Server → Client:**
- room_created
- player_joined
- game_started
- move_result
- opponent_disconnected
- game_over

---

## 7. Game Logic and AI

- Board
- Ships
- AI Level 1: Random
- AI Level 2: Hunt & Target

import type { GameState, GameConfig, Player, AIPlayer } from "../game-types";
import { GameStatus } from "@/lib/domain/game/models/GameStatus";
import { GamePhase } from "@/lib/domain/game/models/GamePhase"
import { createBoardState } from "@/lib/domain/board/board-sync";
import { DEFAULT_CONFIG } from "./constants";

/**
 * Strict Player ID type
 */
export type PlayerId = `player-${number}` | `ai-${number}`;

/**
 * Overload for HUMAN player
 */
export function createInitialPlayer(
    id: PlayerId,
    name: string,
    type: "human"
): Player;

/**
 * Overload for AI player
 */
export function createInitialPlayer(
    id: PlayerId,
    name: string,
    type: "ai"
): AIPlayer;

/**
 * Implementation
 */
export function createInitialPlayer(
    id: string,
    name: string,
    type: "human" | "ai"
): Player | AIPlayer {
    const basePlayer = {
        id,
        name,
        boardState: createBoardState([], []),
        ships: [],
        isReady: false
    };

    if (type === "ai") {
        return {
            ...basePlayer,
            type: "ai",
            memory: {
                lastAttacks: []
            }
        };
    }

    return {
        ...basePlayer,
        type: "human"
    }
}

/**
 * Creates the initial global game state
 * Called both on first load and when resetting the game.
 */
export function createInitialGameState(config?: Partial<GameConfig>): GameState {
    const gameConfig = { ...DEFAULT_CONFIG, ...config };
    return {
        gameId: crypto.randomUUID?.() ?? `game-${Date.now()}`,
        
        // High-level lifecycle
        phase: GamePhase.SETUP,
        status: GameStatus.IDLE,
        
        // Player entities
        player: createInitialPlayer("player-1", "Player", "human"),
        ai: createInitialPlayer("ai-1", "AI", "ai"),

        // Turn tracking
        currentTurn: 'player',
        turnNumber: 0,
        
        // History & timestamps
        moveHistory: [],
        startTime: undefined,
        endTime: undefined,
        
        // Configuration
        config: gameConfig,
        
        // UI feedback helpers
        lastAttack: undefined,
        outcome: undefined
    };
}
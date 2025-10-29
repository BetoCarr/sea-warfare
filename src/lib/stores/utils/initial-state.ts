import type { GameState, GameConfig, Player } from "../game-types";
import { GamePhase, GameStatus } from "../game-types";
import { createBoardState } from "@/lib/game-logic/board/board-sync";
import { DEFAULT_CONFIG } from "./constants";
/**
 * Creates a base player object with an empty board and no ships
 */
export function createInitialPlayer(
    id: string, 
    name: string, 
    type: 'human' | 'ai'
): Player {
    return {
        id,
        name,
        type,
        boardState: createBoardState([], []),
        ships: [],
        isReady: false
    };
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
        player: createInitialPlayer('player-1', 'Player', 'human'),
        ai: createInitialPlayer('ai-1', 'AI', 'ai'),
        
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
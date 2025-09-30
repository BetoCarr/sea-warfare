import type { BoardState } from '@/lib/game-logic/board/board-sync';
import type { AttackResult } from '@/lib/game-logic/board/board-attacks';
import type { Ship } from '@/lib/utils/types';
import type { Position } from '@/lib/utils/types';

/**
 * High-level game phases
 */
export enum GamePhase {
    SETUP = 'setup',          // Initial preparation
    PLACEMENT = 'placement',  // Player places ships
    BATTLE = 'battle',        // Active battle
    GAME_OVER = 'game_over'   // End of the game
}

/**
 * More fine-grained game statuses (optional).
 * Use this when you need transient states for UI/async flows.
 */
export type GameStatus =
    | 'idle'
    | 'placing_ships'
    | 'waiting_for_player'
    | 'player_turn'
    | 'ai_turn'
    | 'ai_thinking'
    | 'processing_attack'
    | 'resolving_attack'
    | 'ship_sunk'         
    | 'finished';

/**
 * Which side's turn it is
 */
export type GameTurn = 'player' | 'ai';

/**
 * Game result after completion
 */
export interface GameOutcome {
    winner: 'player' | 'ai';
}

/**
 * Player entity (human or AI)
 */
export interface Player {
    id: string;
    name: string;
    type: 'human' | 'ai';
    boardState: BoardState;
    ships: Ship[];
    isReady: boolean;        // Para saber si terminó de colocar barcos
}

/**
 * Entry for move history (useful for replay/debugging)
 */
export interface MoveHistoryEntry {
    turnNumber: number;
    playerId: string; 
    position: Position;
    result: 'hit' | 'miss' | 'sunk';
    timestamp: Date;
    shipSunk?: string;  // optional sunk ship identifier/name
}

/**
 * Game configuration options
 */
export interface GameConfig {
    boardSize: number;
    aiDifficulty: 'easy' | 'medium' | 'hard';
    allowShipRotation: boolean;
    showAIShips: boolean; 
}
/**
 * Global game state managed in store
 */
export interface GameState {
    gameId: string;
    
    // high-level phase
    phase: GamePhase;

    // optional finer-grained status that complements `phase`
    status: GameStatus;
    
    // players
    player: Player;
    ai: Player;
    
    // turn control
    currentTurn: 'player' | 'ai';
    turnNumber: number;
    
    // history & timestamps
    moveHistory: MoveHistoryEntry[];
    startTime?: Date;
    endTime?: Date;
    
    // configuration
    config: GameConfig;

    // last raw attack result (useful for UI feedback)
    lastAttack?: AttackResult;

    // final outcome (present when phase === GAME_OVER)
    outcome?: GameOutcome;
}
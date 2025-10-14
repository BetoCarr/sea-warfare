import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
    GameState,  
    GameConfig,
    Player,
    GameActionResult
} from './game-types';
import { GamePhase, GameStatus } from './game-types'; 
import { canStartGame, getStartGameBlockerMessage } from './game-selectors';
import type { Ship, Position, Orientation } from '../utils/types';
import { createBoardState } from '@/lib/game-logic/board/board-sync';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { placeShip } from '../game-logic/ships/ship-placement';

/**
 * Default game configuration
 */
const DEFAULT_CONFIG: GameConfig = {
    boardSize: BOARD_SIZE,
    aiDifficulty: 'easy',
    allowShipRotation: true,
    showAIShips: false
};

/**
 * Creates a base player object with an empty board and no ships
 */
function createInitialPlayer(id: string, name: string, type: 'human' | 'ai'): Player {
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
function createInitialGameState(config?: Partial<GameConfig>): GameState {
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


/**
 * Game actions interface
 * Defines all the operations the store exposes
 */
interface GameActions {
    // Lifecycle
    initializeGame: (config?: Partial<GameConfig>) => void;
    startGame: () => GameActionResult;
    resetGame: () => void;
    
    // Placement phase
    placePlayerShip: (ship: Ship) => GameActionResult;
    removePlayerShip: (shipId: string) => GameActionResult;
    confirmPlacement: () => GameActionResult;
    
    // Battle phase
    playerAttack: (position: Position) => Promise<GameActionResult>;
    aiAttack: () => Promise<GameActionResult>;
    
    // Utility
    setPhase: (phase: GamePhase) => void;
    setStatus: (status: GameStatus) => void;
}

/**
 * The complete store type (state + actions)
 */
interface GameStore extends GameState, GameActions {}

/**
 * === Main Zustand Store ===
 * Manages the full game state lifecycle using Immer for immutable updates
 * and DevTools integration for debugging.
 */
export const useGameStore = create<GameStore>()(
    devtools(
        immer((set, get) => ({
            ...createInitialGameState(),
            /**
             * Initializes the game state.
             * Rebuilds the store with fresh IDs, clean boards, and sets phase to PLACEMENT.
             */
            initializeGame: (config) => { 
                console.log('[GameStore] initializeGame called with config:', config);
                set(draft => {
                    const newState = createInitialGameState(config);

                    // Replace the entire state with a fresh instance
                    Object.assign(draft, newState);

                    // Move to placement phase
                    draft.phase = GamePhase.PLACEMENT;
                    draft.status = GameStatus.PLACING_SHIPS;

                    console.log('[GameStore] Game initialized:', {
                        id: draft.gameId,
                        phase: draft.phase,
                        status: draft.status
                    });
                });
            },
            /**
             * Attempts to start the game.
             * Uses selectors to validate preconditions before moving into BATTLE phase.
             */
            startGame: () : GameActionResult => { 
                console.log('[GameStore] startGame called');

                const state = get();
                
                // --- Validation layer (delegated to selectors) ---
                const blocker = getStartGameBlockerMessage(state);
                if (blocker) {
                    console.warn('[GameStore] ⚠️', blocker);
                    return {
                        success: false,
                        message: blocker,
                        error: 'CANNOT_START'
                    };
                }
                // --- Transition into battle phase ---
                set(draft => {
                    draft.phase = GamePhase.BATTLE;
                    draft.status = GameStatus.WAITING_FOR_PLAYER;
                    draft.currentTurn = 'player';
                    draft.turnNumber = 1;
                    draft.startTime = new Date();
                    
                    console.log('[GameStore] ✅ Game started successfully', {
                        phase: draft.phase,
                        status: draft.status,
                        playerShips: draft.player.ships.length,
                        aiShips: draft.ai.ships.length
                    });
                });
                return {
                    success: true,
                    message: 'Game started! Your turn.',
                    data: {
                        phase: GamePhase.BATTLE,
                        turn: 'player'
                    }
                };
            },
            /**
             * Resets the entire game but preserves the existing configuration.
             * Useful for "Play Again" without losing settings.
             */
            resetGame: () => { 
                console.log('[GameStore] resetGame called');

                const currentState = get();
                const newState = createInitialGameState(currentState.config);
                
                set(draft => {
                    Object.assign(draft, newState);
                    
                    console.log('[GameStore] ✅ Game reset complete', {
                        gameId: draft.gameId,
                        phase: draft.phase,
                        preservedConfig: draft.config
                    });
                });
            },
            placePlayerShip: (ship) => { /* lógica aquí */ return { success: false }; },
            removePlayerShip: (shipId) => { /* lógica aquí */ return { success: false }; },
            confirmPlacement: () => { return { success: false }; },
            playerAttack: async (position) => { return { success: false }; },
            aiAttack: async () => { return { success: false }; },
            setPhase: (phase) => set(draft => { draft.phase = phase; }),
            setStatus: (status) => set(draft => { draft.status = status; }),
        })),
        { name: 'SeaWarfareGameStore' }
    )
);
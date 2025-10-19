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
import { generateAIShips } from '../game-logic/ships/ai-ship-generator';
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

    // Internal helpers (no exportar para uso directo en componentes)
    _initializeAI: () => void;
    _transitionToNextTurn: () => void;
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
                setTimeout(() => {
                    console.log('[GameStore] 🤖 Scheduling AI initialization');
                    get()._initializeAI();
                }, 100);
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
            /**
            * Places a player ship on the board during the PLACEMENT phase.
            * Validates the game phase and player state.
            * Ensures the ship is not already placed.
            * Uses the core placeShip() helper to verify placement rules.
            * Updates the board state and marks player as ready when all ships are placed.
            */
            placePlayerShip: (ship) => {
                const state = get();

                // ---  Validate current phase ---
                if (state.phase !== GamePhase.PLACEMENT) {
                    return {
                        success: false,
                        message: 'You can only place ships during the placement phase.',
                        error: 'INVALID_PHASE'
                    };
                }

                // --- Validate player existence ---
                const player = state.player;
                if (!player) {
                    return { success: false, message: 'Player not initialized', error: 'NO_PLAYER' };
                }

                // ---  Prevent duplicates ---
                const alreadyPlaced = player.ships.some(s => s.id === ship.id);
                if (alreadyPlaced) {
                    return {
                        success: false,
                        message: `${ship.type} already placed.`,
                        error: 'DUPLICATE_SHIP'
                    };
                }
                try {
                    // ---  Attempt placement ---
                    const placedShip = placeShip(
                        ship,
                        ship.position!,
                        ship.orientation!,
                        state.config.boardSize,
                        player.ships
                    );
                    
                    // ---  Update player state ---
                    // Adds the new ship to the player's collection and rebuilds their board state.
                    set((draft) => {
                        draft.player.ships.push(placedShip);
                        draft.player.boardState = createBoardState(draft.player.ships, []);
                        // If the player has placed all ships, mark them as ready.
                        if (draft.player.ships.length >= 5) {
                            draft.player.isReady = true;
                            console.log('[GameStore] ✅ Player is ready with all ships placed');
                        }
                        console.log(`[GameStore] ✅ ${placedShip.type} placed at (${placedShip.position?.row}, ${placedShip.position?.col}) [${placedShip.orientation}]`);
                    });
                    return {
                        success: true,
                        message: `${placedShip.type} placed successfully.`,
                        data: { ship: placedShip }
                    };
                // ---  Handle placement error ---
                } catch (error: any) {
                    console.warn('[GameStore] ❌ Failed to place ship:', error.message);
                    return {
                        success: false,
                        message: error.message || 'Invalid ship placement.',
                        error: 'INVALID_PLACEMENT'
                    };
                }
            },
            removePlayerShip: (shipId) => { /* lógica aquí */ return { success: false }; },
            confirmPlacement: () => { return { success: false }; },
            playerAttack: async (position) => { return { success: false }; },
            aiAttack: async () => { return { success: false }; },
            setPhase: (phase) => set(draft => { draft.phase = phase; }),
            setStatus: (status) => set(draft => { draft.status = status; }),







            /**
             * INTERNAL: Initializes AI with randomly placed ships
             * Called automatically by initializeGame()
             */
            _initializeAI: () => {
                console.log('[GameStore] 🤖 _initializeAI called');
                
                set(draft => {
                    const aiShips = generateAIShips(draft.config.boardSize);
                    
                    draft.ai.ships = aiShips;
                    draft.ai.boardState = createBoardState(aiShips, []);
                    draft.ai.isReady = aiShips.length > 0;
                    
                    console.log('[GameStore] ✅ AI initialized:', {
                        shipCount: aiShips.length,
                        isReady: draft.ai.isReady
                    });
                });
            },
            /**
             * INTERNAL: Transitions to the next player's turn
             * Handles status updates and potential AI trigger
             */
            _transitionToNextTurn: () => {
                console.log('[GameStore] 🔄 _transitionToNextTurn called');
                
                const state = get();
                const nextTurn = state.currentTurn === 'player' ? 'ai' : 'player';
                
                set(draft => {
                    draft.currentTurn = nextTurn;
                    draft.status = nextTurn === 'player' 
                        ? GameStatus.WAITING_FOR_PLAYER 
                        : GameStatus.AI_THINKING;
                    
                    console.log('[GameStore] ✅ Turn transitioned:', {
                        from: state.currentTurn,
                        to: nextTurn,
                        status: draft.status
                    });
                });
                
                if (nextTurn === 'ai') {
                    setTimeout(() => {
                        console.log('[GameStore] 🎯 Triggering AI attack');
                        get().aiAttack();
                    }, 1000);
                }
            }
        })),
        { name: 'SeaWarfareGameStore' }
    )
);
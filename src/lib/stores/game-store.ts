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
import { generateAIShips } from '../game-logic/ai/ai-ship-generator';
import { createBoardState } from '@/lib/game-logic/board/board-sync';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { placeShip, removeShipFromBoard } from '../game-logic/ships/ship-placement';
import { processAttack } from '../game-logic/board/board-attacks';
import { chooseAIAttackPosition } from '../game-logic/ai/ai-attack';

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
            /**
             * Removes a previously placed ship from the player's board.
             * - Only available during the PLACEMENT phase
             * - Updates the board state after removal
             * - Marks the player as "not ready" if fewer than 5 ships remain
             */
            removePlayerShip: (shipId) => {
                console.log('[GameStore] 🗑️ removePlayerShip called with:', shipId);

                const state = get();

                // Validate current phase
                if (state.phase !== GamePhase.PLACEMENT) {
                    return {
                        success: false,
                        message: 'You can only remove ships during the placement phase.',
                        error: 'INVALID_PHASE'
                    };
                }

                // Validate player
                const player = state.player;
                if (!player) {
                    return {
                        success: false,
                        message: 'Player not initialized.',
                        error: 'NO_PLAYER'
                    };
                }

                // Find the target ship to remove
                const targetShip = player.ships.find(s => s.id === shipId);
                if (!targetShip) {
                    console.warn('[GameStore] ⚠️ Ship not found:', shipId);
                    return {
                        success: false,
                        message: 'Ship not found on board.',
                        error: 'SHIP_NOT_FOUND'
                    };
                }

                // Clear ship position (optional, for consistency)
                const clearedShip = removeShipFromBoard(targetShip);

                // Update global state
                set((draft) => {
                    draft.player.ships = draft.player.ships.filter(s => s.id !== shipId);
                    draft.player.boardState = createBoardState(draft.player.ships, []);
                    draft.player.isReady = draft.player.ships.length >= 5;

                    console.log('[GameStore] 🚮 Ship removed successfully:', {
                        removedShip: clearedShip.type,
                        remainingShips: draft.player.ships.length,
                        isReady: draft.player.isReady
                    });
                });

                return {
                    success: true,
                    message: `Ship ${targetShip.type} removed successfully.`,
                    data: { shipId }
                };
            },
            /**
             * Confirms the player's ship placement phase.
             * - Validates that all ships have been placed correctly
             * - Marks the player as ready
             * - If AI is also ready, transitions to the BATTLE phase automatically
             */
            confirmPlacement: () => {
                console.log('[GameStore] ⚓ confirmPlacement called');

                const state = get();

                // --- Validate phase ---
                if (state.phase !== GamePhase.PLACEMENT) {
                    return {
                        success: false,
                        message: 'You can only confirm placement during the placement phase.',
                        error: 'INVALID_PHASE'
                    };
                }

                // --- Validate player existence ---
                const player = state.player;
                if (!player) {
                    return {
                        success: false,
                        message: 'Player not initialized.',
                        error: 'NO_PLAYER'
                    };
                }

                // --- Validate ship count ---
                if (player.ships.length < 5) {
                    console.warn('[GameStore] ⚠️ Not all ships placed:', player.ships.length);
                    return {
                        success: false,
                        message: 'You must place all ships before confirming.',
                        error: 'INCOMPLETE_PLACEMENT'
                    };
                }

                // --- Validate individual ship integrity ---
                const invalidShips = player.ships.filter(s => !s.position || !s.orientation);
                if (invalidShips.length > 0) {
                    console.warn('[GameStore] ⚠️ Found ships with missing position/orientation:', invalidShips);
                    return {
                        success: false,
                        message: 'Some ships are not fully placed on the board.',
                        error: 'INVALID_SHIP_DATA'
                    };
                }

                // --- Update player readiness ---
                set(draft => {
                    draft.player.isReady = true;
                    draft.player.boardState = createBoardState(draft.player.ships, []);

                    console.log('[GameStore] ✅ Player placement confirmed:', {
                        totalShips: draft.player.ships.length,
                        isReady: draft.player.isReady
                    });

                    // --- Transition to battle phase if AI is ready ---
                    if (draft.ai.isReady) {
                        draft.phase = GamePhase.BATTLE;
                        draft.status = GameStatus.WAITING_FOR_PLAYER;
                        draft.currentTurn = 'player';
                        draft.turnNumber = 1;
                        draft.startTime = new Date();

                        console.log('[GameStore] 🚀 Both players ready — battle phase started!');
                    } else {
                        console.log('[GameStore] ⏳ Waiting for AI initialization...');
                    }
                });

                return {
                    success: true,
                    message: state.ai.isReady
                        ? 'Placement confirmed! The battle begins.'
                        : 'Placement confirmed. Waiting for AI setup...',
                    data: {
                        playerReady: true,
                        aiReady: state.ai.isReady,
                        phase: state.ai.isReady ? GamePhase.BATTLE : GamePhase.PLACEMENT
                    }
                };
            },
            playerAttack: async (position) => { 
                console.log('[GameStore] 🎯 playerAttack called:', position);
                const state = get();

                // --- Validate phase and turn ---
                if (state.phase !== GamePhase.BATTLE) {
                    return {
                        success: false,
                        message: 'You can only attack during the battle phase.',
                        error: 'INVALID_PHASE'
                    };
                }

                if (state.currentTurn !== 'player') {
                    return {
                        success: false,
                        message: 'It is not your turn.',
                        error: 'INVALID_TURN'
                    };
                }

                // --- Process attack using helpers ---
                const { boardState, attackResult, isGameOver, winner } = processAttack(
                    state.ai.boardState,
                    position
                );
                
                // --- Update global state ---
                set(draft => {
                    // Update AI board state
                    draft.ai.boardState = boardState;
                    // Record move history if valid
                    draft.lastAttack = {
                        by: 'player',
                        ...attackResult
                    };
                    // Log the attack in move history
                    if (attackResult.type !== 'invalid') {
                        draft.moveHistory.push({
                            turnNumber: state.turnNumber,
                            playerId: state.player.id,
                            position,
                            result: attackResult.type,
                            timestamp: new Date(),
                            shipSunk: attackResult.type === 'sunk'
                                ? attackResult.impactedShip?.type
                                : undefined
                        });
                    }
                    // Update status based on attack result
                    switch (attackResult.type) {
                        case 'hit':
                            draft.status = GameStatus.RESOLVING_ATTACK;
                            console.log(`[GameStore] 💥 [Turn ${state.turnNumber}] Player hit AI ship: ${attackResult.impactedShip?.type} at (${position.row}, ${position.col})`);
                            break;
                        case 'sunk':
                            draft.status = GameStatus.SHIP_SUNK;
                            console.log('[GameStore] 🚢 AI ship sunk:', attackResult.impactedShip?.type);
                            break;
                        case 'miss':
                            draft.status = GameStatus.AI_TURN;
                            console.log('[GameStore] 💨 Player missed.');
                            break;
                        case 'invalid':
                            draft.status = GameStatus.IDLE;
                            console.warn('[GameStore] ⚠️ Invalid attack:', attackResult.error);
                            break;
                    }
                    // Check for game over
                    if (isGameOver) {
                        draft.status = GameStatus.FINISHED;
                        draft.outcome = { winner: 'player' };
                        draft.endTime = new Date();
                        console.log('[GameStore] 🏆 Player has destroyed all AI ships!');
                    }
                });
                // --- Trasition to next turn if game continues ---
                if (!isGameOver && attackResult.type !== 'invalid') {
                    setTimeout(() => get()._transitionToNextTurn(), 800);
                }
                // --- Return action result ---
                return {
                    success: attackResult.type !== 'invalid',
                    message: attackResult.error
                        ? attackResult.error
                        : attackResult.type === 'hit'
                            ? 'Hit!'
                            : attackResult.type === 'sunk'
                                ? 'You sunk an AI ship!'
                                : 'Miss!',
                    data: attackResult
                };
            },
            
            // inside game-store.ts (aiAttack action)
            /**
             * 🤖 Handles the AI's attack turn.
             *
             * - Selects a random valid position using `chooseAIAttackPosition`
             * - Executes the attack via `processAttack`
             * - Updates the player's board state, move history, and `lastAttack`
             * - Handles possible outcomes (hit, miss, sunk, invalid)
             * - Returns a standardized `GameActionResult` for consistency with `playerAttack`
             */
            aiAttack: async () => {
                console.log('[GameStore] 🤖 aiAttack called');
                const state = get();
                const boardSize = state.config.boardSize; 
                const pos = chooseAIAttackPosition(state.player.boardState, boardSize);

                // processAttack expects BoardState etc. — reuse your board-attacks helpers
                const result = processAttack(state.player.boardState, pos);

                set(draft => {
                    draft.player.boardState = result.boardState;
                    // update moveHistory, lastAttack, status, etc. as you did in playerAttack
                    draft.moveHistory.push({
                        turnNumber: draft.turnNumber,
                        playerId: draft.ai.id,
                        position: pos,
                        result: result.attackResult.type,
                        timestamp: new Date(),
                        shipSunk: result.attackResult.type === 'sunk' ? result.attackResult.impactedShip?.type : undefined
                    });

                    draft.lastAttack = { ...result.attackResult, by: 'ai' }; // if LastAttack type matches
                    // handle status/turn/outcome same as playerAttack...
                });

                return {
                    success: result.attackResult.type !== 'invalid',
                    message: result.attackResult.type === 'hit' ? 'AI hit!' : result.attackResult.type === 'sunk' ? 'AI sunk a ship!' : result.attackResult.type === 'miss' ? 'AI missed.' : result.attackResult.error,
                    data: result
                };
            },
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
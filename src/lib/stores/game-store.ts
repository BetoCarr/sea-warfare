import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
    GameState,  
    GameConfig,
    Player,
    GameActionResult
} from './game-types';
import { GamePhase, GameStatus } from './game-types'; // Usaremos solo los enums


import type { Ship, Position, Orientation } from '../utils/types';
import { createBoardState } from '@/lib/game-logic/board/board-sync';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { placeShip } from '../game-logic/ships/ship-placement';

/**
 * Configuración por defecto del juego
 */
const DEFAULT_CONFIG: GameConfig = {
    boardSize: BOARD_SIZE,
    aiDifficulty: 'easy',
    allowShipRotation: true,
    showAIShips: false
};

/**
 * Crea un jugador inicial vacío
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
 * Estado inicial del juego
 */

function createInitialGameState(config?: Partial<GameConfig>): GameState {
    const gameConfig = { ...DEFAULT_CONFIG, ...config };
    
    return {
        gameId: crypto.randomUUID?.() ?? `game-${Date.now()}`,
        
        // Fases y estado
        phase: GamePhase.SETUP,
        status: GameStatus.IDLE,
        
        // Jugadores
        player: createInitialPlayer('player-1', 'Player', 'human'),
        ai: createInitialPlayer('ai-1', 'AI', 'ai'),
        
        // Control de turnos
        currentTurn: 'player',
        turnNumber: 0,
        
        // Historial
        moveHistory: [],
        startTime: undefined,
        endTime: undefined,
        
        // Configuración
        config: gameConfig,
        
        // Estado de último ataque (útil para UI feedback)
        lastAttack: undefined,
        
        // Resultado final
        outcome: undefined
    };
}


/**
 * Acciones del Game Store
 */
interface GameActions {
  // Ciclo de vida del juego
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
    
    // Utilidades
    setPhase: (phase: GamePhase) => void;
    setStatus: (status: GameStatus) => void;
}

/**
 * Game Store completo (Estado + Acciones)
 */
interface GameStore extends GameState, GameActions {}

export const useGameStore = create<GameStore>()(
    devtools(
        immer((set, get) => ({
            ...createInitialGameState(),

            initializeGame: (config) => { 
                console.log('[GameStore] initializeGame called with config:', config);
                set(draft => {
                    const newState = createInitialGameState(config);

                    // Sobrescribimos todo el estado con el nuevo
                    Object.assign(draft, newState);

                    // Cambiamos fase y estado
                    draft.phase = GamePhase.PLACEMENT;
                    draft.status = GameStatus.PLACING_SHIPS;

                    // Log de depuración
                    console.log('[GameStore] Game initialized:', {
                        id: draft.gameId,
                        phase: draft.phase,
                        status: draft.status
                    });
                });
            },
            startGame: () : GameActionResult => { 
                console.log('[GameStore] startGame called');

                const state = get();
                
                // ===== VALIDACIONES =====
                
                // 1. Validar fase actual
                if (state.phase !== GamePhase.PLACEMENT) {
                    const error = `Cannot start game from ${state.phase} phase`;
                    console.warn('[GameStore] ⚠️', error);
                    return {
                        success: false,
                        message: 'Game can only be started from placement phase',
                        error: 'INVALID_PHASE'
                    };
                }
                
                // 2. Validar que el jugador esté listo
                if (!state.player.isReady) {
                    const error = 'Player is not ready. Place all ships first.';
                    console.warn('[GameStore] ⚠️', error);
                    return {
                        success: false,
                        message: error,
                        error: 'PLAYER_NOT_READY'
                    };
                }
                
                // 3. Validar que la IA esté lista
                if (!state.ai.isReady) {
                    const error = 'AI is not ready. Wait for AI initialization.';
                    console.warn('[GameStore] ⚠️', error);
                    return {
                        success: false,
                        message: error,
                        error: 'AI_NOT_READY'
                    };
                }
                
                // 4. Validar que ambos tengan barcos
                if (state.player.ships.length === 0) {
                    const error = 'Player has no ships placed';
                    console.warn('[GameStore] ⚠️', error);
                    return {
                        success: false,
                        message: 'Place your ships before starting',
                        error: 'NO_SHIPS_PLACED'
                    };
                }

                set(draft => {
                    // Cambiar fase
                    draft.phase = GamePhase.BATTLE;
                    draft.status = GameStatus.WAITING_FOR_PLAYER;
                    
                    // Inicializar turno
                    draft.currentTurn = 'player';
                    draft.turnNumber = 1;
                    
                    // Timestamp de inicio
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
            resetGame: () => { 
                console.log('[GameStore] resetGame called');
                // Obtenemos la configuración actual del store
                const currentState = get();
                // Creamos un nuevo estado limpio, pero conservando la configuración actual
                const newState = createInitialGameState(currentState.config);
                // Actualizar estado
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
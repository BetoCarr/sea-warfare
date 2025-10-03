import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameState, Player, GameConfig, GameActionResult } from './game-types';
import type { Ship, Position, Orientation } from '../utils/types';
import { GamePhase, GameStatus } from './game-types';
import { createBoardState } from '@/lib/game-logic/board/board-sync';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { placeShip } from '../game-logic/ships/ship-placement';
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
 * Configuración por defecto del juego
 */
const DEFAULT_CONFIG: GameConfig = {
    boardSize: BOARD_SIZE,
    aiDifficulty: 'easy',
    allowShipRotation: true,
    showAIShips: false
};

/**
 * Estado inicial del juego
 */
function getInitialState(config?: Partial<GameConfig>): GameState {
    return {
        gameId: crypto.randomUUID?.() ?? `game-${Date.now()}`,
        phase: GamePhase.SETUP,
        status: GameStatus.IDLE,
        player: createInitialPlayer('player-1', 'Player', 'human'),
        ai: createInitialPlayer('ai-1', 'AI', 'ai'),
        currentTurn: 'player',
        turnNumber: 0,
        moveHistory: [],
        config: {
            ...DEFAULT_CONFIG,
            ...config,
        },
    };
}

/**
 * Acciones del Game Store
 */
interface GameActions {
  // Ciclo de vida del juego
    initializeGame: (config?: Partial<GameConfig>) => void;
    startGame: () => void;
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

/**
 * Store básico con estado inicial + acciones vacías
 */
export const useGameStore = create<GameStore>()(
    devtools((set, get) => ({
        ...getInitialState(),

        // Ciclo de vida del juego
        initializeGame: (config) => {
            console.log('initializeGame called', config);
        },
        startGame: () => {
            console.log('startGame called');
        },
        resetGame: () => {
            console.log('resetGame called');
        },

        // Placement phase
        placePlayerShip: (ship) => {
            console.log('placePlayerShip called', ship);
            return { success: false, message: 'Not implemented yet' };
        },
        removePlayerShip: (shipId) => {
            console.log('removePlayerShip called', shipId);
            return { success: false, message: 'Not implemented yet' };
        },
        confirmPlacement: () => {
            console.log('confirmPlacement called');
            return { success: false, message: 'Not implemented yet' };
        },

        // Battle phase
        playerAttack: async (position: Position) => {
            console.log('playerAttack called', position);
            return { success: false, message: 'Not implemented yet' };
        },
        aiAttack: async () => {
            console.log('aiAttack called');
            return { success: false, message: 'Not implemented yet' };
        },

        // Utilidades
        setPhase: (phase: GamePhase) => {
            set({ phase });
        },
        setStatus: (status: GameStatus) => {
            set({ status });
        },
    }))
);



























// export function consolear(): void {
//     const ship: Ship = {
//         id: 'ship-1',
//         type: 'destroyer',
//         size: 2,
//         orientation: 'horizontal',
//         hits: [false, false],
//         isSunk: false,
//     };

//     const invalidPosition: Position = { row: 10, col: 0 };
//     const orientation: Orientation = 'horizontal';

//     let result: GameActionResult<Ship>;

//     try {
//         const placedShip = placeShip(ship, invalidPosition, orientation, 10, []);
//         result = {
//             success: true,
//             data: placedShip,
//             message: 'Ship placed successfully',
//         };
//     } catch (err: any) {
//         result = {
//             success: false,
//             error: err.message || 'Unknown error',
//         };
//     }

//     console.log(result);
// }


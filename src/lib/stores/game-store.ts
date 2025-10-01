import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Position } from '../utils/types';
import type { GameState, GameConfig } from './game-types';
import { GamePhase } from './game-types';
import { createBoardState } from '../game-logic/board/board-sync';
import { createFleet } from '../game-logic/ships/ship-factory';

/**
 * Extend GameState with store actions
 */
type GameStore = GameState & {
    initializeGame: (config?: Partial<GameConfig>) => void;
    resetGame: () => void;
    // Más acciones se irán agregando (attack, aiPlay, etc.)
};

export const useGameStore = create<GameStore>()(
    devtools(
        immer((set, get) => ({
            // Estado inicial mínimo
            gameId: crypto.randomUUID?.() ?? 'game-1',
            phase: GamePhase.SETUP,
            status: 'idle',
            player: {
                id: 'player',
                name: 'You',
                type: 'human',
                boardState: createBoardState([], []),
                ships: [],
                isReady: false,
            },
            ai: {
                id: 'ai',
                name: 'Computer',
                type: 'ai',
                boardState: createBoardState([], []),
                ships: [],
                isReady: false,
            },
            currentTurn: 'player',
            turnNumber: 0,
            moveHistory: [],
            config: {
                boardSize: 10,
                aiDifficulty: 'easy',
                allowShipRotation: true,
                showAIShips: false,
            },

            // --- acciones ---

            initializeGame: (config) => {
                set((draft) => {
                    draft.config = { ...draft.config, ...config };
                    draft.phase = GamePhase.PLACEMENT;
                    draft.status = 'placing_ships';
                    draft.turnNumber = 0;
                    draft.moveHistory = [];

                    // crear flotas
                    const playerShips = createFleet();
                    const aiShips = createFleet();

                    draft.player = {
                        id: 'player',
                        name: 'You',
                        type: 'human',
                        boardState: createBoardState(playerShips, []),
                        ships: playerShips,
                        isReady: false,
                    };

                    draft.ai = {
                        id: 'ai',
                        name: 'Computer',
                        type: 'ai',
                        boardState: createBoardState(aiShips, []),
                        ships: aiShips,
                        isReady: true,
                    };
                });
            },

            resetGame: () => {
                get().initializeGame({});
            },
        }))
    )
);
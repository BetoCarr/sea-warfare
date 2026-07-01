import { create } from 'zustand';

import type { GameplayState } from './gameplay-store.types';
import type { GameplayActions } from './gameplay-store.actions';
import { initialGameplayState } from './gameplay-store.initial';
import { initializeGame as initializeGameDomain } from '@/lib/domain/game/mutations/initializeGame';
import { confirmFleet as confirmFleetDomain} from '@/lib/domain/game/mutations/confirmFleet';
export type GameplayStore =
    GameplayState &
    GameplayActions;

export const useGameplayStore =
    create<GameplayStore>((set) => ({
        ...initialGameplayState,

        setGame: (game) =>
            set({ game }),

        setPlayerPlacements: (placements) =>
            set({
                playerPlacements: placements,
            }),

        setEnemyPlacements: (placements) =>
            set({
                enemyPlacements: placements,
            }),

        resetGameplay: () =>
            set(initialGameplayState),

        initializeGame: () => // Documentar
            set((state) => ({
                game: initializeGameDomain({
                    game: state.game,
                }),
            })),

        confirmFleet: () => // Documentar
            set((state) => ({
                game: confirmFleetDomain({
                    game: state.game,
                }),
            })),
    }));
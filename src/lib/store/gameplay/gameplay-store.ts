import { create } from 'zustand';



import { initialGameplayState } from './gameplay-store.initial';

import { confirmFleet as confirmFleetDomain} from '@/lib/domain/game/mutations/confirmFleet';

import { initializeGame as initializeGameDomain } from '@/lib/domain/game/mutations/initializeGame';



import type { GameplayActions } from './gameplay-store.actions';

import type { GameplayState } from './gameplay-store.types';

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

        initializeGame: () =>
            set((state) => ({
                game: initializeGameDomain({
                    game: state.game,
                }),
            })),

        confirmFleet: () =>
            set((state) => ({
                game: confirmFleetDomain({
                    game: state.game,
                }),
            })),
    }));
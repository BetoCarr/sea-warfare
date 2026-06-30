import { create } from 'zustand';

import type { GameplayState } from './gameplay-store.types';
import type { GameplayActions } from './gameplay-store.actions';

import { initialGameplayState } from './gameplay-store.initial';

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
    }));
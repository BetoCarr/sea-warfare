import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createInitialGameState } from './utils/initial-state';
import { createUtilitySlice } from './slices/utility-slice';
import { createLifecycleSlice } from './slices/lifecycle-slice';
import { createPlacementSlice } from './slices/placement-slice';
import { createBattleSlice } from './slices/battle-slice';
import { createTurnSlice } from "./slices/turn-slice";
import { createAISlice } from './slices/ai-slice';
import type { CompleteGameStore } from './store-types';

/**
 * Store: TemporaryGameStore
 * ----------------------------------------------------------
 * Experimental modular store used to test and validate the
 * integration of multiple Zustand slices before merging into
 * the main `game-store.ts`.
 * 
 * Combines slices that handle specific functional areas of
 * the game (utility actions, lifecycle flow, etc.) while
 * maintaining middleware support for immer and devtools.
 * 
 * The goal is to ensure type safety, state consistency,
 * and minimal coupling between slices.
 */

export const useTemporaryGameStore = create<CompleteGameStore>()(
    devtools(
        immer((...args) => ({
            // --- Slice composition -----------------------------------------
            ...createInitialGameState(),
            
             // Slices
            ...createUtilitySlice(...args),
            ...createLifecycleSlice(...args),
            ...createPlacementSlice(...args),
            ...createBattleSlice(...args),
            ...createTurnSlice(...args),
            ...createAISlice(...args),
        })),
        { 
            name: 'TemporaryGameStore',
            enabled: process.env.NODE_ENV === 'development'
        }
    )
);

/**
 * Returns the current snapshot of the temporary store
 * without requiring a React component subscription.
 * 
 * Useful for unit testing or debugging outside of React context.
 */
export const getTempGameState = () => useTemporaryGameStore.getState();

/**
 * Subscribes to store updates for external observers or test utilities.
 * Returns the unsubscribe function provided by Zustand.
 */
export const subscribeToTempStore = useTemporaryGameStore.subscribe;

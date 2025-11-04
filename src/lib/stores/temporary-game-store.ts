import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GameState } from './game-types';
import { createUtilitySlice, type UtilitySlice } from './slices/utility-slice';
import { createInitialGameState } from './utils/initial-state';
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

/**
 * Combined type representing the temporary store.
 * Includes all slices currently under evaluation.
 */
export type TemporaryGameStore = GameState & UtilitySlice;

/**
 * Temporary store implementation
 * ----------------------------------------------------------
 * Combines multiple slices into a single Zustand store.
 * Wrapped with `immer` for immutable state handling and
 * `devtools` for enhanced debugging support.
 */
export const useTemporaryGameStore = create<TemporaryGameStore>()(
    devtools(
        immer((...args) => ({
            // --- Slice composition -----------------------------------------
            ...createInitialGameState(),
            ...createUtilitySlice(...args),
            
            // --- Future slices ---------------------------------------------
            // Additional slices will be added incrementally:
            // ...createLifecycleSlice(...args),
            // ...createPlacementSlice(...args),
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

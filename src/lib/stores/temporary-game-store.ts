import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { GameState } from './game-types';
import { createUtilitySlice, type UtilitySlice } from './slices/utility-slice';
import { createInitialGameState } from './utils/initial-state';

// Tipo del store modular (iremos ampliándolo)
export type TemporaryGameStore = GameState & UtilitySlice;

/**
 * Temporary Game Store
 * Para testing de modularización
 */
export const useTemporaryGameStore = create<TemporaryGameStore>()(
    devtools(
        immer((...args) => ({
            // ✅ CAMBIO: Usar createInitialGameState para tener TODO el estado
            ...createInitialGameState(),
            
            // ✅ CAMBIO: Pasar los args correctamente a los slices
            ...createUtilitySlice(...args),
            
            // ⚠️ Iremos agregando más slices aquí después
            // ...createLifecycleSlice(...args),
            // ...createPlacementSlice(...args),
        })),
        { 
            name: 'TemporaryGameStore',
            enabled: process.env.NODE_ENV === 'development'
        }
    )
);

// ============================================
// HELPERS PARA TESTING
// ============================================

/**
 * Get current state without subscribing
 */
export const getTempGameState = () => useTemporaryGameStore.getState();

/**
 * Subscribe to store changes
 */
export const subscribeToTempStore = useTemporaryGameStore.subscribe;

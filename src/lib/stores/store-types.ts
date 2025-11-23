import type { GameState } from "./game-types";
import type { UtilitySlice } from "./slices/utility-slice";
import type { LifecycleSlice } from "./slices/lifecycle-slice";
import type { PlacementSlice } from "./slices/placement-slice";

/**
 * Complete Game Store type
 * ----------------------------------------------------------
 * Combines the base GameState with all current feature slices.
 *
 * This type represents the full shape of the Zustand store,
 * including both state and actions from every slice.
 *
 * IMPORTANT:
 * Always update this type when a new slice is added to the store.
 * This ensures proper type inference when using the store
 * and prevents mismatches between slices and the global state.
 */
export type CompleteGameStore = GameState & 
    UtilitySlice & 
    LifecycleSlice & 
    PlacementSlice;

/**
 * Store middlewares
 * ----------------------------------------------------------
 * Centralized definition of the middlewares used by the store.
 *
 * Keeping these in a single place ensures consistency across
 * all StateCreator definitions and avoids type conflicts
 * when adding or reorganizing slices.
 *
 * Currently used:
 * - zustand/immer      → Allows mutable-like updates in slices
 * - zustand/devtools   → Enables inspection with Redux DevTools
 */
export type GameStoreMiddlewares = [
    ["zustand/immer", never],
    ["zustand/devtools", never]
];

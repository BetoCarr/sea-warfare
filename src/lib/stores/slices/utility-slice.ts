import type { StateCreator } from 'zustand';
import { GameState, GamePhase, GameStatus } from '../game-types';

export interface UtilitySlice {
    setPhase: (phase: GamePhase) => void;
    setStatus: (status: GameStatus) => void;
}

export const createUtilitySlice: StateCreator<
    GameState & UtilitySlice,  // ← CAMBIO: Tipo completo del store
    [["zustand/immer", never], ["zustand/devtools", never]],  // ← CAMBIO: Middlewares
    [],
    UtilitySlice
> = (set) => ({
    setPhase: (phase) => {
        console.log(`[GameStore] 🔄 setPhase → ${phase}`);
        set((state) => {
            (state as any).phase = phase;
        });
    },
    setStatus: (status) => {
        console.log(`[GameStore] 🔄 setStatus → ${status}`);
        set((state) => {
            (state as any).status = status;
        });
    },
});

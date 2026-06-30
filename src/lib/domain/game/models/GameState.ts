import type { GamePhase } from "./GamePhase";
import type { GameStatus } from "./GameStatus";

export type GameState = {
    phase: GamePhase;
    status?: GameStatus;
};
import { ShipPlacement } from '../domain/placement/models/ShipPlacement';



import type { GameState } from '../domain/game/models/GameState';

export type GameplayActions = {
    setGame: (game: GameState) => void;

    setPlayerPlacements: (
        placements: ShipPlacement[]
    ) => void;

    setEnemyPlacements: (
        placements: ShipPlacement[]
    ) => void;

    resetGameplay: () => void;

    initializeGame(): void;

    confirmFleet(): void;
};

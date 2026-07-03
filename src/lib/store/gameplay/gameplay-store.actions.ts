import type { GameState } from '../../domain/game/models/GameState';
import { ShipPlacement } from '../../domain/placement/models/ShipPlacement';

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

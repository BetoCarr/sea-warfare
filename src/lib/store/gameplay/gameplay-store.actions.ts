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
};

// import { GamePhase, GameStatus } from '../../domain/game/game-types';
// import { ShipPlacement } from '../../domain/placement/models/ShipPlacement';

// export type GameplayActions = {
//     setPhase: (phase: GamePhase) => void;

//     setStatus: (status: GameStatus) => void;

//     setPlayerPlacements: (
//         placements: ShipPlacement[]
//     ) => void;

//     setEnemyPlacements: (
//         placements: ShipPlacement[]
//     ) => void;

//     resetGameplay: () => void;
// };
import { GamePhase } from '../models/GamePhase';
import { GameStatus } from '../models/GameStatus';

import { isFleetComplete } from '../rules/isFleetComplete';

import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

import type { GameState } from '../models/GameState';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

type ConfirmFleetParams = {
    game: GameState;
    placements: ShipPlacement[];
    requiredFleet?: BaseShip[];
};

export function confirmFleet({
    game,
    placements,
    requiredFleet = STANDARD_FLEET,
}: ConfirmFleetParams): GameState {
    if (!isFleetComplete({ placements, requiredFleet })) {
        return game;
    }

    return {
        ...game,
        phase: GamePhase.BATTLE,
        status: GameStatus.PLAYER_TURN,
    };
}

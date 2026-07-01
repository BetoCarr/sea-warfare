import { GameState } from '@/lib/domain/game/models/GameState';
import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus'

import { GamePresentation } from './game-flow-types';


export function derivePresentation(
    game: GameState,
): GamePresentation {

    const { phase, status } = game;

    /**
     * SETUP
     */
    if (
        phase === GamePhase.SETUP  // GAME
    ) {
        return {
            message: 'Initialize combat protocols...',
            phaseLabel: 'BOOT',
        };
    }

    //  NO PERTENECE A GAMEFLOW
    if (phase === GamePhase.PLACEMENT) {
        return {
            message: 'Distribute your fleet across the sector',
            phaseLabel: 'DEPLOY',
        };
    }

    //  NO PERTENECE A GAMEFLOW
    if (
        phase === GamePhase.BATTLE &&
        status === GameStatus.PLAYER_TURN
    ) {
        return {
            message: 'Targeting systems active. Select coordinates.',
            phaseLabel: 'COMBAT',
        };
    }

    if (
        phase === GamePhase.BATTLE &&
        status === GameStatus.AI_TURN
    ) {
        return {
            message: 'Enemy turn... awaiting impact.',
            phaseLabel: 'COMBAT',
        };
    }

    /**
     * GAME 
     */
    if (phase === GamePhase.GAME_OVER) {
        return {
            message: 'Mission terminated.',
            phaseLabel: 'END',
        };
    }

    /**
     * Fallback
     */

    return {
        message: null,
        phaseLabel: '',
    };
}
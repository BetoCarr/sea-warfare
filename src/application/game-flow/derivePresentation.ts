import { GamePhase, GameStatus } from '@/lib/domain/game/game-types';
import { GamePresentation } from './game-flow-types';
import { stat } from 'fs';


export function derivePresentation(
    phase: GamePhase,
    status: GameStatus,
): GamePresentation {

    /**
     * SETUP
     */

    if (
        phase === GamePhase.SETUP &&
        status === GameStatus.IDLE
    ) {
        return {
            message: 'Initialize combat protocols...',
            phaseLabel: 'BOOT',
        };
    }

    /**
     * PLACEMENT
     */

    if (phase === GamePhase.PLACEMENT && status === GameStatus.PLACING_SHIPS) {
        return {
            message: 'Distribute your fleet across the sector',
            phaseLabel: 'DEPLOY',
        };
    }
    if (phase === GamePhase.PLACEMENT && status === GameStatus.FLEET_READY) {
        return {
            message: 'Fleet deployment complete. Awaiting orders.',
            phaseLabel: 'DEPLOY',
        };
    }

    /**
     * BATTLE
     */
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
     * GAME OVER
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
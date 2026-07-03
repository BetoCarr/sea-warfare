import { GameState } from '@/lib/domain/game/models/GameState';
import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus'
import { GamePresentation } from './game-flow-types';

export function derivePresentation(
    game: GameState,
): GamePresentation {

    const { phase, status } = game;

    if ( phase === GamePhase.SETUP ) {
        return {
            phaseLabel: 'BOOT',
            description: 'Combat systems are offline and awaiting initialization.',
        };
    }

    if ( phase === GamePhase.PLACEMENT) {
        return {
            phaseLabel: 'DEPLOY',
            description: 'Fleet deployment in progress.',
        };
    }

    if ( phase === GamePhase.BATTLE && status === GameStatus.PLAYER_TURN ) {
        return {
            phaseLabel: 'COMBAT',
            description: 'Your fleet has tactical initiative.',
        };
    }

    if ( phase === GamePhase.BATTLE && status === GameStatus.AI_TURN ) {
        return {
            phaseLabel: 'COMBAT',
            description: 'Enemy forces are executing their turn.',
        };
    }

    if (phase === GamePhase.GAME_OVER) {
        return {
            phaseLabel: 'END',
            description: 'The mission has concluded.',
        };
    }

    return {
        phaseLabel: '',
        description: null,
    };
}
import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';

import type { GameState } from '@/lib/domain/game/models/GameState';
import type { GamePresentation } from './game-flow-types';

export function derivePresentation(
    game: GameState,
): GamePresentation {

    const { phase, status } = game;

    if ( phase === GamePhase.SETUP ) {
        return {
            phaseLabel: 'BOOT',
            description: 'Combat systems are offline and awaiting initialization.',
            instruction: 'Initialize the game.',
        };
    }

    if ( phase === GamePhase.PLACEMENT) {
        return {
            phaseLabel: 'DEPLOY',
            description: 'Fleet deployment in progress.',
            instruction: null
        };
    }

    if ( phase === GamePhase.BATTLE && status === GameStatus.PLAYER_TURN ) {
        return {
            phaseLabel: 'COMBAT',
            description: 'Your fleet has tactical initiative.',
            instruction: 'Choose an enemy target.'
        };
    }

    if ( phase === GamePhase.BATTLE && status === GameStatus.AI_TURN ) {
        return {
            phaseLabel: 'COMBAT',
            description: 'Enemy forces are executing their turn.',
            instruction: null
        };
    }

    if (phase === GamePhase.GAME_OVER) {
        return {
            phaseLabel: 'END',
            description: 'The mission has concluded.',
            instruction: null
        };
    }

    return {
        phaseLabel: '',
        description: null,
        instruction: null
    };
}
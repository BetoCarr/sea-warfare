import { GamePhase } from '@/lib/domain/game/models/GamePhase';

import { GameStatus } from '@/lib/domain/game/models/GameStatus';

import { initialGameState } from '@/lib/domain/game/models/initialGameState';

import { initialGameplayState } from '@/lib/store/gameplay-store.initial';

export const placementGameState = {
    ...initialGameplayState,

    game: {
        ...initialGameState,
        phase: GamePhase.PLACEMENT,
    },
};
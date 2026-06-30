import { initialGameplayState } from '@/lib/store/gameplay/gameplay-store.initial';
import { initialGameState } from '@/lib/domain/game/models/initialGameState';
import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';

export const placementGameState = {
    ...initialGameplayState,

    game: {
        ...initialGameState,
        phase: GamePhase.PLACEMENT,
        status: GameStatus.PLACING_SHIPS,
    },
};
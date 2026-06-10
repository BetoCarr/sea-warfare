import { GamePhase, GameStatus } from '@/lib/domain/game/game-types';
import { initialGameplayState } from '@/lib/store/gameplay/gameplay-store.initial';

export const placementGameState = {
    ...initialGameplayState,
    phase: GamePhase.PLACEMENT,
    status: GameStatus.PLACING_SHIPS,
};

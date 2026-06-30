import { GamePhase } from '../../domain/game/models/GamePhase';
import { GameStatus } from '../../domain/game/models/GameStatus';
import type { ShipPlacement } from '../../domain/placement/models/ShipPlacement';
import { initialGameplayState } from './gameplay-store.initial';
import { useGameplayStore } from './gameplay-store';

function getGameplaySnapshot() {
    const state = useGameplayStore.getState();

    return {
        game: state.game,
        playerPlacements: state.playerPlacements,
        enemyPlacements: state.enemyPlacements,
    };
}

describe('useGameplayStore', () => {
    beforeEach(() => {
        useGameplayStore.setState(initialGameplayState);
    });

    it('should initialize with default gameplay state', () => {
        const state = useGameplayStore.getState();

        expect(state.game.phase).toBe(GamePhase.SETUP);
        expect(state.game.status).toBe(GameStatus.IDLE);

        expect(state.playerPlacements).toEqual([]);
        expect(state.enemyPlacements).toEqual([]);
    });

    it('should replace the game lifecycle state', () => {
        const store = useGameplayStore.getState();

        store.setGame({
            phase: GamePhase.BATTLE,
            status: GameStatus.PLAYER_TURN,
        });

        expect(useGameplayStore.getState().game).toEqual({
            phase: GamePhase.BATTLE,
            status: GameStatus.PLAYER_TURN,
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual([]);
        expect(useGameplayStore.getState().enemyPlacements).toEqual([]);
    });

    it('should replace player placements', () => {
        const store = useGameplayStore.getState();
        const playerPlacements: ShipPlacement[] = [
            {
                ship: { type: 'carrier', size: 5 },
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            },
        ];

        store.setPlayerPlacements(playerPlacements);

        expect(useGameplayStore.getState().playerPlacements).toEqual(playerPlacements);
    });

    it('should replace enemy placements', () => {
        const store = useGameplayStore.getState();
        const enemyPlacements: ShipPlacement[] = [
            {
                ship: { type: 'destroyer', size: 2 },
                origin: { row: 2, col: 3 },
                orientation: 'vertical',
            },
        ];

        store.setEnemyPlacements(enemyPlacements);

        expect(useGameplayStore.getState().enemyPlacements).toEqual(enemyPlacements);
    });

    it('should reset gameplay state to initial values', () => {
        const store = useGameplayStore.getState();

        store.setGame({
            phase: GamePhase.BATTLE,
            status: GameStatus.PLAYER_TURN,
        });
        store.setPlayerPlacements([
            {
                ship: { type: 'cruiser', size: 3 },
                origin: { row: 1, col: 1 },
                orientation: 'horizontal',
            },
        ]);
        store.setEnemyPlacements([
            {
                ship: { type: 'submarine', size: 3 },
                origin: { row: 4, col: 4 },
                orientation: 'vertical',
            },
        ]);

        store.resetGameplay();

        expect(getGameplaySnapshot()).toEqual(initialGameplayState);
    });

    it('should always reset to the same initial state', () => {
        const store = useGameplayStore.getState();

        store.setGame({
            phase: GamePhase.GAME_OVER,
            status: GameStatus.AI_TURN,
        });
        store.setPlayerPlacements([
            {
                ship: { type: 'battleship', size: 4 },
                origin: { row: 0, col: 2 },
                orientation: 'vertical',
            },
        ]);
        store.setEnemyPlacements([
            {
                ship: { type: 'carrier', size: 5 },
                origin: { row: 5, col: 5 },
                orientation: 'horizontal',
            },
        ]);

        store.resetGameplay();
        const firstReset = getGameplaySnapshot();

        store.setGame({
            phase: GamePhase.BATTLE,
            status: GameStatus.PLAYER_TURN,
        });
        store.setPlayerPlacements([
            {
                ship: { type: 'destroyer', size: 2 },
                origin: { row: 7, col: 7 },
                orientation: 'horizontal',
            },
        ]);
        store.setEnemyPlacements([
            {
                ship: { type: 'cruiser', size: 3 },
                origin: { row: 8, col: 8 },
                orientation: 'vertical',
            },
        ]);

        store.resetGameplay();
        const secondReset = getGameplaySnapshot();

        expect(firstReset).toEqual(secondReset);
        expect(firstReset).toEqual(initialGameplayState);
    });
});

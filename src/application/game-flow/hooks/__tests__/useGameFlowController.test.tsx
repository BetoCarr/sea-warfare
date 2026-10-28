import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { useGameFlowController } from '../useGameFlowController';

import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';

import { useGameplayStore } from '@/lib/store/gameplay-store';

import type { GameState } from '@/lib/domain/game/models/GameState';
import type { PlacementContract } from '@/application/placement/contract/placement-contract.types';
import type { GameFlowController, GameFlowFeedbackEvent } from '@/application/game-flow/game-flow-types';

jest.mock('@/lib/store/gameplay-store', () => ({
    useGameplayStore: jest.fn(),
}));

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

type PlacementInput = Pick<
    PlacementContract,
    'capabilities' | 'instruction' | 'feedback' | 'stats'
>;

type HookHarness = {
    getCurrent: () => GameFlowController | null;
    rerender: (placement: PlacementInput) => void;
    unmount: () => void;
};

let currentGame: GameState = {
    phase: GamePhase.SETUP,
};

const mockedUseGameplayStore = useGameplayStore as unknown as jest.Mock;

function createGameState(
    overrides: Partial<GameState> = {},
): GameState {
    return {
        phase: GamePhase.SETUP,
        ...overrides,
    };
}

function createFeedbackEvent(
    overrides: Partial<GameFlowFeedbackEvent> = {},
): GameFlowFeedbackEvent {
    return {
        id: 1,
        source: 'placement',
        message: 'Ship placed successfully.',
        ...overrides,
    };
}

function createPlacementInput(
    overrides: Partial<PlacementInput> = {},
): PlacementInput {
    return {
        capabilities: {
            canConfirmFleet: true,
        },
        instruction: 'Select ship',
        feedback: createFeedbackEvent(),
        stats: {
            remainingShips: 3,
            remainingShipTypes: [],
        },
        ...overrides,
    };
}

function createHookHarness(
    initialPlacement: PlacementInput,
): HookHarness {
    const container = document.createElement('div');
    const root = createRoot(container);

    let current: GameFlowController | null = null;

    function TestComponent({
        placement,
    }: {
        placement: PlacementInput;
    }): null {
        current = useGameFlowController({ placement });
        return null;
    }

    const render = (placement: PlacementInput) => {
        act(() => {
            root.render(
                React.createElement(
                    React.StrictMode,
                    null,
                    React.createElement(TestComponent, {
                        placement,
                    }),
                ),
            );
        });
    };

    render(initialPlacement);

    return {
        getCurrent: () => current,
        rerender: render,
        unmount: () => {
            act(() => {
                root.unmount();
            });

            container.remove();
        },
    };
}

describe('useGameFlowController', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        jest.useFakeTimers();

        currentGame = createGameState();

        mockedUseGameplayStore.mockImplementation(
            (selector: (state: { game: GameState }) => GameState) =>
                selector({ game: currentGame }),
        );
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('composes setup capabilities, presentation, and instruction', () => {
        const harness = createHookHarness(createPlacementInput());
        const flow = harness.getCurrent();

        expect(flow).toEqual({
            capabilities: {
                canInitializeGame: true,
                canRestartGame: false,
                canPlaceFleet: false,
                canConfirmFleet: false,
                canAttack: false,
            },
            presentation: {
                phaseLabel: 'BOOT',
                description: 'Combat systems are offline and awaiting initialization.',
            },
            instruction: 'Initialize the game.',
            feedback: null,
            stats: null,
        });

        harness.unmount();
    });

    it('composes Placement content and displays its feedback', () => {
        currentGame = createGameState({
            phase: GamePhase.PLACEMENT,
        });

        const placement = createPlacementInput();
        const harness = createHookHarness(placement);
        const flow = harness.getCurrent();

        expect(flow).toEqual({
            capabilities: {
                canInitializeGame: false,
                canRestartGame: false,
                canPlaceFleet: true,
                canConfirmFleet: true,
                canAttack: false,
            },
            presentation: {
                phaseLabel: 'DEPLOY',
                description: 'Fleet deployment in progress.',
            },
            instruction: 'Select ship',
            feedback: 'Ship placed successfully.',
            stats: 'Remaining ships: 3',
        });

        harness.unmount();
    });

    it('uses battle content during PLAYER_TURN without exposing Placement feedback or stats', () => {
        currentGame = createGameState({
            phase: GamePhase.BATTLE,
            status: GameStatus.PLAYER_TURN,
        });

        const harness = createHookHarness(createPlacementInput());
        const flow = harness.getCurrent();

        expect(flow).toEqual({
            capabilities: {
                canInitializeGame: false,
                canRestartGame: false,
                canPlaceFleet: false,
                canConfirmFleet: false,
                canAttack: true,
            },
            presentation: {
                phaseLabel: 'COMBAT',
                description: 'Your fleet has tactical initiative.',
            },
            instruction: 'Choose an enemy target.',
            feedback: null,
            stats: null,
        });

        harness.unmount();
    });

    it('does not enable attack or provide a global instruction during AI_TURN', () => {
        currentGame = createGameState({
            phase: GamePhase.BATTLE,
            status: GameStatus.AI_TURN,
        });

        const harness = createHookHarness(createPlacementInput());
        const flow = harness.getCurrent();

        expect(flow?.capabilities.canAttack).toBe(false);
        expect(flow?.instruction).toBeNull();
        expect(flow?.feedback).toBeNull();
        expect(flow?.stats).toBeNull();

        harness.unmount();
    });

    it('enables restart and excludes Placement content during GAME_OVER', () => {
        currentGame = createGameState({
            phase: GamePhase.GAME_OVER,
        });

        const harness = createHookHarness(createPlacementInput());
        const flow = harness.getCurrent();

        expect(flow?.capabilities.canRestartGame).toBe(true);
        expect(flow?.instruction).toBeNull();
        expect(flow?.feedback).toBeNull();
        expect(flow?.stats).toBeNull();

        harness.unmount();
    });

    it('clears Placement feedback after four seconds', () => {
        currentGame = createGameState({
            phase: GamePhase.PLACEMENT,
        });

        const harness = createHookHarness(createPlacementInput());

        expect(harness.getCurrent()?.feedback).toBe(
            'Ship placed successfully.',
        );

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(harness.getCurrent()?.feedback).toBeNull();

        harness.unmount();
    });
});
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { useGameFlowFeedback } from '../useGameFlowFeedback';

import type { GameFlowFeedbackEvent } from '@/application/game-flow/game-flow-types';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

type FeedbackProps = {
    event: GameFlowFeedbackEvent | null;
};

type HookHarness = {
    getCurrent: () => string | null;
    rerender: (props: FeedbackProps) => void;
    unmount: () => void;
};

function createHookHarness(initialProps: FeedbackProps): HookHarness {
    const container = document.createElement('div');
    const root = createRoot(container);
    let current: string | null = null;

    function TestComponent({ event }: FeedbackProps): null {
        current = useGameFlowFeedback(event);
        return null;
    }

    const render = (props: FeedbackProps) => {
        act(() => {
            root.render(
                React.createElement(
                    React.StrictMode,
                    null,
                    React.createElement(TestComponent, props),
                ),
            );
        });
    };

    render(initialProps);

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

describe('useGameFlowFeedback', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('keeps feedback visible for four seconds and does not resurrect an expired event', () => {
        const event = createFeedbackEvent();
        const harness = createHookHarness({ event });

        expect(harness.getCurrent()).toBe(event.message);

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(harness.getCurrent()).toBeNull();

        harness.rerender({ event });

        expect(harness.getCurrent()).toBeNull();
        expect(jest.getTimerCount()).toBe(0);

        harness.unmount();
    });

    it('restarts the duration for a new event with the same message', () => {
        const message = 'The ship overlaps another ship.';
        const firstEvent = createFeedbackEvent({
            id: 1,
            message,
        });
        const harness = createHookHarness({ event: firstEvent });

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        harness.rerender({
            event: createFeedbackEvent({
                id: 2,
                message,
            }),
        });

        expect(harness.getCurrent()).toBe(message);
        expect(jest.getTimerCount()).toBe(1);

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(harness.getCurrent()).toBe(message);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(harness.getCurrent()).toBeNull();

        harness.unmount();
    });

    it('clears feedback when the event becomes null and does not restore the old event', () => {
        const event = createFeedbackEvent();
        const harness = createHookHarness({ event });

        expect(harness.getCurrent()).toBe(event.message);
        expect(jest.getTimerCount()).toBe(1);

        harness.rerender({ event: null });

        expect(harness.getCurrent()).toBeNull();
        expect(jest.getTimerCount()).toBe(0);

        harness.rerender({ event });

        expect(harness.getCurrent()).toBeNull();
        expect(jest.getTimerCount()).toBe(0);

        harness.rerender({
            event: createFeedbackEvent({
                id: 2,
                message: 'Ship repositioned successfully.',
            }),
        });

        expect(harness.getCurrent()).toBe('Ship repositioned successfully.');
        expect(jest.getTimerCount()).toBe(1);

        harness.unmount();
    });

    it('treats events from different sources as distinct even when their IDs match', () => {
        const placementEvent = createFeedbackEvent({
            id: 1,
            source: 'placement',
            message: 'Ship placed successfully.',
        });
        const harness = createHookHarness({ event: placementEvent });

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        harness.rerender({
            event: createFeedbackEvent({
                id: 1,
                source: 'gameplay',
                message: 'Attack successful.',
            }),
        });

        expect(harness.getCurrent()).toBe('Attack successful.');
        expect(jest.getTimerCount()).toBe(1);

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(harness.getCurrent()).toBe('Attack successful.');

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(harness.getCurrent()).toBeNull();

        harness.unmount();
    });

    it('cleans up the feedback timer when the hook unmounts', () => {
        const harness = createHookHarness({
            event: createFeedbackEvent(),
        });

        expect(jest.getTimerCount()).toBe(1);

        harness.unmount();

        expect(jest.getTimerCount()).toBe(0);
    });
});
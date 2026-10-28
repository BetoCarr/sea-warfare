import { useEffect, useRef, useState } from 'react';

import type { GameFlowFeedbackEvent } from '../game-flow-types';

const FEEDBACK_DURATION = 4000;

export function useGameFlowFeedback(
    feedbackEvent: GameFlowFeedbackEvent | null,
): string | null {
    const [activeMessage, setActiveMessage] = useState<string | null>(null);

    const lastHandledEventRef = useRef<string | null>(null);
    const dismissedEventRef = useRef(false);

    const eventKey = feedbackEvent
        ? `${feedbackEvent.source}:${feedbackEvent.id}`
        : null;

    const message = feedbackEvent?.message ?? null;

    useEffect(() => {
        if (eventKey === null || message === null) {
            dismissedEventRef.current = true;
            setActiveMessage(null);
            return;
        }

        if (lastHandledEventRef.current === eventKey) {
            if (dismissedEventRef.current) {
                return;
            }
        } else {
            lastHandledEventRef.current = eventKey;
            dismissedEventRef.current = false;
        }

        setActiveMessage(message);

        const timeoutId = setTimeout(() => {
            dismissedEventRef.current = true;
            setActiveMessage(null);
        }, FEEDBACK_DURATION);

        return () => clearTimeout(timeoutId);
    }, [eventKey, message]);

    return activeMessage;
}
import { useEffect } from 'react';

type Params = {
    rotate: () => void;
};

/**
 * Placement keyboard interaction adapter.
 */
export function usePlacementKeyboardShortcuts({
    rotate,
}: Params): void {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') {
                rotate();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () =>
            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );
    }, [rotate]);
}
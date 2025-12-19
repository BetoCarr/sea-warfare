import { useGameStore } from "@/lib/store/game-store";
import { Button } from "@/components/ui/Button";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";

/**
 * OrientationToggle
 * ----------------------------------------------------------------------
 * Allows the player to toggle ship placement orientation between
 * Horizontal and Vertical.
 */
export const OrientationToggle = () => {
    const { orientation, toggleOrientation } = useGameStore(
        useShallow((state) => ({
            orientation: state.orientation,
            toggleOrientation: state.toggleOrientation,
        }))
    );

    const isHorizontal = orientation === "horizontal";

    // Keyboard shortcut 'R' for rotation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') {
                toggleOrientation();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleOrientation]);

    return (
        <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">
                Rotation:
            </span>
            <Button
                variant="secondary"
                onClick={toggleOrientation}
                className="flex items-center gap-2 min-w-[140px] justify-center"
                aria-label={`Current orientation: ${orientation}. Click to toggle.`}
            >
                {isHorizontal ? (
                    <>
                        <span className="text-xl">↔</span> Horizontal
                    </>
                ) : (
                    <>
                        <span className="text-xl">↕</span> Vertical
                    </>
                )}
            </Button>
            <span className="text-xs text-slate-500 hidden sm:inline-block">
                (Press 'R' to rotate)
            </span>
        </div>
    );
};

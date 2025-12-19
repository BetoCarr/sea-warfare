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
        <div className="flex flex-col items-center justify-center gap-1 mb-2">
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Rotation
                </span>
                <span className="text-[10px] text-slate-500">
                    ('R')
                </span>
            </div>
            
            <Button
                variant="secondary"
                onClick={toggleOrientation}
                className="flex items-center gap-2 w-full justify-center px-2 py-1 h-9 text-sm"
                aria-label={`Current orientation: ${orientation}. Click to toggle.`}
            >
                {isHorizontal ? (
                    <>
                        <span className="text-lg">↔</span> Horizontal
                    </>
                ) : (
                    <>
                        <span className="text-lg">↕</span> Vertical
                    </>
                )}
            </Button>
        </div>
    );
};

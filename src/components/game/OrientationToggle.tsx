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
        <button 
            onClick={toggleOrientation}
            className="group flex items-center gap-2 text-[8px] sm:text-[9px] text-slate-500/80 font-mono transition-colors hover:text-slate-300"
            aria-label={`Toggle orientation. Current: ${orientation}`}
        >
            <span className="bg-slate-800/50 px-1 rounded border border-slate-700/30 text-slate-400 font-bold transition-all group-hover:border-slate-500/50">
                R
            </span>
            <span className="italic uppercase tracking-wider">
                Rotate
            </span>
        </button>
    );
};

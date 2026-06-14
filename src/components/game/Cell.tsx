'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/utils'; // A utility function to combine class names
import type { Position } from '@/lib/domain/shared/models/Position';
import { CellVisualState } from '@/application/board/board-types';

interface CellProps {
    visualState: CellVisualState;
    position: Position;
    disabled?: boolean;
    onPress?: (pos: Position) => void;
    onHover?: (pos: Position) => void;
    onLeave?: () => void;
}


export default function Cell({
    visualState,    
    position,
    disabled = false,
    onPress,
    onHover,
    onLeave
}: CellProps) {

    // Local state used to trigger temporary animations (e.g., pulse on click)
    const [isAnimating, setIsAnimating] = useState(false);

    /**
     * Handles click interactions.
     * - Prevents interaction if disabled.
     * - Triggers temporary animation for hits/misses before calling parent handler.
     */
    const handleClick = () => {
        if (disabled) return;

        if (
            visualState === 'water' ||
            visualState === 'ship'
        ) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 250);
        }

        onPress?.(position);
    };

    const baseStyles =
        "w-full aspect-square flex items-center justify-center border transition-all duration-150 select-none text-sm font-bold";

    const visualStyles: Record<CellVisualState, string> = {
        water:
            "bg-slate-700 border-slate-500 hover:bg-slate-600",

        ship:
            "bg-slate-500 border-slate-300 text-white hover:bg-slate-400",

        hit:
            "bg-red-600 border-red-700 text-white shadow-inner shadow-red-900",

        miss:
            "bg-slate-500 border-slate-600 text-slate-300 opacity-70",

        sunk:
            "bg-red-800 border-red-900 text-white shadow-inner shadow-black/40",

        'preview-valid':
            "bg-emerald-500/50 border-emerald-400",

        'preview-invalid':
            "bg-red-500/40 border-red-400",
    };

    const disabledStyles =
        disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer";

    const animationStyles =
        isAnimating
            ? "animate-pulse scale-110"
            : "";

    const className = cn(
        baseStyles,
        visualStyles[visualState],
        disabledStyles,
        animationStyles
    );

    const contentMap: Record<CellVisualState, string> = {
        water: "",
        ship: "🚢",
        hit: "💥",
        miss: "○",
        sunk: "💀",
        'preview-valid': "",
        'preview-invalid': "",
    };

    const coord = `${String.fromCharCode(65 + position.col)}${position.row + 1}`;

    return (
        <button
            className={className}
            onClick={handleClick}
            onMouseEnter={() => {
                onHover?.(position);
            }}
            onMouseLeave={() => onLeave?.()}
            disabled={disabled}
            aria-label={`Cell ${coord}: ${visualState}`}
            data-testid={`cell-${position.row}-${position.col}`}
            data-state={visualState}
            title={coord}
        >
            <span className="pointer-events-none">
                {contentMap[visualState]}
            </span>
        </button>
    );


}
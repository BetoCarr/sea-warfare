'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils/utils';

import type { CellPresentation } from '@/application/board/board-types';
import type { Position } from '@/lib/domain/shared/models/Position';

interface CellProps {
    presentation: CellPresentation;
    position: Position;
    disabled?: boolean;
    onPress?: (pos: Position) => void;
    onHover?: (pos: Position) => void;
    onLeave?: () => void;
}


export default function Cell({
    presentation,
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
            presentation.visualState === 'water' ||
            presentation.visualState === 'ship'
        ) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 250);
        }

        onPress?.(position);
    };

    const baseStyles =
        "w-full aspect-square flex items-center justify-center border transition-all duration-150 select-none text-sm font-bold";

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
        presentation.className,
        disabledStyles,
        animationStyles
    );

    return (
        <button
            className={className}
            onClick={handleClick}
            onMouseEnter={() => {
                onHover?.(position);
            }}
            onMouseLeave={() => onLeave?.()}
            disabled={disabled}
            aria-label={presentation.ariaLabel}
            data-testid={`cell-${position.row}-${position.col}`}
            data-state={presentation.visualState}
            title={presentation.title}
        >
            <span className="pointer-events-none">
                {presentation.content}
            </span>
        </button>
    );


}
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/utils'; // A utility function to combine class names
import type { CellState, Position } from '@/lib/utils/types';

interface CellProps {
    state: CellState;           // Current state of the cell (determines style & content)
    position: Position;         // Grid coordinates (row/col) for accessibility & testing
    onClick: () => void;        // Callback triggered when the cell is clicked
    disabled?: boolean;         // Prevents interaction if true
    showShip?: boolean;         // Controls whether ships are visible to the player
    isHovered?: boolean;        // Used to highlight a cell during targeting/placement
    className?: string;         // Optional custom className for style overrides
}

/**
 * Cell component represents a single square in the game board.
 * 
 * - Visual state is determined by `CellState` (empty, ship, hit, miss, sunk).
 * - Includes accessibility labels for screen readers.
 * - Animations and hover effects provide user feedback.
 * - Can be configured to hide ships until revealed.
 */
export default function Cell({
    state,
    position,
    onClick,
    disabled = false,
    showShip = false,
    isHovered = false,
    className,
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
        
        // Trigger animation for hits/misses
        if (state === 'empty' || state === 'ship') {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
        }
        
        onClick();  
    };

    /**
     * Returns the appropriate Tailwind CSS classNames for the cell
     * based on its current state, hover state, and animation.
     */
    const getCellStyles = () => {
        // const baseStyles =
        //     "w-full aspect-square border transition-all duration-200 flex items-center justify-center text-sm font-bold select-none";
        const baseStyles =
            "w-full aspect-square border flex items-center justify-center " +
            "transition-all duration-150 select-none text-sm font-bold";
        
        const stateStyles: Record<CellState, string> = {
            // empty: "bg-blue-100 hover:bg-blue-200 border-slate-400 text-slate-800",
            // ship: showShip ? "bg-gray-600 hover:bg-gray-700 border-slate-600 text-white"
            //             : "bg-blue-100 hover:bg-blue-200 border-slate-400 text-slate-800",
            // hit: "bg-red-500 text-white border-red-600",
            // miss: "bg-blue-300 text-slate-600 border-sky-400",
            // sunk: "bg-red-700 text-white border-red-800",
            empty:
                "bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-300",
            
            ship: showShip
                ? "bg-slate-500 hover:bg-slate-400 border-slate-300 text-white"
                : "bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-300",

            hit:
                "bg-red-600 border-red-700 text-white shadow-inner shadow-red-900",

            miss:
                "bg-slate-500 border-slate-600 text-slate-300 opacity-70",

            sunk:
                "bg-red-800 border-red-900 text-white shadow-inner shadow-black/40",
        };

        // Disabled state
        const disabledStyles = disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer";

        // Hover effect for targeting
        const hoverStyles = isHovered && !disabled ? "ring-2 ring-yellow-400 ring-opacity-75 scale-105" : "";

        // Animation for new hits/misses
        const animationStyles = isAnimating ? "animate-pulse scale-110" : "";

        return cn(
            baseStyles,
            stateStyles[state],
            disabledStyles,
            hoverStyles,
            animationStyles,
            className ?? ""
        );
    };
    /**
     * Maps the cell's state to a visual symbol (emoji).
     * This makes it easy to identify game events at a glance.
     */
    const getCellContent = () => {
        switch (state) {
            case 'hit':
                return '💥'; // Hit explosion
            case 'miss':
                return '○'; // Miss marker  
            case 'sunk':
                return '💀'; // Sunk ship
            case 'ship':
                return showShip ? '🚢' : ''; // Ship (only if showShip is true)
            case 'empty':
            default:
                return '';
        }
    };
    /**
     * Provides an accessible label for screen readers.
     * Combines the grid position (e.g., "A1") with a description of the state.
     * Ensures visually impaired users can follow the game state.
     */
    const getCellAriaLabel = () => {
        const coord = `${String.fromCharCode(65 + position.col)}${position.row + 1}`;
        const stateDesc = {
            empty: 'empty water',
            ship: showShip ? 'your ship' : 'unknown',
            hit: 'hit ship',
            miss: 'missed shot',
            sunk: 'sunk ship'
        };
        
        return `Cell ${coord}: ${stateDesc[state]}`;
    };

    return (
        <button
            className={getCellStyles()}
            onClick={handleClick}
            disabled={disabled}
            aria-label={getCellAriaLabel()}
            data-testid={`cell-${position.row}-${position.col}`}
            data-state={state}
            title={`${String.fromCharCode(65 + position.col)}${position.row + 1}`}
        >
            <span className="pointer-events-none">
                {getCellContent()}
            </span>
        </button>
    );
}
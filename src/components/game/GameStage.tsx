"use client";

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/lib/store/game-store';
import { GamePhase } from '@/lib/store/game-types';
import { cn } from '@/lib/utils/utils';
import Board from './Board';
import { FeedbackMessage, FeedbackType } from '../hud/FeedbackMessage';

interface GameStageProps {
    activeMessage: string | null;
    activeType: FeedbackType;
    onDismissFeedback: () => void;
    onPlayerCellClick: (row: number, col: number) => void;
    onDrop: (row: number, col: number, e: React.DragEvent) => void;
    onDragOver: (row: number, col: number, e: React.DragEvent) => void;
    onBoardDragStart: (row: number, col: number, e: React.DragEvent) => void;
}

/**
 * GameStage
 * ------------------------------------------------------------
 * Manages the main game area, including the Board and 
 * the FeedbackMessage overlay.
 * 
 * Refactored from GameScreen to improve modularity.
 */
export const GameStage = ({
    activeMessage,
    activeType,
    onDismissFeedback,
    onPlayerCellClick,
    onDrop,
    onDragOver,
    onBoardDragStart
}: GameStageProps) => {
    const { phase, player } = useGameStore(
        useShallow((state) => ({
            phase: state.phase,
            player: state.player,
        }))
    );

    const playerBoard = player.boardState.board;

    return (
        <main className={cn(
            "flex-1 overflow-hidden flex flex-col items-stretch relative px-4 md:px-8",
            "transition-all duration-700 ease-in-out",
            phase === GamePhase.PLACEMENT && "md:pr-[280px]"
        )}>
            {/* 1. TOP SLOT: Feedback / Instructions (Stable Height) */}
            <div className="h-20 sm:h-24 flex items-center justify-center flex-none z-20 pointer-events-none">
                <FeedbackMessage 
                    message={activeMessage} 
                    type={activeType} 
                    onDismiss={onDismissFeedback}
                    className="pointer-events-auto shadow-xl backdrop-blur-md ring-1 ring-white/10"
                />
            </div>

            {/* 2. CENTER SLOT: The Main Engagement Area (Board) */}
            <div className="flex items-center justify-center min-h-0 py-2 sm:py-4">
                <div className="w-full max-w-full flex items-center justify-center transition-transform duration-500">
                    <Board
                        size={10}
                        cells={playerBoard}
                        isPlayerBoard={true}
                        onCellClick={onPlayerCellClick}
                        onCellDrop={onDrop}
                        onCellDragOver={onDragOver}
                        onCellDragStart={onBoardDragStart}
                        ships={player.ships}
                        forceShowShips={true}
                        disabled={phase === GamePhase.GAME_OVER}
                    />
                </div>
            </div>
        </main>
    );
};

"use client";

import React, { useReducer } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/lib/store/game-store';
import { GamePhase } from '@/lib/store/game-types';
import { cn } from '@/lib/utils/utils';
import { FooterPanel } from './FooterPanel';
import { ShipPalette } from '../game/ShipPalette';
import { ReadinessIndicators } from './ReadinessIndicators';
import { useShipPlacement } from '@/application/placement/useShipPlacement';
import { useShipPlacementMobileBridge } from '@/application/placement/mobile/useShipPlacementMobileBridge';

interface GameFooterProps {
    children?: React.ReactNode;
    className?: string;
}

/**
 * GameFooter
 * ------------------------------------------------------------
 * A smart responsive footer component for the game screen.
 * Automatically handles phase-based content (ShipPalette, Status, etc).
 */
export const GameFooter = ({ children, className }: GameFooterProps) => {
    const { phase, player } = useGameStore(
        useShallow((state) => ({
            phase: state.phase,
            player: state.player,
        }))
    );

    const placementCore = useShipPlacement();
    // const placementMobileBridge = useShipPlacementMobileBridge(placementCore);

    const renderContent = () => {
        if (children) return children;

        switch (phase) {
            case GamePhase.PLACEMENT:
                return (
                    <>

                        <FooterPanel className="w-full" title="Combat Operations">
                            <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px] tracking-widest uppercase py-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                Tactical Systems Online • Monitoring Sector
                            </div>
                        </FooterPanel>
                        {/* <FooterPanel className="flex-1" title="Fleet Command">
                            <ShipPalette
                                placedShips={player.ships.filter(s => s.position)}
                                selectedShipId={placementCore.state.selectedShipId}
                                onShipSelect={placementMobileBridge.mobileHandlers.onShipTap}
                            />
                        </FooterPanel>
                        <FooterPanel className="md:w-72" title="Deployment Status">
                            <ReadinessIndicators />
                        </FooterPanel> */}
                    </>
                );
            case GamePhase.BATTLE:
                return (
                    <FooterPanel className="w-full" title="Combat Operations">
                        <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px] tracking-widest uppercase py-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            Tactical Systems Online • Monitoring Sector
                        </div>
                    </FooterPanel>
                );
            case GamePhase.SETUP:
            case GamePhase.GAME_OVER:
                return (
                    <FooterPanel className="w-full" title="System Status">
                        <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px] tracking-widest uppercase py-1">
                            <div className="w-2 h-2 rounded-full bg-slate-700" />
                            {phase === GamePhase.GAME_OVER ? "Mission Terminated" : "Awaiting Protocol Initialization"}
                        </div>
                    </FooterPanel>
                );
            default:
                return null;
        }
    };

    return (
        <footer className={cn(
            "flex-none relative z-30 w-full px-4 pt-2 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.5)]",
            "pb-[calc(1rem+env(safe-area-inset-bottom))]",
            "max-h-[38dvh] min-h-0 overflow-y-auto no-scrollbar",
            "flex flex-col md:flex-row items-stretch md:items-center gap-3",
            "md:max-h-none md:overflow-visible",
            className
        )}>
            {renderContent()}
        </footer>
    );
};






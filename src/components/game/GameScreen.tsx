"use client";

import Board from "./Board";
import { GameHUD } from "../hud/GameHUD";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import type { Ship } from "@/lib/utils/types";
export function GameScreen() {

    const { player, ai, phase, currentTurn, playerAttack, placePlayerShip} = useGameStore(
        useShallow((state) => ({
            player: state.player,
            ai: state.ai,
            phase: state.phase,
            currentTurn: state.currentTurn,
            playerAttack: state.playerAttack,
            placePlayerShip: state.placePlayerShip,
        }))
    );

    const playerBoard = player.boardState.board;   // CellState[][]
    const aiBoard = ai.boardState.board;  

    // console.log("Player Board State:", playerBoard);
    // console.log("AI Board State:", aiBoard);
    
    // Callback para click en el tablero del jugador
    const handlePlayerCellClick = (row: number, col: number) => {
        console.log(`Player clicked on cell (${row}, ${col})`);
        // if (phase === "PLACEMENT") {
        //     // lógica para colocar barco
        // } else if (phase === "BATTLE" && currentTurn === "player") {
        //     makePlayerMove(row, col);
        // }
    };


    return (
        <main className="min-h-screen w-full bg-slate-900 text-white flex justify-center py-8 px-4">
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[1fr_0.6fr_1fr] gap-6">
                {/* Player Board */}
                <section className="bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col items-center pr-4">
                    <h2 className="text-center mb-3 text-lg font-semibold text-sky-300">
                        Your Fleet
                    </h2>
                    <Board
                        size={10}
                        cells={playerBoard}
                        isPlayerBoard={true}
                        ships={player.ships}
                        onCellClick={handlePlayerCellClick}
                        forceShowShips={true}
                        disabled={phase === GamePhase.GAME_OVER}
                    />
                </section>

                {/* Sidebar */}
                <section className="bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col gap-4 items-center">
                    <GameHUD />
                </section>

                {/* AI Board */}
                <section className="bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col items-center">
                    <h2 className="text-center mb-3 text-lg font-semibold text-red-300">
                        Enemy Waters
                    </h2>
                    {/* AIBoard */}
                </section>
            </div>
        </main>
    );
}
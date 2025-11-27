'use client';

import { useTemporaryGameStore } from "@/lib/stores/temporary-game-store";
import { GamePhase, GameStatus } from "@/lib/stores/game-types";

export default function Home() {
    const {
        phase,
        status,
        currentTurn,
        turnNumber,
        player,
        ai,
        lastAttack,

        initializeGame,
        startGame,
        resetGame,
        confirmPlacement,
        placePlayerShip,
        playerAttack,
    } = useTemporaryGameStore();


    const handleInit = () => {
        initializeGame({
        boardSize: 10,
        });
    };

    const handlePlaceTestShips = () => {
        const ships = [
            {
                id: 'ship-1',
                type: 'Carrier',
                size: 5,
                position: { row: 0, col: 0 },
                orientation: 'horizontal'
            },
            {
                id: 'ship-2',
                type: 'Battleship',
                size: 4,
                position: { row: 2, col: 0 },
                orientation: 'horizontal'
            },
            {
                id: 'ship-3',
                type: 'Cruiser',
                size: 3,
                position: { row: 4, col: 0 },
                orientation: 'horizontal'
            },
            {
                id: 'ship-4',
                type: 'Submarine',
                size: 3,
                position: { row: 6, col: 0 },
                orientation: 'horizontal'
            },
            {
                id: 'ship-5',
                type: 'Destroyer',
                size: 2,
                position: { row: 8, col: 0 },
                orientation: 'horizontal'
            },
        ];

        for (const ship of ships) {
            const result = placePlayerShip(ship as any);
            console.log(`🚢 Placing ${ship.type}:`, result);
        }
    };


    const handleConfirm = () => {
        const result = confirmPlacement();
        console.log('✅ confirmPlacement result:', result);
    };

    const handleStart = () => {
        const result = startGame();
        console.log('✅ startGame result:', result);
    };

    const handleReset = () => {
        resetGame();
    };
    const handleAttack = async () => {
        // posición de prueba, luego puedes hacerla dinámica
        const position = { row: 0, col: 0 };

        const result = await playerAttack(position);

        console.log("🎯 playerAttack result:", result);
    };
    return (
        <main className="min-h-screen bg-gray-900 text-white p-10 space-y-6">

        <h1 className="text-2xl font-bold">Zustand Slice Test</h1>

        {/* Estado actual */}
        <div className="space-y-2">
            <p><strong>Phase:</strong> {phase}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Ships placed:</strong> {player?.ships?.length ?? 0}</p>
            <p><strong>Player ready:</strong> {String(player?.isReady)}</p>
            <p><strong>AI ready:</strong> {String(ai?.isReady)}</p>
            <p><strong>Current turn:</strong> {currentTurn}</p>
            <p><strong>Turn number:</strong> {turnNumber}</p>

            {lastAttack && (
                <p>
                    <strong>Last attack:</strong> {lastAttack.by} → {lastAttack.type}
                </p>
            )}
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-4 pt-4">

            <button
                className="bg-blue-600 px-4 py-2 rounded"
                onClick={handleInit}
            >
                Initialize Game
            </button>

            <button
                className="bg-green-600 px-4 py-2 rounded"
                onClick={handlePlaceTestShips}
            >
                Place 5 test ships
            </button>

            <button
                className="bg-yellow-500 px-4 py-2 rounded text-black"
                onClick={handleConfirm}
            >
                Confirm placement
            </button>

            <button
                className="bg-purple-600 px-4 py-2 rounded"
                onClick={handleStart}
            >
                Start Game
            </button>
            <button
                className="bg-orange-600 px-4 py-2 rounded"
                onClick={handleAttack}
            >
                Player attack (0,0)
            </button>

            <button
                className="bg-red-600 px-4 py-2 rounded"
                onClick={handleReset}
            >
                Reset
            </button>
        </div>

        {/* Debug visual */}
        <div className="pt-8">
            <h2 className="text-xl mb-2">Player object</h2>
            <pre className="bg-black p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(player, null, 2)}
            </pre>
        </div>

        </main>
    );
}

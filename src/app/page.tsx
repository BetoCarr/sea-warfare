'use client';
import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/stores/game-store';
import { GamePhase } from '@/lib/stores/game-types';
// import { useGameStore } from '@/lib/game/store';
// import { GamePhase } from '@/lib/game/game-types';
import { createShip } from '@/lib/game-logic/ships/ship-factory';
import { createBoardState } from '@/lib/game-logic/board/board-sync';

export default function Page() {
    const initializeGame = useGameStore((s) => s.initializeGame);
    const playerAttack = useGameStore((s) => s.playerAttack);
    //   const set = useGameStore((s) => s.set); // si tienes set expuesto, o usa set directamente dentro de store

    useEffect(() => {
        async function runTest() {
            console.clear();
            console.group('=== 🧪 PlayerAttack Integration Test ===');

            // 1) Initialize clean game
            initializeGame({
                boardSize: 5,
                aiDifficulty: 'easy',
                allowShipRotation: true,
                showAIShips: true,
            });
            console.log('[Setup] Initialized game');

            // Give initializeGame a short moment (AI init scheduling)
            await new Promise(res => setTimeout(res, 300));

            // 2) Create a correct Destroyer using factory
            const destroyer = createShip('destroyer'); // correct type & hits
            const simpleAIShip = { ...destroyer, position: { row: 0, col: 0 }, orientation: 'horizontal' as const };

            // 3) Force state manually with a valid BoardState
            useGameStore.setState((draft) => {
                draft.phase = GamePhase.BATTLE;
                draft.ai.boardState = createBoardState([simpleAIShip], []);
                draft.ai.ships = [simpleAIShip];
                draft.currentTurn = 'player';
            });
            console.log('[Setup] AI board ready with one Destroyer at (0,0)-(0,1)');

            // 4) Attack sequence (hit -> miss -> sink)
            console.groupCollapsed('🚀 Attack Sequence');

            console.log('🎯 [1] Attack (0,0) → expect HIT');
            const res1 = await playerAttack({ row: 0, col: 0 });
            console.log('➡️ Result 1:', res1);
            console.log('State after attack 1:', useGameStore.getState());

            await new Promise(res => setTimeout(res, 500));

            console.log('💨 [2] Attack (2,2) → expect MISS');
            const res2 = await playerAttack({ row: 2, col: 2 });
            console.log('➡️ Result 2:', res2);
            console.log('State after attack 2:', useGameStore.getState());

            await new Promise(res => setTimeout(res, 500));

            console.log('💥 [3] Attack (0,1) → expect SUNK');
            const res3 = await playerAttack({ row: 0, col: 1 });
            console.log('➡️ Result 3:', res3);
            console.log('State after attack 3:', useGameStore.getState());

            console.groupEnd();
            console.groupEnd();
        }

        runTest();
    }, [initializeGame, playerAttack]);

    return <div className="p-6">Check console for playerAttack test logs</div>;
}

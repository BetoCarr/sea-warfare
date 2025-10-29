'use client';
import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/stores/game-store';
import { GamePhase } from '@/lib/stores/game-types';
import { GameStatus } from '@/lib/stores/game-types';
// import { useGameStore } from '@/lib/game/store';
// import { GamePhase } from '@/lib/game/game-types';
import { createShip } from '@/lib/game-logic/ships/ship-factory';
import { createBoardState } from '@/lib/game-logic/board/board-sync';

export default function Page() {
    const initializeGame = useGameStore((s) => s.initializeGame);
    const playerAttack = useGameStore((s) => s.playerAttack);
    const setPhase = useGameStore((s) => s.setPhase);
    const setStatus = useGameStore((s) => s.setStatus);
    //   const set = useGameStore((s) => s.set); // si tienes set expuesto, o usa set directamente dentro de store

    useEffect(() => {
        console.log('=== 🧪 Test: setPhase & setStatus ===');

        // 1️⃣ Inicializa el juego
        initializeGame({
            boardSize: 5,
            aiDifficulty: 'easy',
            allowShipRotation: true,
            showAIShips: true,
        });

        // 2️⃣ Cambiar manualmente de fase
        setTimeout(() => {
            console.log('➡️ Changing phase to BATTLE...');
            setPhase(GamePhase.BATTLE);

            console.log('➡️ Changing status to waiting_for_player...');
            setStatus(GameStatus.WAITING_FOR_PLAYER);

            console.log('✅ Updated game state:', useGameStore.getState());
        }, 1000);

        // 3️⃣ Ejecutar una pequeña prueba adicional del flujo existente
        const simpleAIShip = {
            id: 'ship-1',
            type: 'destroyer' as const,
            size: 2,
            position: { row: 0, col: 0 },
            orientation: 'horizontal' as const,
            hits: [],
            isSunk: false,
        };

        useGameStore.setState((draft) => {
            draft.ai.boardState = createBoardState([simpleAIShip], [], 5);
            draft.ai.ships = [simpleAIShip];
        });

        console.log('[Setup] ✅ AI board ready for extended tests.');
    }, []);;

    return <div className="p-6">Check console for playerAttack test logs</div>;
}

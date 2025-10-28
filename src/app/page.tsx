// 'use client';
// import React, { useEffect } from 'react';
// import { useGameStore } from '@/lib/stores/game-store';
// import { GamePhase } from '@/lib/stores/game-types';
// // import { useGameStore } from '@/lib/game/store';
// // import { GamePhase } from '@/lib/game/game-types';
// import { createBoardState } from '@/lib/game-logic/board/board-sync';

// export default function Page() {
//   const initializeGame = useGameStore((s) => s.initializeGame);
//   const playerAttack = useGameStore((s) => s.playerAttack);
//   const set = useGameStore((s) => s.set); // si tienes set expuesto, o usa set directamente dentro de store

//   useEffect(() => {
//     console.log('=== 🧪 Test: playerAttack simple ===');

//     // 1️⃣ Inicializar juego vacío
//     initializeGame({
//       boardSize: 5,
//       aiDifficulty: 'easy',
//       allowShipRotation: true,
//       showAIShips: true,
//     });

//     // 2️⃣ Crear un tablero de IA con un solo barco
//     const simpleAIShip = {
//       id: 'ship-1',
//       type: 'Destroyer' as const,
//       size: 2,
//       position: { row: 0, col: 0 },
//       orientation: 'horizontal' as const,
//       hits: [],
//       isSunk: false,
//     };

//     // 3️⃣ Forzar el tablero de IA directamente en el estado
//     useGameStore.setState((draft) => {
//       draft.phase = GamePhase.BATTLE;
//       draft.ai.boardState = createBoardState([simpleAIShip], []);
//       draft.ai.ships = [simpleAIShip];
//       draft.currentTurn = 'player';
//     });

//     console.log('[Setup] Simple AI board ready:', useGameStore.getState().ai.boardState);

//     // 4️⃣ Ejecutar ataque del jugador
//     const attackPosition = { row: 0, col: 0 };   // --- 5️⃣ Ejecutar ataques secuenciales ---
//     setTimeout(async () => {
//       console.group('🚀 Attack Sequence');

//       console.log('🎯 [1] Player attacks (0,0)');
//       const result1 = await playerAttack({ row: 0, col: 0 });
//       console.log('➡️ Result 1:', result1);
//       console.log('🧩 State after first attack:', useGameStore.getState());

//       // Segundo ataque: hundir el barco
//       setTimeout(async () => {
//           console.log('💨 [2] Player attacks (2,2)');
//           const result3 = await playerAttack({ row: 2, col: 2 });
//           console.log('➡️ Result 2:', result3);
//           console.log('🏁 Final Game State:', useGameStore.getState());

//         // Tercer ataque: fallar
//         setTimeout(async () => {
//           console.log('💥 [3] Player attacks (0,1)');
//           const result2 = await playerAttack({ row: 0, col: 1 });
//           console.log('➡️ Result 3:', result2);
//           console.log('🧩 State after second attack:', useGameStore.getState());

      

//           console.groupEnd();
//         }, 800);
//       }, 800);
//     }, 1000);   
//   }, []);

//   return <div className="p-6">Check console for playerAttack test logs</div>;
// }

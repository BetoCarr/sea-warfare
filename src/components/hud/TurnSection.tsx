// import { useGameStore } from "@/lib/store/game-store";
// import { GamePhase } from '@/lib/domain/game/models/GamePhase';
// import { useShallow } from "zustand/react/shallow";

// /**
//  * TurnSection
//  * Shows whose turn it is during the BATTLE phase.
//  * Uses Card, Section and Badge from the design system.
//  */
// export function TurnSection() {
//   const { phase, currentTurn } = useGameStore(
//     useShallow((state) => ({
//       phase: state.phase as GamePhase,
//       currentTurn: state.currentTurn,
//     }))
//   );

//   if (phase !== GamePhase.BATTLE) return null;

//   const isPlayerTurn = currentTurn === 'player';
//   // const turnColorClass = `text-[var(--color-turn-${currentTurn})]`;

//   return (
//     <div className="flex flex-col items-center justify-center gap-1 h-full">
//         <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">
//           BATTLE STATUS
//         </span>
//         <div className={`text-2xl font-black uppercase tracking-tight ${isPlayerTurn ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}>
//           {isPlayerTurn ? "YOUR TURN" : "ENEMY TURN"}
//         </div>
//     </div>
//   );
// }

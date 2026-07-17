
// import { useGameStore } from "@/lib/store/game-store";
// import { useShallow } from "zustand/react/shallow";

// export function FinalStats() {
//     const { moveHistory, player } = useGameStore(
//         useShallow((state) => ({
//             moveHistory: state.moveHistory,
//             player: state.player
//         }))
//     );

//     // Calculate Stats
//     // Total turns = max turnNumber in history
//     const totalTurns = moveHistory.length > 0 
//         ? Math.max(...moveHistory.map(m => m.turnNumber)) 
//         : 0;

//     // Player Accuracy: Hits / Total Player Moves
//     const playerMoves = moveHistory.filter(m => m.playerId === player.id);
//     const totalShots = playerMoves.length;
//     const hits = playerMoves.filter(m => m.result === 'hit' || m.result === 'sunk').length;
    
//     const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 0;

//     return (
//         <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
//             {/* Stat 1: Total Turns */}
//             <div className="flex flex-col items-center px-2">
//                 <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Turns</span>
//                 <span className="text-xl font-bold text-white">{totalTurns}</span>
//             </div>

//             <div className="w-px h-8 bg-slate-700" />

//             {/* Stat 2: Accuracy */}
//             <div className="flex flex-col items-center px-2">
//                 <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Accuracy</span>
//                 <div className="flex items-baseline gap-0.5">
//                     <span className={`text-xl font-bold ${accuracy > 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
//                         {accuracy}
//                     </span>
//                     <span className="text-sm text-slate-500">%</span>
//                 </div>
//             </div>
//         </div>
//     );
// }

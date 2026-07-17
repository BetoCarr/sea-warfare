// "use client";
// import { useGameStore } from "@/lib/store/game-store";
// import { useShallow } from "zustand/react/shallow";

// /**
//  * BoardStats displays hit/miss statistics for both player and AI boards.
//  *
//  * - Subscribes directly to the game store with a fine-grained selector.
//  * - Re-renders only when hit/miss counts change.
//  * - Avoids prop-drilling from GameHUD.
//  * - Purely presentational: no game logic, only derived state.
//  */
// export function BoardStats() {
//   const { playerHits, playerMisses, aiHits, aiMisses } = useGameStore(
//     useShallow((state) => ({
//       playerHits: state.player.boardState.hits.length,
//       playerMisses: state.player.boardState.misses.length,
//       aiHits: state.ai.boardState.hits.length,
//       aiMisses: state.ai.boardState.misses.length,
//     }))
//   );

//   return (
//     <div className="flex gap-4 h-full items-center">
//         {/* Player Stats Column */}
//         <div className="flex flex-col gap-1 min-w-[80px]">
//             <span className="text-[10px] uppercase font-bold text-slate-500 text-center">Your Board</span>
//             <div className="flex justify-between text-xs bg-slate-900/30 px-2 py-0.5 rounded">
//                 <span className="text-slate-400">Hits</span>
//                 <span className="font-bold text-red-400">{playerHits}</span>
//             </div>
//             <div className="flex justify-between text-xs bg-slate-900/30 px-2 py-0.5 rounded">
//                 <span className="text-slate-400">Miss</span>
//                 <span className="font-bold text-slate-300">{playerMisses}</span>
//             </div>
//         </div>

//         <div className="w-px h-12 bg-slate-700" />

//         {/* AI Stats Column */}
//         <div className="flex flex-col gap-1 min-w-[80px]">
//             <span className="text-[10px] uppercase font-bold text-emerald-500/70 text-center">Enemy Board</span>
//             <div className="flex justify-between text-xs bg-slate-900/30 px-2 py-0.5 rounded">
//                 <span className="text-slate-400">Hits</span>
//                 <span className="font-bold text-green-400">{aiHits}</span>
//             </div>
//             <div className="flex justify-between text-xs bg-slate-900/30 px-2 py-0.5 rounded">
//                 <span className="text-slate-400">Miss</span>
//                 <span className="font-bold text-slate-300">{aiMisses}</span>
//             </div>
//         </div>
//     </div>
//   );
// }

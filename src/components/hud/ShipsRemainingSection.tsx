// "use client";

// import { useGameStore } from "@/lib/store/game-store";
// import { useShallow } from "zustand/react/shallow";

// export function ShipsRemainingSection() {
//   const { playerRemaining, aiRemaining } = useGameStore(
//     useShallow((state) => ({
//       playerRemaining: state.player.ships.filter((s) => !s.isSunk).length,
//       aiRemaining: state.ai.ships.filter((s) => !s.isSunk).length,
//     }))
//   );

//   return (
//     <div className="flex flex-col gap-1 h-full justify-center min-w-[120px]">
//         <span className="text-[10px] uppercase font-bold text-slate-500 text-center mb-0.5">Ships Remaining</span>
//         <div className="flex justify-between items-center bg-slate-700/50 rounded px-2 py-0.5 border border-slate-600">
//             <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Player</span>
//             <span className="text-sm font-bold text-white">{playerRemaining}</span>
//         </div>
//         <div className="flex justify-between items-center bg-slate-700/50 rounded px-2 py-0.5 border border-slate-600">
//             <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Enemy</span>
//             <span className="text-sm font-bold text-white">{aiRemaining}</span>
//         </div>
//     </div>
//   );
// }

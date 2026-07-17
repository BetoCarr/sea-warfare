
// import { Button } from "@/components/ui/Button";
// import { useGameStore } from "@/lib/store/game-store";
// import { useShallow } from "zustand/react/shallow";

// export function GameOverSection() {
//     const { outcome, initializeGame } = useGameStore(
//         useShallow((state) => ({
//             outcome: state.outcome,
//             initializeGame: state.initializeGame,
//         }))
//     );

//     const isVictory = outcome?.winner === 'player';
//     const title = isVictory ? "VICTORY" : "DEFEAT";
//     const colorClass = isVictory ? "text-emerald-400" : "text-red-500";
    
//     return (
//         <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 animate-in fade-in zoom-in duration-500">
//             <h2 className={`text-3xl md:text-4xl font-black tracking-widest ${colorClass} drop-shadow-md`}>
//                 {title}
//             </h2>
            
//             <Button 
//                 variant="primary" 
//                 onClick={() => initializeGame({ boardSize: 10 })}
//                 className="animate-cta-pulse ring-2 ring-white/20 whitespace-nowrap"
//             >
//                 Initialize New Mission ↻
//             </Button>
//         </div>
//     );
// }

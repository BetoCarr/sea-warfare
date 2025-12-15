// "use client";

// import { useGameStore } from "@/lib/store/game-store";
// import clsx from "clsx";

// /**
//  * ShipPalette
//  * ------------------------------------------------------------
//  * UI component that displays all ships the player must place during the
//  * PLACEMENT phase. Each ship is rendered as a button that can be
//  * selected. Ships that are already placed are disabled. The currently
//  * selected ship is highlighted.
//  *
//  * It reads the placement slice from the global store:
//  *   - `ships`            : array of Ship objects (id, name, length, placed)
//  *   - `selectedShipId`   : id of the ship currently selected
//  *   - `selectShip`       : action to select a ship
//  */
// export const ShipPalette = () => {
//   const { ships, selectedShipId, selectShip } = useGameStore((state) => ({
//     ships: state.player.ships, // Updated to use state.player.ships as per latest store structure
//     selectedShipId: state.placement?.selectedShipId, // Safely access placement slice
//     selectShip: state.placement?.selectShip,
//   }));

//   // Guard clause if placement slice or ships are not available
//   if (!ships || !selectShip) return null;

//   return (
//     <div className="flex flex-wrap gap-2 sm:flex-row">
//       {ships.map((ship) => (
//         <button
//           key={ship.id}
//           disabled={!!ship.position} // Ship is placed if it has a position
//           onClick={() => selectShip(ship.id)}
//           className={clsx(
//             "flex items-center justify-center p-2 rounded transition-colors border",
//             ship.position
//               ? "bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
//               : selectedShipId === ship.id
//               ? "bg-sky-600 text-white border-sky-400 font-semibold shadow-md"
//               : "bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
//           )}
//           aria-label={`Select ${ship.name}, length ${ship.length}`}
//           aria-pressed={selectedShipId === ship.id}
//           aria-disabled={!!ship.position}
//         >
//           <span className="text-sm">{ship.name}</span>
//           <span className="ml-1 text-xs opacity-70">({ship.length})</span>
//         </button>
//       ))}
//     </div>
//   );
// };
